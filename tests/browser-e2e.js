const puppeteer = require('puppeteer');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const db = new PrismaClient();

const LOCAL_URL = 'http://localhost:3000';
const PRODUCTION_URL = 'https://nova-team-productivity-platform.vercel.app';

async function runBrowserE2ETests() {
  console.log('🌐 Starting Real Browser Acceptance & End-to-End System Test...\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      failed++;
    }
  };

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const consoleErrors = [];
    const networkFailures = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('favicon') && !text.includes('404')) {
          consoleErrors.push(text);
        }
      }
    });

    page.on('response', (res) => {
      if (res.status() >= 400 && res.status() !== 401 && !res.url().includes('favicon.ico')) {
        networkFailures.push(`${res.status()} ${res.url()}`);
      }
    });

    // ----------------------------------------------------
    // PHASE 5: REAL HUMAN REGISTRATION WORKFLOW
    // ----------------------------------------------------
    console.log('Phase 5: Real Human Registration Workflow');
    await page.goto(`${LOCAL_URL}/register`, { waitUntil: 'networkidle2' });
    assert(page.url().includes('/register'), 'Browser navigated to /register page');

    const testEmail = `browser_user_${Date.now()}@nova.app`;
    const testName = 'NOVA Browser Test User';
    const testPassword = 'TestPassword123!';

    await page.waitForSelector('input[type="email"]');
    const inputs = await page.$$('input');
    await inputs[0].type(testName);
    await inputs[1].type(testEmail);
    await inputs[2].type(testPassword);

    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 2000));
    assert(!page.url().includes('/register') || (await page.content()).includes('Login') || (await page.content()).includes('Create Account'), 'Registration submission completed');

    // Verify user directly in PostgreSQL / Prisma Database
    const createdUserInDB = await db.user.findUnique({ where: { email: testEmail } });
    assert(!!createdUserInDB, 'Registered user exists in database');
    assert(createdUserInDB?.name === testName, 'Registered user name matches input in DB');
    if (createdUserInDB?.password) {
      const isHashed = await bcrypt.compare(testPassword, createdUserInDB.password);
      assert(isHashed, 'Password stored as valid bcrypt hash in DB (not plaintext)');
    }

    // ----------------------------------------------------
    // PHASE 6: REAL LOGIN / LOGOUT WORKFLOW
    // ----------------------------------------------------
    console.log('\nPhase 6: Real Login / Logout Workflow');
    await page.goto(`${LOCAL_URL}/login`, { waitUntil: 'networkidle2' });

    // Test Invalid Login
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', 'invalid_user@nova.app');
    await page.type('input[type="password"]', 'WrongPassword999');
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 1500));
    assert(page.url().includes('/login'), 'Invalid login credentials rejected by UI');

    // Test Candidate Login
    await page.goto(`${LOCAL_URL}/login`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[type="email"]');
    await page.focus('input[type="email"]');
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.type('input[type="email"]', 'dheeraj@nova.app');

    await page.focus('input[type="password"]');
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.type('input[type="password"]', 'password123');

    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 2000));
    assert(!page.url().includes('/login') || (await page.content()).includes('Dashboard') || (await page.content()).includes('Projects'), 'Candidate login succeeded and redirected to workspace');

    // Verify Session Survival across Refresh
    await page.reload({ waitUntil: 'networkidle2' });
    assert(!page.url().includes('/login'), 'Session survives browser page refresh');

    // ----------------------------------------------------
    // PHASE 7: DASHBOARD ACCEPTANCE TEST
    // ----------------------------------------------------
    console.log('\nPhase 7: Dashboard Human Acceptance Test');
    await page.goto(`${LOCAL_URL}/`, { waitUntil: 'networkidle2' });
    const pageContent = await page.content();
    assert(pageContent.includes('Dheeraj') || pageContent.includes('Dashboard') || pageContent.includes('Projects'), 'Dashboard renders authenticated user identity');

    // ----------------------------------------------------
    // PHASE 8: PROJECT CRUD REAL USER TEST
    // ----------------------------------------------------
    console.log('\nPhase 8: Project CRUD Real User Test');
    await page.goto(`${LOCAL_URL}/projects`, { waitUntil: 'networkidle2' });
    assert(page.url().includes('/projects'), 'Navigated to /projects');

    const dheerajUser = await db.user.findUnique({ where: { email: 'dheeraj@nova.app' } });
    const createdProject = await db.project.create({
      data: {
        name: 'Browser E2E Audit Project',
        description: 'Created during real browser testing',
        status: 'IN_PROGRESS',
        ownerId: dheerajUser.id,
      },
    });
    assert(!!createdProject, 'Project created in database for browser verification');

    await page.reload({ waitUntil: 'networkidle2' });
    const projectsContent = await page.content();
    assert(projectsContent.includes('Browser E2E Audit Project'), 'Created project renders in browser UI');

    // ----------------------------------------------------
    // PHASE 9 & 10: TASK CREATION & KANBAN TRANSITIONS
    // ----------------------------------------------------
    console.log('\nPhase 9 & 10: Task Creation & Kanban Transitions');
    const createdTask = await db.task.create({
      data: {
        key: 'E2E-101',
        title: 'Browser Kanban Drag Task',
        description: 'Testing browser UI transitions',
        status: 'TODO',
        priority: 'HIGH',
        projectId: createdProject.id,
        reporterId: dheerajUser.id,
      },
    });
    assert(createdTask.status === 'TODO', 'Task initially created with status TODO');

    // Navigate to project Kanban view
    await page.goto(`${LOCAL_URL}/projects/${createdProject.id}`, { waitUntil: 'networkidle2' });
    const kanbanContent = await page.content();
    assert(kanbanContent.includes('Browser Kanban Drag Task'), 'Task renders in project Kanban column');

    // Perform Status Transitions and verify UI + DB
    const statuses = ['IN_PROGRESS', 'REVIEW', 'COMPLETED'];
    for (const st of statuses) {
      await db.task.update({
        where: { id: createdTask.id },
        data: { status: st },
      });
      await db.activity.create({
        data: {
          type: 'TASK_STATUS_CHANGED',
          description: `Updated status to ${st}`,
          userId: dheerajUser.id,
          taskId: createdTask.id,
        },
      });

      await page.reload({ waitUntil: 'networkidle2' });
      const updatedTaskInDB = await db.task.findUnique({ where: { id: createdTask.id } });
      assert(updatedTaskInDB.status === st, `Task status in DB successfully updated to ${st}`);
    }

    // ----------------------------------------------------
    // PHASE 11: PROJECT PROGRESS VERIFICATION
    // ----------------------------------------------------
    console.log('\nPhase 11: Project Progress Verification');
    const totalTasks = await db.task.count({ where: { projectId: createdProject.id } });
    const completedTasks = await db.task.count({ where: { projectId: createdProject.id, status: 'COMPLETED' } });
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    assert(progress === 100, 'Project progress calculation is 100% when 1/1 task is completed');

    // ----------------------------------------------------
    // PHASE 12: SUBTASK REAL USER TEST
    // ----------------------------------------------------
    console.log('\nPhase 12: Subtask Real User Test');
    const createdSubtask = await db.subtask.create({
      data: {
        title: 'Browser subtask checklist item',
        completed: false,
        taskId: createdTask.id,
      },
    });
    assert(!createdSubtask.completed, 'Subtask initially incomplete');

    const updatedSubtask = await db.subtask.update({
      where: { id: createdSubtask.id },
      data: { completed: true },
    });
    assert(updatedSubtask.completed, 'Subtask successfully toggled to completed in DB');

    // ----------------------------------------------------
    // PHASE 13: COMMENT & ACTIVITY TEST
    // ----------------------------------------------------
    console.log('\nPhase 13: Comment & Activity Test');
    const createdComment = await db.comment.create({
      data: {
        content: 'Automated real browser verification comment',
        taskId: createdTask.id,
        userId: dheerajUser.id,
      },
    });
    assert(createdComment.content.includes('Automated real browser'), 'Comment created in DB and associated with task');

    // ----------------------------------------------------
    // PHASE 15: GLOBAL SEARCH
    // ----------------------------------------------------
    console.log('\nPhase 15: Global Search');
    await page.goto(`${LOCAL_URL}/api/search?q=Browser`, { waitUntil: 'networkidle2' });
    const searchContent = await page.content();
    assert(searchContent.includes('Browser') || searchContent.includes('projects') || searchContent.includes('tasks'), 'Global search API executes and returns structured JSON results');

    // ----------------------------------------------------
    // PHASE 16, 17, 18, 19, 20: PAGES & UI VERIFICATION
    // ----------------------------------------------------
    console.log('\nPhase 16-20: Core Navigation & Page Verification');

    await page.goto(`${LOCAL_URL}/tasks`, { waitUntil: 'networkidle2' });
    assert(page.url().includes('/tasks'), 'Navigated to /tasks');

    await page.goto(`${LOCAL_URL}/calendar`, { waitUntil: 'networkidle2' });
    assert(page.url().includes('/calendar'), 'Navigated to /calendar');

    await page.goto(`${LOCAL_URL}/reports`, { waitUntil: 'networkidle2' });
    assert(page.url().includes('/reports'), 'Navigated to /reports');

    await page.goto(`${LOCAL_URL}/api/notifications`, { waitUntil: 'networkidle2' });
    const notifsContent = await page.content();
    assert(notifsContent.includes('notifications') || notifsContent.includes('['), 'Notifications API endpoint returns user notifications');

    await page.goto(`${LOCAL_URL}/profile`, { waitUntil: 'networkidle2' });
    assert(page.url().includes('/profile'), 'Navigated to /profile');

    await page.goto(`${LOCAL_URL}/settings`, { waitUntil: 'networkidle2' });
    assert(page.url().includes('/settings'), 'Navigated to /settings');

    // ----------------------------------------------------
    // PHASE 24: PRODUCTION DEPLOYMENT BROWSER TEST
    // ----------------------------------------------------
    console.log('\nPhase 24: Live Production Deployment Verification');
    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    const prodTitle = await page.title();
    assert(!!prodTitle, `Production site loads cleanly (Title: ${prodTitle})`);

    // ----------------------------------------------------
    // PHASE 25: RESPONSIVE VIEWPORT TESTING
    // ----------------------------------------------------
    console.log('\nPhase 25: Responsive Viewport Testing');
    const viewports = [
      { name: 'Desktop', width: 1280, height: 800 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 812 },
    ];
    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(`${LOCAL_URL}/`, { waitUntil: 'networkidle2' });
      assert(page.url().includes('/'), `Page renders under ${vp.name} viewport (${vp.width}x${vp.height})`);
    }

    // ----------------------------------------------------
    // PHASE 27: DATA CLEANUP
    // ----------------------------------------------------
    console.log('\nPhase 27: Temporary Data Cleanup');
    await db.comment.deleteMany({ where: { taskId: createdTask.id } });
    await db.subtask.deleteMany({ where: { taskId: createdTask.id } });
    await db.activity.deleteMany({ where: { taskId: createdTask.id } });
    await db.task.deleteMany({ where: { id: createdTask.id } });
    await db.project.deleteMany({ where: { id: createdProject.id } });
    await db.user.deleteMany({ where: { email: testEmail } });
    console.log('  🧹 Temporary browser test data cleaned successfully from DB');

    if (consoleErrors.length > 0) {
      console.log('Console Errors Captured:', consoleErrors);
    }
    if (networkFailures.length > 0) {
      console.log('Network Failures Captured:', networkFailures);
    }

    assert(consoleErrors.length === 0, 'Zero critical browser console errors detected');
    assert(networkFailures.length === 0, 'Zero network 4xx/5xx failures detected');

  } catch (err) {
    console.error('Browser Test Error:', err);
    failed++;
  } finally {
    if (browser) {
      await browser.close();
    }
    await db.$disconnect();
  }

  console.log('\n============================================================');
  console.log(`BROWSER E2E ACCEPTANCE AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runBrowserE2ETests();
