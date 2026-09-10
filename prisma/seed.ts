import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.attachment.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.subtask.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Avatars from Stitch export / LH3 Google CDN
  const avatarDheeraj = 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0iRXzv10MO3JR7wW6rDxypqHvQWbVlIFuMRgjYHtQEBqzaVgOjN0BMLN4tfkSStOmZ8637odOMYeTtvF-36Cw6LDIfuXRxLwqvchvIrX8c5k2XEl5T8-f4G2KBRxpEQsvNZFxnCte_bQH0nP9hFPprjfP5m56CSqzTu0kqnfb6yii-okol00k1-a8Dtl29Eprw1WEJ0xYiSFvK8F8ywaRkEKe436ITLRWLZSBnGB2FtWLaNg2sP0BBw';
  const avatarRahul = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDU4_B9Fcdz1ArzzSSsvse3uU7BZdlDq038pMVsqF93eeSDzQEclQwA7J16vh3fd8RpejRAcWZ8-Gex7U_QRe5ptJN63k7mTel6yFAG1KgLVglnhXGlm0CW4R8gX6PvIo9x7tBKK9kzdBEOJMJqg7U2TpwleVgvyiBSbj7e3tg36ocr1s2gB5nKKAke-t5xjw9nmeywINCdJXZsHeQAKz7PR3eCQZQ9vYCHJIIgaq_LDUJdh_8LwsFfUg';
  const avatarPriya = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZq-Bs132MMx18sQY8DvqlRKsLGimwzJgKG672NwtAbIO-d6YEmsCKDngajmbTHmYa5HlCmTmdlStDcokiojnE26mIqCmd1bwPLvsZZ9hZxkd20ktN89lPyiGfz4fALJDOEOYU3g1gJtLJALiYJrAKujqYQIgHtpQdDk1Todl4fu5FV3wpa8kYtpBtYCi4Fggaec0HJICkfrYwd6TUTvcpgdO_Hswa7nRnI_bTngrUyJLZ8O2CqcNuHQ';
  const avatarAman = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGLQL3IQZasOQfkEbvUy11ZEE2CHhGwSKWJWzHDrBmk9oqDc1_PJt0zrX4Dmm3pFrcFTaRT0uhfHPkc6XSravoIw8yilNDB1JYN9RPb9CdcNmardzM8dPh6oItroremEf4tcVwgIbtX1CGQMbZdcKwXaO0IUjGn96qFZeqR3w3HMUUDV6yv-QJxsZC1JHJd3uEVS5Ku5zt-BXa4QGtAHj7emxMFvR7ZriuCsdvCa7CMPYmnsPzy1Ghfg';

  // 1. Create Users
  const dheeraj = await prisma.user.create({
    data: {
      name: 'Dheeraj Kumar',
      email: 'dheeraj@nova.app',
      password: hashedPassword,
      image: avatarDheeraj,
      role: 'Tech Lead & Primary Candidate',
    },
  });

  const rahul = await prisma.user.create({
    data: {
      name: 'Rahul Sharma',
      email: 'rahul@nova.app',
      password: hashedPassword,
      image: avatarRahul,
      role: 'Frontend Architect',
    },
  });

  const priya = await prisma.user.create({
    data: {
      name: 'Priya Singh',
      email: 'priya@nova.app',
      password: hashedPassword,
      image: avatarPriya,
      role: 'Product Designer',
    },
  });

  const aman = await prisma.user.create({
    data: {
      name: 'Aman Kumar',
      email: 'aman@nova.app',
      password: hashedPassword,
      image: avatarAman,
      role: 'Mobile Engineer',
    },
  });

  // 2. Create Projects
  const project1 = await prisma.project.create({
    data: {
      name: 'NOVA Website Redesign',
      description: 'Next-gen marketing, documentation, and client portal architecture overhaul with Tailwind and Next.js 14.',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      startDate: new Date('2026-10-01'),
      dueDate: new Date('2026-11-15'),
      ownerId: dheeraj.id,
      members: {
        create: [
          { userId: dheeraj.id, role: 'Owner' },
          { userId: priya.id, role: 'Admin' },
          { userId: rahul.id, role: 'Member' },
          { userId: aman.id, role: 'Member' },
        ],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile Application',
      description: 'iOS & Android native task tracker companion built with React Native.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      startDate: new Date('2026-10-15'),
      dueDate: new Date('2026-11-28'),
      ownerId: dheeraj.id,
      members: {
        create: [
          { userId: dheeraj.id, role: 'Owner' },
          { userId: aman.id, role: 'Admin' },
        ],
      },
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'Customer Analytics Platform',
      description: 'Real-time telemetry pipeline and conversion funnel analytics dashboard.',
      status: 'PLANNING',
      priority: 'MEDIUM',
      startDate: new Date('2026-11-01'),
      dueDate: new Date('2026-12-10'),
      ownerId: rahul.id,
      members: {
        create: [
          { userId: rahul.id, role: 'Owner' },
          { userId: priya.id, role: 'Member' },
          { userId: dheeraj.id, role: 'Member' },
        ],
      },
    },
  });

  const project4 = await prisma.project.create({
    data: {
      name: 'Q4 Product Marketing Campaign',
      description: 'Product Hunt launch collateral, landing page assets, and press releases.',
      status: 'COMPLETED',
      priority: 'LOW',
      startDate: new Date('2026-09-01'),
      dueDate: new Date('2026-10-15'),
      ownerId: priya.id,
      members: {
        create: [
          { userId: priya.id, role: 'Owner' },
          { userId: dheeraj.id, role: 'Member' },
        ],
      },
    },
  });

  // 3. Create Tasks for Project 1 (NOVA Website Redesign)
  const task1 = await prisma.task.create({
    data: {
      key: 'NOV-101',
      title: 'Implement task management drag-and-drop',
      description: 'Enable smooth Kanban drag-and-drop across status columns with instant backend state persistence.',
      status: 'TODO',
      priority: 'HIGH',
      position: 0,
      dueDate: new Date('2026-11-14'),
      projectId: project1.id,
      assigneeId: rahul.id,
      reporterId: dheeraj.id,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      key: 'NOV-102',
      title: 'Build database schema v2 migrations',
      description: 'Expand Prisma models for notifications, activity logs, and attachment metadata.',
      status: 'TODO',
      priority: 'MEDIUM',
      position: 1,
      dueDate: new Date('2026-11-16'),
      projectId: project1.id,
      assigneeId: dheeraj.id,
      reporterId: dheeraj.id,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      key: 'NOV-103',
      title: 'Build high-speed landing page hero section',
      description: 'Construct responsive hero section using Geist font display sizes and indigo glowing backdrop.',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      position: 0,
      dueDate: new Date('2026-11-12'),
      projectId: project1.id,
      assigneeId: dheeraj.id,
      reporterId: dheeraj.id,
    },
  });

  const task4 = await prisma.task.create({
    data: {
      key: 'NOV-104',
      title: 'Design landing page hero & interactive mockups',
      description: 'Create high-fidelity dark-mode hero graphics, interactive workflow mockups, and micro-interactions for the NOVA SaaS launch page. Must align with design tokens.',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      position: 1,
      dueDate: new Date('2026-11-12'),
      projectId: project1.id,
      assigneeId: priya.id,
      reporterId: dheeraj.id,
    },
  });

  const task5 = await prisma.task.create({
    data: {
      key: 'NOV-105',
      title: 'Setup Auth.js session authentication & protected routes',
      description: 'Secure server-side route guards, password hashing, and persistent user session context.',
      status: 'REVIEW',
      priority: 'HIGH',
      position: 0,
      dueDate: new Date('2026-11-10'),
      projectId: project1.id,
      assigneeId: rahul.id,
      reporterId: dheeraj.id,
    },
  });

  const task6 = await prisma.task.create({
    data: {
      key: 'NOV-106',
      title: 'Create brand geometry vectors & design system tokens',
      description: 'Export SVG brand logo and configure Tailwind CSS variables matching DESIGN.md specification.',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      position: 0,
      dueDate: new Date('2026-11-05'),
      projectId: project1.id,
      assigneeId: priya.id,
      reporterId: dheeraj.id,
    },
  });

  const task7 = await prisma.task.create({
    data: {
      key: 'NOV-107',
      title: 'Deploy production Vercel environment',
      description: 'Configure production database connection, environment variables, build checks, and custom domain.',
      status: 'COMPLETED',
      priority: 'URGENT',
      position: 1,
      dueDate: new Date('2026-11-08'),
      projectId: project1.id,
      assigneeId: dheeraj.id,
      reporterId: dheeraj.id,
    },
  });

  // 4. Subtasks for NOV-104
  await prisma.subtask.createMany({
    data: [
      { taskId: task4.id, title: 'Create vector logo and typography scale', completed: true },
      { taskId: task4.id, title: 'Design hero card preview with realistic data', completed: true },
      { taskId: task4.id, title: 'Build interactive tab animations', completed: false },
      { taskId: task4.id, title: 'Mobile responsive breakpoint specs', completed: false },
    ],
  });

  // 5. Attachments for NOV-104
  await prisma.attachment.createMany({
    data: [
      {
        taskId: task4.id,
        name: 'hero_dark_mockup_v2.png',
        size: '2.4 MB',
        type: 'image/png',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
      },
      {
        taskId: task4.id,
        name: 'design_tokens_spec.pdf',
        size: '840 KB',
        type: 'application/pdf',
        url: '#',
      },
    ],
  });

  // 6. Comments on NOV-104
  await prisma.comment.createMany({
    data: [
      {
        taskId: task4.id,
        userId: dheeraj.id,
        content: 'Make sure the dark surface layers strictly match the #0b1326 palette from Stitch DESIGN.md.',
        createdAt: new Date(Date.now() - 3600000 * 5),
      },
      {
        taskId: task4.id,
        userId: priya.id,
        content: 'Updated hero graphics layout. Cyan electric accents applied to telemetry graphs!',
        createdAt: new Date(Date.now() - 3600000 * 2),
      },
      {
        taskId: task4.id,
        userId: rahul.id,
        content: "Looks crisp! I've updated the responsive breakpoints for tablet view.",
        createdAt: new Date(Date.now() - 1800000),
      },
    ],
  });

  // 7. Activities
  await prisma.activity.createMany({
    data: [
      {
        projectId: project1.id,
        taskId: task4.id,
        userId: dheeraj.id,
        type: 'CREATE_TASK',
        description: 'Dheeraj Kumar created task NOV-104',
        createdAt: new Date(Date.now() - 86400000 * 2),
      },
      {
        projectId: project1.id,
        taskId: task4.id,
        userId: dheeraj.id,
        type: 'ASSIGN_TASK',
        description: 'Dheeraj Kumar assigned task NOV-104 to Priya Singh',
        createdAt: new Date(Date.now() - 86400000 * 2 + 3600000),
      },
      {
        projectId: project1.id,
        taskId: task4.id,
        userId: priya.id,
        type: 'UPDATE_STATUS',
        description: 'Priya Singh moved NOV-104 from To Do to In Progress',
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        projectId: project1.id,
        taskId: task4.id,
        userId: priya.id,
        type: 'COMMENT',
        description: 'Priya Singh commented on NOV-104',
        createdAt: new Date(Date.now() - 3600000 * 2),
      },
    ],
  });

  // 8. Notifications for Dheeraj Kumar
  await prisma.notification.createMany({
    data: [
      {
        userId: dheeraj.id,
        title: 'Task Assigned',
        message: 'Rahul Sharma assigned you task NOV-102: Build database schema v2 migrations',
        read: false,
        link: `/projects/${project1.id}/tasks/${task2.id}`,
        createdAt: new Date(Date.now() - 3600000 * 4),
      },
      {
        userId: dheeraj.id,
        title: 'New Comment',
        message: 'Priya Singh commented on NOV-104: Updated hero graphics layout.',
        read: false,
        link: `/projects/${project1.id}/tasks/${task4.id}`,
        createdAt: new Date(Date.now() - 3600000 * 2),
      },
      {
        userId: dheeraj.id,
        title: 'Upcoming Deadline',
        message: 'NOVA Website Redesign has 3 tasks due in the next 48 hours.',
        read: true,
        link: `/projects/${project1.id}`,
        createdAt: new Date(Date.now() - 86400000),
      },
    ],
  });

  console.log('✅ Database seeded successfully with Dheeraj Kumar & NOVA project data!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
