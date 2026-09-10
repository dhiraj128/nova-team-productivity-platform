(process.env as any).NODE_ENV = 'test';
import { db } from '../lib/db';
import bcrypt from 'bcryptjs';

// Import Route Handlers for HTTP endpoint testing
import { GET as getNotifications, PATCH as patchNotifications } from '../app/api/notifications/route';
import { GET as getProjects, POST as createProject } from '../app/api/projects/route';
import { GET as getTasks, POST as createTask } from '../app/api/tasks/route';
import { PATCH as patchTask } from '../app/api/tasks/[id]/route';
import { POST as createSubtask, PATCH as patchSubtask } from '../app/api/tasks/[id]/subtasks/route';
import { GET as getComments, POST as createComment } from '../app/api/tasks/[id]/comments/route';
import { GET as searchAPI } from '../app/api/search/route';

// Mock NextAuth session helper
import * as nextAuth from 'next-auth';

function mockSession(user: { id: string; email: string; name: string } | null) {
  if (!user) {
    (global as any).__MOCK_SESSION__ = null;
  } else {
    (global as any).__MOCK_SESSION__ = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}

async function runAPIE2ETests() {
  console.log('🧪 Starting NOVA HTTP API, Security & E2E System Verification Suite...\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string) => {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      failed++;
    }
  };

  try {
    // ----------------------------------------------------
    // 1. DATABASE & CANDIDATE USER VERIFICATION
    // ----------------------------------------------------
    console.log('1. Primary Candidate & Database Setup Audit');
    const dheeraj = await db.user.findUnique({ where: { email: 'dheeraj@nova.app' } });
    assert(!!dheeraj, 'Candidate Dheeraj Kumar exists in database');
    assert(dheeraj?.name === 'Dheeraj Kumar', 'Candidate name is Dheeraj Kumar');

    if (dheeraj?.password) {
      const pwValid = await bcrypt.compare('password123', dheeraj.password);
      assert(pwValid, 'bcrypt password verification for dheeraj@nova.app succeeds');
    }

    const userId = dheeraj!.id;

    // Create a secondary user for multi-user isolation testing
    let userB = await db.user.findUnique({ where: { email: 'userB@nova.app' } });
    if (!userB) {
      userB = await db.user.create({
        data: {
          name: 'User B',
          email: 'userB@nova.app',
          password: await bcrypt.hash('password123', 10),
          role: 'Member',
        },
      });
    }

    // ----------------------------------------------------
    // 2. SECURITY & AUTHENTICATION BLOCKER AUDIT (Unauthenticated vs Authenticated)
    // ----------------------------------------------------
    console.log('\n2. Security & Unauthenticated Access Control Audit');

    // Test unauthenticated requests -> Must return HTTP 401
    mockSession(null);

    const unauthNotifsRes = await getNotifications(new Request('http://localhost:3000/api/notifications'));
    assert(unauthNotifsRes.status === 401, 'Unauthenticated GET /api/notifications returns 401 Unauthorized');

    const unauthProjectsRes = await getProjects(new Request('http://localhost:3000/api/projects'));
    assert(unauthProjectsRes.status === 401, 'Unauthenticated GET /api/projects returns 401 Unauthorized');

    const unauthTasksRes = await getTasks(new Request('http://localhost:3000/api/tasks'));
    assert(unauthTasksRes.status === 401, 'Unauthenticated GET /api/tasks returns 401 Unauthorized');

    const unauthSearchRes = await searchAPI(new Request('http://localhost:3000/api/search?q=NOVA'));
    assert(unauthSearchRes.status === 401, 'Unauthenticated GET /api/search returns 401 Unauthorized');

    // ----------------------------------------------------
    // 3. NOTIFICATIONS ISOLATION AUDIT (User A vs User B)
    // ----------------------------------------------------
    console.log('\n3. Notifications User Isolation Security Audit');

    // Create notification specifically for User B
    const notifB = await db.notification.create({
      data: {
        userId: userB.id,
        title: 'Secret Notification for User B',
        message: 'Confidential message',
        read: false,
      },
    });

    // Log in as Dheeraj (User A)
    mockSession({ id: userId, email: 'dheeraj@nova.app', name: 'Dheeraj Kumar' });

    const dheerajNotifsRes = await getNotifications(new Request('http://localhost:3000/api/notifications'));
    const dheerajNotifs = await dheerajNotifsRes.json();
    const containsUserBNotif = dheerajNotifs.some((n: any) => n.id === notifB.id);
    assert(!containsUserBNotif, 'Dheeraj cannot see User B notifications in GET /api/notifications');

    // Dheeraj attempts to mark User B notification as read -> Must be rejected (404/Access Denied)
    const illegalMarkRes = await patchNotifications(
      new Request('http://localhost:3000/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notifB.id }),
      })
    );
    assert(illegalMarkRes.status === 404, 'Dheeraj marking User B notification read returns 404 Access Denied');

    // Clean up test notification for User B
    await db.notification.delete({ where: { id: notifB.id } });

    // ----------------------------------------------------
    // 4. PROJECT CRUD VIA HTTP API AUDIT
    // ----------------------------------------------------
    console.log('\n4. Project CRUD via HTTP API Audit');

    const createProjectReq = new Request('http://localhost:3000/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'E2E Test Project Alpha',
        description: 'Automated test workspace project',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
      }),
    });

    const createProjRes = await createProject(createProjectReq);
    assert(createProjRes.status === 201, 'POST /api/projects returns HTTP 201 Created');
    const createdProject = await createProjRes.json();
    assert(createdProject.name === 'E2E Test Project Alpha', 'Created project name matches input');
    const projectId = createdProject.id;

    // ----------------------------------------------------
    // 5. KANBAN TASK STATUS TRANSITION & DRAG-AND-DROP API AUDIT
    // ----------------------------------------------------
    console.log('\n5. Kanban Task Drag-and-Drop & Status Transition API Audit');

    // Create task with TODO status
    const createTaskReq = new Request('http://localhost:3000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Implement Kanban State Machine',
        description: 'Verify drag and drop persistence over API',
        status: 'TODO',
        priority: 'URGENT',
        projectId: projectId,
      }),
    });

    const createTaskRes = await createTask(createTaskReq);
    assert(createTaskRes.status === 201, 'POST /api/tasks returns 201 Created');
    const createdTask = await createTaskRes.json();
    const taskId = createdTask.id;
    assert(createdTask.status === 'TODO', 'Task initially created with TODO status');

    // Drag-and-drop move: TODO -> IN_PROGRESS via PATCH /api/tasks/[id]
    const moveInProgressReq = new Request(`http://localhost:3000/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'IN_PROGRESS' }),
    });

    const moveInProgressRes = await patchTask(moveInProgressReq, { params: { id: taskId } });
    assert(moveInProgressRes.status === 200, 'PATCH /api/tasks/[id] to IN_PROGRESS returns 200 OK');
    const taskInProgress = await moveInProgressRes.json();
    assert(taskInProgress.status === 'IN_PROGRESS', 'Task status updated to IN_PROGRESS via API');

    // Move to REVIEW
    const moveReviewReq = new Request(`http://localhost:3000/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'REVIEW' }),
    });
    const moveReviewRes = await patchTask(moveReviewReq, { params: { id: taskId } });
    assert((await moveReviewRes.json()).status === 'REVIEW', 'Task status updated to REVIEW via API');

    // Move to COMPLETED
    const moveCompletedReq = new Request(`http://localhost:3000/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'COMPLETED' }),
    });
    const moveCompletedRes = await patchTask(moveCompletedReq, { params: { id: taskId } });
    assert((await moveCompletedRes.json()).status === 'COMPLETED', 'Task status updated to COMPLETED via API');

    // Verify Database Persistence & Activity Log creation
    const dbTask = await db.task.findUnique({ where: { id: taskId } });
    assert(dbTask?.status === 'COMPLETED', 'Task status in database is COMPLETED');

    const activityLogs = await db.activity.findMany({ where: { taskId: taskId } });
    assert(activityLogs.length > 0, 'Activity log records generated for task status updates');

    // ----------------------------------------------------
    // 6. PROGRESS MATH & DIVISION BY ZERO DEFENSE AUDIT
    // ----------------------------------------------------
    console.log('\n6. Progress Calculation & Boundary Defense Audit');

    const calculateProgress = (completed: number, total: number) => {
      if (total === 0) return 0;
      return Math.round((completed / total) * 100);
    };

    assert(calculateProgress(0, 0) === 0, 'Progress with 0 total tasks is 0% (No Division by Zero)');
    assert(calculateProgress(1, 1) === 100, 'Progress with 1/1 completed is 100%');
    assert(calculateProgress(1, 3) === 33, 'Progress with 1/3 completed is 33%');

    // ----------------------------------------------------
    // 7. SUBTASKS API & CHECKLIST TOGGLE AUDIT
    // ----------------------------------------------------
    console.log('\n7. Subtasks API & Checklist Toggle Audit');

    const createSubtaskReq = new Request(`http://localhost:3000/api/tasks/${taskId}/subtasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Subtask 1: Write integration tests', completed: false }),
    });

    const createSubtaskRes = await createSubtask(createSubtaskReq, { params: { id: taskId } });
    assert(createSubtaskRes.status === 201, 'POST /api/tasks/[id]/subtasks returns 201 Created');
    const createdSubtask = await createSubtaskRes.json();
    assert(createdSubtask.completed === false, 'Subtask initially created as uncompleted');

    // Toggle subtask completion via PATCH /api/tasks/[id]/subtasks
    const toggleSubtaskReq = new Request(`http://localhost:3000/api/tasks/${taskId}/subtasks`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subtaskId: createdSubtask.id, completed: true }),
    });

    const toggleSubtaskRes = await patchSubtask(toggleSubtaskReq, { params: { id: taskId } });
    assert(toggleSubtaskRes.status === 200, 'PATCH /api/tasks/[id]/subtasks returns 200 OK');
    const updatedSubtask = await toggleSubtaskRes.json();
    assert(updatedSubtask.completed === true, 'Subtask successfully toggled to completed');

    // ----------------------------------------------------
    // 8. COMMENTS & COLLABORATION API AUDIT
    // ----------------------------------------------------
    console.log('\n8. Comments & Collaboration API Audit');

    const createCommentReq = new Request(`http://localhost:3000/api/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'E2E test comment verifying real-time feed' }),
    });

    const createCommentRes = await createComment(createCommentReq, { params: { id: taskId } });
    assert(createCommentRes.status === 201, 'POST /api/tasks/[id]/comments returns 201 Created');
    const createdComment = await createCommentRes.json();
    assert(createdComment.content === 'E2E test comment verifying real-time feed', 'Comment content matches input');

    const getCommentsRes = await getComments(new Request(`http://localhost:3000/api/tasks/${taskId}/comments`), { params: { id: taskId } });
    const commentsList = await getCommentsRes.json();
    assert(commentsList.some((c: any) => c.id === createdComment.id), 'Comment appears in task comments feed');

    // ----------------------------------------------------
    // 9. GLOBAL SEARCH API AUDIT
    // ----------------------------------------------------
    console.log('\n9. Global Search API Audit');

    const searchRes = await searchAPI(new Request('http://localhost:3000/api/search?q=Alpha'));
    assert(searchRes.status === 200, 'GET /api/search returns 200 OK');
    const searchData = await searchRes.json();
    assert(Array.isArray(searchData.projects), 'Search response contains projects array');
    assert(Array.isArray(searchData.tasks), 'Search response contains tasks array');
    assert(Array.isArray(searchData.members), 'Search response contains members array');
    assert(searchData.projects.some((p: any) => p.id === projectId), 'Search finds newly created test project');

    // ----------------------------------------------------
    // 10. CLEANUP
    // ----------------------------------------------------
    console.log('\n10. Temporary Test Data Cleanup');
    await db.comment.deleteMany({ where: { taskId } });
    await db.subtask.deleteMany({ where: { taskId } });
    await db.activity.deleteMany({ where: { taskId } });
    await db.task.delete({ where: { id: taskId } });
    await db.project.delete({ where: { id: projectId } });
    console.log('  🧹 Cleaned up test task, subtasks, comments, activity logs, and test project');

    console.log(`\n============================================================`);
    console.log(`AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`============================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error: any) {
    console.error('❌ E2E Audit Fatal Error:', error);
    process.exit(1);
  }
}

runAPIE2ETests();
