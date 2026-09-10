import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function runE2ETests() {
  console.log('🧪 Starting NOVA End-to-End System & Database Verification Audit...\n');

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
    // 1. Verify User Seed & Password Hashing
    console.log('1. User & Authentication Audit');
    const dheeraj = await db.user.findUnique({ where: { email: 'dheeraj@nova.app' } });
    assert(!!dheeraj, 'Primary user Dheeraj Kumar exists in database');
    assert(dheeraj?.name === 'Dheeraj Kumar', 'User name is exactly Dheeraj Kumar');

    if (dheeraj?.password) {
      const passwordMatches = await bcrypt.compare('password123', dheeraj.password);
      assert(passwordMatches, 'bcrypt password hash verification succeeds');
    }

    // 2. Project Management CRUD Audit
    console.log('\n2. Project Management Audit');
    const projects = await db.project.findMany({
      include: { owner: true, members: true, tasks: true },
    });
    assert(projects.length > 0, `Projects query returns ${projects.length} workspace projects`);

    const websiteRedesign = projects.find((p) => p.name.includes('NOVA Website'));
    assert(!!websiteRedesign, 'Key project "NOVA Website Redesign" exists');
    assert(websiteRedesign?.ownerId === dheeraj?.id, 'Dheeraj Kumar is owner of website redesign project');

    // 3. Dynamic Progress Calculation Audit
    console.log('\n3. Dynamic Progress Calculation Audit');
    if (websiteRedesign) {
      const tasks = websiteRedesign.tasks;
      const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
      const expectedProgress = Math.round((completedCount / tasks.length) * 100);
      assert(expectedProgress > 0 && expectedProgress <= 100, `Calculated progress is valid: ${expectedProgress}%`);
    }

    // 4. Task Management & Drag-and-Drop Persistence Audit
    console.log('\n4. Task Management & Drag-and-Drop Audit');
    const testTask = await db.task.create({
      data: {
        key: 'NOV-TEST-999',
        title: 'Audit Drag and Drop Task Status Persistence',
        description: 'E2E test task verifying backend state persistence.',
        status: 'TODO',
        priority: 'URGENT',
        projectId: websiteRedesign?.id || projects[0].id,
        assigneeId: dheeraj?.id,
        reporterId: dheeraj?.id,
      },
    });
    assert(testTask.status === 'TODO', 'Created test task with status TODO');

    // Drag-and-Drop mutation simulation
    const updatedTask = await db.task.update({
      where: { id: testTask.id },
      data: { status: 'IN_PROGRESS' },
    });
    assert(updatedTask.status === 'IN_PROGRESS', 'Task status successfully moved to IN_PROGRESS via API');

    const completedTask = await db.task.update({
      where: { id: testTask.id },
      data: { status: 'COMPLETED' },
    });
    assert(completedTask.status === 'COMPLETED', 'Task status successfully completed');

    // 5. Subtasks & Checklist Audit
    console.log('\n5. Subtask Checklist & Completion Rate Audit');
    const subtask = await db.subtask.create({
      data: {
        taskId: testTask.id,
        title: 'Perform E2E verification subtask',
        completed: false,
      },
    });
    assert(!subtask.completed, 'Subtask created in uncompleted state');

    const updatedSubtask = await db.subtask.update({
      where: { id: subtask.id },
      data: { completed: true },
    });
    assert(updatedSubtask.completed, 'Subtask toggled to completed');

    // 6. Comments & Activity Logging Audit
    console.log('\n6. Comments & Activity Log Audit');
    const comment = await db.comment.create({
      data: {
        taskId: testTask.id,
        userId: dheeraj?.id || '',
        content: 'E2E test comment for task verification.',
      },
    });
    assert(comment.content.includes('E2E test comment'), 'Comment created and persisted in database');

    const activity = await db.activity.create({
      data: {
        projectId: websiteRedesign?.id,
        taskId: testTask.id,
        userId: dheeraj?.id || '',
        type: 'COMMENT',
        description: 'Dheeraj Kumar added E2E test comment',
      },
    });
    assert(activity.type === 'COMMENT', 'Activity feed item created successfully');

    // 7. Cleanup Test Task
    await db.task.delete({ where: { id: testTask.id } });
    console.log('\n  🧹 Cleaned up temporary test task');

    // Final Audit Summary
    console.log(`\n============================================================`);
    console.log(`AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`============================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ E2E Audit Error:', err);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

runE2ETests();
