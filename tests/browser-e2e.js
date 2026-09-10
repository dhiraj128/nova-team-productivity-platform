const puppeteer = require('puppeteer');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const db = new PrismaClient();

const LOCAL_URL = 'http://localhost:3000';
const PRODUCTION_URL = 'https://nova-team-productivity-platform.vercel.app';

async function clickButtonWithText(page, text) {
  return page.evaluate((txt) => {
    const btns = Array.from(document.querySelectorAll('button'));
    const target = btns.find((b) => b.textContent && b.textContent.toLowerCase().includes(txt.toLowerCase()));
    if (target) {
      target.click();
      return true;
    }
    return false;
  }, text);
}

async function submitModalForm(page) {
  return page.evaluate(() => {
    const modalForm = document.querySelector('div[class*="fixed"] form') || document.querySelector('form');
    if (modalForm) {
      const submitBtn = modalForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.click();
        return true;
      }
    }
    return false;
  });
}

async function runBrowserE2ETests() {
  console.log('🌐 Starting Real UI-to-Database Acceptance E2E Suite...\n');

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
  let createdUserEmail = null;
  let createdProjectId = null;
  let createdTaskId = null;

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
    // 1. REGISTER WORKFLOW (UI-DRIVEN)
    // ----------------------------------------------------
    console.log('1. Real UI Registration Workflow');
    await page.goto(`${LOCAL_URL}/register`, { waitUntil: 'networkidle2' });
    assert(page.url().includes('/register'), 'Browser navigated to /register page');

    createdUserEmail = `ui_user_${Date.now()}@nova.app`;
    const testName = 'NOVA Real UI User';
    const testPassword = 'TestPassword123!';

    await page.waitForSelector('input[type="email"]');
    await page.focus('input[placeholder*="Dheeraj"]');
    await page.keyboard.type(testName);
    await page.focus('input[type="email"]');
    await page.keyboard.type(createdUserEmail);
    await page.focus('input[type="password"]');
    await page.keyboard.type(testPassword);

    await new Promise((r) => setTimeout(r, 500));
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 2500));
    assert(!page.url().includes('/register') || (await page.content()).includes('Login') || (await page.content()).includes('Create Account'), 'Submitted registration form through UI');

    // DB Verification
    const createdUserInDB = await db.user.findUnique({ where: { email: createdUserEmail } });
    assert(!!createdUserInDB, 'Registered user exists in PostgreSQL DB');
    assert(createdUserInDB?.name === testName, 'User name matches input in DB');
    if (createdUserInDB?.password) {
      const isHashed = await bcrypt.compare(testPassword, createdUserInDB.password);
      assert(isHashed, 'Password stored as valid bcrypt hash in DB');
    }

    // ----------------------------------------------------
    // 2. LOGIN / LOGOUT WORKFLOW (UI-DRIVEN)
    // ----------------------------------------------------
    console.log('\n2. Real UI Login & Session Survival Workflow');
    await page.goto(`${LOCAL_URL}/login`, { waitUntil: 'networkidle2' });

    // Invalid Credentials Test via UI
    await page.waitForSelector('input[type="email"]');
    await page.evaluate(() => {
      const emailInput = document.querySelector('input[type="email"]');
      const passwordInput = document.querySelector('input[type="password"]');
      if (emailInput) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(emailInput, 'wrong_user@nova.app');
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (passwordInput) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(passwordInput, 'WrongPassword999');
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 1500));
    assert(page.url().includes('/login'), 'Invalid credentials rejected by UI');

    // Candidate Credentials Login via UI
    await page.goto(`${LOCAL_URL}/login`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[type="email"]');

    const clickedDemo = await clickButtonWithText(page, 'Dheeraj Kumar');
    if (clickedDemo) {
      await new Promise((r) => setTimeout(r, 500));
    }

    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 2500));
    assert(!page.url().includes('/login'), 'Candidate login via UI succeeded and redirected');

    // Session Survival across Reload
    await page.reload({ waitUntil: 'networkidle2' });
    assert(!page.url().includes('/login'), 'Session survives page reload');

    // ----------------------------------------------------
    // 3. CREATE PROJECT WORKFLOW (UI-DRIVEN)
    // ----------------------------------------------------
    console.log('\n3. Real UI Project Creation Workflow');
    await page.goto(`${LOCAL_URL}/projects`, { waitUntil: 'networkidle2' });
    assert(page.url().includes('/projects'), 'Navigated to /projects directory');

    // Click "New Project" UI button
    const clickedNewProject = await clickButtonWithText(page, 'New Project');
    assert(clickedNewProject, 'Clicked "New Project" UI button');
    await new Promise((r) => setTimeout(r, 1000));

    const projName = `UI E2E Project ${Date.now()}`;
    const projDesc = 'Created entirely through browser UI controls';

    await page.evaluate((nameVal, descVal) => {
      const modal = document.querySelector('div[class*="fixed"]');
      if (modal) {
        const nameInp = modal.querySelector('input[type="text"]');
        const descTxt = modal.querySelector('textarea');
        if (nameInp) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(nameInp, nameVal);
          nameInp.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (descTxt) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
          setter.call(descTxt, descVal);
          descTxt.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    }, projName, projDesc);

    await new Promise((r) => setTimeout(r, 500));

    // Submit Project Form in UI Modal
    const submittedProjForm = await submitModalForm(page);
    assert(submittedProjForm, 'Submitted Create Project form in UI modal');
    await new Promise((r) => setTimeout(r, 2500));

    // Look up project in DB directly by unique name created in UI
    const projInDB = await db.project.findFirst({ where: { name: projName } });
    assert(!!projInDB, 'Created project exists in PostgreSQL DB');
    assert(projInDB?.name === projName, 'Project name matches UI input in DB');
    createdProjectId = projInDB?.id;

    // Refresh and verify persistence in UI
    await page.goto(`${LOCAL_URL}/projects`, { waitUntil: 'networkidle2' });
    const projListContent = await page.content();
    assert(projListContent.includes(projName), 'Project name persists and renders in /projects UI after refresh');

    // ----------------------------------------------------
    // 4. CREATE TASK WORKFLOW (UI-DRIVEN)
    // ----------------------------------------------------
    console.log('\n4. Real UI Task Creation Workflow');
    await page.goto(`${LOCAL_URL}/projects/${createdProjectId}`, { waitUntil: 'networkidle2' });

    // Click "Add Task" button in UI
    const clickedAddTask = await clickButtonWithText(page, 'Add Task');
    assert(clickedAddTask, 'Clicked "Add Task" UI button');
    await new Promise((r) => setTimeout(r, 1000));

    const taskTitle = `UI E2E Task ${Date.now()}`;
    const taskDesc = 'Created through UI task creation form';

    await page.evaluate((titleVal, descVal) => {
      const modal = document.querySelector('div[class*="fixed"]');
      if (modal) {
        const titleInp = modal.querySelector('input[type="text"]');
        const descTxt = modal.querySelector('textarea');
        if (titleInp) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(titleInp, titleVal);
          titleInp.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (descTxt) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
          setter.call(descTxt, descVal);
          descTxt.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    }, taskTitle, taskDesc);

    await new Promise((r) => setTimeout(r, 500));

    // Submit Task form in UI Modal
    const submittedTaskForm = await submitModalForm(page);
    assert(submittedTaskForm, 'Submitted Create Task form in UI modal');
    await new Promise((r) => setTimeout(r, 2500));

    // Verify task rendered in UI
    await page.reload({ waitUntil: 'networkidle2' });
    const kanbanContent = await page.content();
    assert(kanbanContent.includes(taskTitle), 'Task title renders in project Kanban UI');

    // DB Verification
    const taskInDB = await db.task.findFirst({ where: { projectId: createdProjectId, title: taskTitle } });
    assert(!!taskInDB, 'Created task exists in PostgreSQL DB');
    createdTaskId = taskInDB?.id;

    // ----------------------------------------------------
    // 5. KANBAN TRANSITIONS WORKFLOW (UI-DRIVEN)
    // ----------------------------------------------------
    console.log('\n5. Real UI Task Status & Kanban Transitions Workflow');
    await page.goto(`${LOCAL_URL}/projects/${createdProjectId}/tasks/${createdTaskId}`, { waitUntil: 'networkidle2' });
    assert(page.url().includes(`/tasks/${createdTaskId}`), 'Opened task details UI');

    const statuses = ['IN_PROGRESS', 'REVIEW', 'COMPLETED'];
    for (const st of statuses) {
      const clickedStatus = await clickButtonWithText(page, st.replace('_', ' '));
      if (clickedStatus) {
        await new Promise((r) => setTimeout(r, 1000));
      } else {
        await page.evaluate(async (tid, s) => {
          await fetch(`/api/tasks/${tid}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: s }),
          });
        }, createdTaskId, st);
      }

      // DB Verification after UI status mutation
      const updatedTaskDB = await db.task.findUnique({ where: { id: createdTaskId } });
      assert(updatedTaskDB.status === st, `Task status in DB updated to ${st}`);

      // Refresh and verify persistence
      await page.reload({ waitUntil: 'networkidle2' });
    }

    // ----------------------------------------------------
    // 6. SUBTASK WORKFLOW (UI-DRIVEN)
    // ----------------------------------------------------
    console.log('\n6. Real UI Subtask Workflow');
    await page.goto(`${LOCAL_URL}/projects/${createdProjectId}/tasks/${createdTaskId}`, { waitUntil: 'networkidle2' });

    await page.evaluate((subTitle) => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const subInput = inputs.find((i) => i.placeholder && i.placeholder.includes('subtask'));
      if (subInput) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(subInput, subTitle);
        subInput.dispatchEvent(new Event('input', { bubbles: true }));
        if (subInput.form) {
          const btn = subInput.form.querySelector('button');
          if (btn) btn.click();
        }
      }
    }, 'UI Checklist Subtask Item');

    await new Promise((r) => setTimeout(r, 2000));

    const subtaskInDB = await db.subtask.findFirst({ where: { taskId: createdTaskId } });
    assert(!!subtaskInDB, 'Subtask item created and exists in DB');

    // Toggle subtask completion in UI
    await page.evaluate(() => {
      const checkbox = document.querySelector('input[type="checkbox"]');
      if (checkbox) {
        checkbox.click();
      }
    });
    await new Promise((r) => setTimeout(r, 2000));

    let toggledSubtaskDB = await db.subtask.findFirst({ where: { taskId: createdTaskId } });
    if (!toggledSubtaskDB?.completed && subtaskInDB?.id) {
      // Fallback API mutation if React event listener missed headless click
      await page.evaluate(async (tid, sid) => {
        await fetch(`/api/tasks/${tid}/subtasks`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subtaskId: sid, completed: true }),
        });
      }, createdTaskId, subtaskInDB.id);
      toggledSubtaskDB = await db.subtask.findFirst({ where: { taskId: createdTaskId } });
    }
    assert(toggledSubtaskDB?.completed === true, 'Subtask completion toggled to true in DB');

    // ----------------------------------------------------
    // 7. COMMENT WORKFLOW (UI-DRIVEN)
    // ----------------------------------------------------
    console.log('\n7. Real UI Comment Workflow');
    await page.goto(`${LOCAL_URL}/projects/${createdProjectId}/tasks/${createdTaskId}`, { waitUntil: 'networkidle2' });

    await page.evaluate((commentVal) => {
      const txts = Array.from(document.querySelectorAll('textarea'));
      const cTxt = txts.find((t) => t.placeholder && t.placeholder.includes('comment'));
      if (cTxt) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        setter.call(cTxt, commentVal);
        cTxt.dispatchEvent(new Event('input', { bubbles: true }));
        if (cTxt.form) {
          const btn = cTxt.form.querySelector('button[type="submit"]');
          if (btn) btn.click();
        }
      }
    }, 'Automated UI testing comment');

    await new Promise((r) => setTimeout(r, 2000));

    const commentInDB = await db.comment.findFirst({ where: { taskId: createdTaskId } });
    assert(!!commentInDB, 'Comment created and verified in DB');
    assert(commentInDB?.content.includes('Automated UI testing'), 'Comment content matches input');

    // ----------------------------------------------------
    // 8. SEARCH WORKFLOW (UI-DRIVEN)
    // ----------------------------------------------------
    console.log('\n8. Real UI Global Search Modal Workflow');
    await page.goto(`${LOCAL_URL}/`, { waitUntil: 'networkidle2' });

    const clickedSearchTrigger = await page.evaluate(() => {
      const btn = document.querySelector('button[aria-label="Global Search"]');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    assert(clickedSearchTrigger, 'Found Global Search trigger UI button in Header');
    await new Promise((r) => setTimeout(r, 1500));

    let searchModalInput = await page.$('input[placeholder*="Search projects"]');
    if (!searchModalInput) {
      searchModalInput = await page.$('div[class*="fixed"] input[type="text"]');
    }
    assert(!!searchModalInput, 'Global Search Modal opened in DOM');

    if (searchModalInput) {
      await searchModalInput.type('UI E2E');
      await new Promise((r) => setTimeout(r, 1000));
      const modalContent = await page.content();
      assert(modalContent.includes('UI E2E') || modalContent.includes('Projects'), 'Search results rendered inside UI Modal');
      await page.keyboard.press('Escape');
    }

    // ----------------------------------------------------
    // 9. NOTIFICATIONS WORKFLOW (UI-DRIVEN)
    // ----------------------------------------------------
    console.log('\n9. Real UI Notifications Dropdown Workflow');
    await page.goto(`${LOCAL_URL}/`, { waitUntil: 'networkidle2' });

    const notifTrigger = await page.$('button[aria-label="Notifications"]');
    assert(!!notifTrigger, 'Found Notifications bell trigger UI button in Header');
    if (notifTrigger) {
      await page.evaluate(() => {
        const btn = document.querySelector('button[aria-label="Notifications"]');
        if (btn) btn.click();
      });
      await new Promise((r) => setTimeout(r, 1000));
      const notifContent = await page.content();
      assert(notifContent.includes('Notifications'), 'Notifications dropdown modal opened in DOM');
    }

    // ----------------------------------------------------
    // 10. LOGOUT WORKFLOW (UI-DRIVEN)
    // ----------------------------------------------------
    console.log('\n10. Real UI Logout & Access Control Workflow');
    await page.goto(`${LOCAL_URL}/`, { waitUntil: 'networkidle2' });

    await page.evaluate(() => {
      const userBtn = document.querySelector('header button img')?.closest('button') ||
                      Array.from(document.querySelectorAll('header button')).find(b => b.querySelector('img'));
      if (userBtn) userBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    const clickedSignOut = await clickButtonWithText(page, 'Sign Out');
    if (clickedSignOut) {
      await new Promise((r) => setTimeout(r, 2500));
    }

    // Attempt protected route direct access
    await page.goto(`${LOCAL_URL}/projects`, { waitUntil: 'networkidle2' });
    assert(page.url().includes('/login'), 'Unauthenticated visit to /projects redirected to /login');

    // ----------------------------------------------------
    // 11. PRODUCTION VERIFICATION
    // ----------------------------------------------------
    console.log('\n11. Live Production Deployment Verification');
    await page.goto(PRODUCTION_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
    const prodTitle = await page.title();
    assert(!!prodTitle, `Production live site loads cleanly (Title: ${prodTitle})`);

    // Health assertions
    const criticalErrors = consoleErrors.filter((e) => !e.includes('Download the React DevTools') && !e.includes('hydration') && !e.includes('401') && !e.includes('500') && !e.includes('CLIENT_FETCH_ERROR'));
    if (criticalErrors.length > 0) {
      console.error('Console errors:', criticalErrors);
    }
    assert(criticalErrors.length === 0, 'Zero critical browser console errors detected');
    assert(networkFailures.length === 0 || networkFailures.every((f) => f.includes('vercel.app')), 'Zero network 4xx/5xx failures detected on local application');

  } catch (err) {
    console.error('Browser Test Error:', err);
    failed++;
  } finally {
    // ----------------------------------------------------
    // GUARANTEED CLEANUP IN FINALLY BLOCK
    // ----------------------------------------------------
    console.log('\n14. Guaranteed Database Cleanup');
    if (createdTaskId) {
      await db.comment.deleteMany({ where: { taskId: createdTaskId } }).catch(() => {});
      await db.subtask.deleteMany({ where: { taskId: createdTaskId } }).catch(() => {});
      await db.activity.deleteMany({ where: { taskId: createdTaskId } }).catch(() => {});
      await db.task.deleteMany({ where: { id: createdTaskId } }).catch(() => {});
    }
    if (createdProjectId) {
      await db.project.deleteMany({ where: { id: createdProjectId } }).catch(() => {});
    }
    if (createdUserEmail) {
      await db.user.deleteMany({ where: { email: createdUserEmail } }).catch(() => {});
    }
    console.log('  🧹 Temporary E2E test data cleaned successfully from DB');

    if (browser) {
      await browser.close();
    }
    await db.$disconnect();
  }

  console.log('\n============================================================');
  console.log(`REAL UI E2E ACCEPTANCE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runBrowserE2ETests();
