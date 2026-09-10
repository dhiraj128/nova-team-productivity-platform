import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { taskSchema } from '@/lib/validation';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const assigneeId = searchParams.get('assigneeId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const whereClause: any = {};
    if (projectId) whereClause.projectId = projectId;
    if (assigneeId) whereClause.assigneeId = assigneeId;
    if (status && status !== 'ALL') whereClause.status = status;
    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { key: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const tasks = await db.task.findMany({
      where: whereClause,
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true, image: true, role: true } },
        reporter: { select: { id: true, name: true, email: true, image: true } },
        subtasks: true,
        comments: {
          include: { user: { select: { id: true, name: true, image: true } } },
        },
        attachments: true,
      },
      orderBy: { position: 'asc' },
    });

    return NextResponse.json(tasks);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const validated = taskSchema.parse(body);

    // Auto-generate key e.g. NOV-108
    const count = await db.task.count({ where: { projectId: validated.projectId } });
    const key = `NOV-${100 + count + 1}`;

    const task = await db.task.create({
      data: {
        key: key,
        title: validated.title,
        description: validated.description,
        status: validated.status,
        priority: validated.priority,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
        projectId: validated.projectId,
        assigneeId: validated.assigneeId || userId,
        reporterId: userId,
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true, image: true } },
        reporter: { select: { id: true, name: true, email: true, image: true } },
        subtasks: true,
        comments: true,
      },
    });

    // Log Activity
    await db.activity.create({
      data: {
        projectId: validated.projectId,
        taskId: task.id,
        userId: userId,
        type: 'CREATE_TASK',
        description: `${session.user.name || 'User'} created task ${task.key}: "${task.title}"`,
      },
    });

    // Notification if assigned to someone else
    if (validated.assigneeId && validated.assigneeId !== userId) {
      await db.notification.create({
        data: {
          userId: validated.assigneeId,
          title: 'New Task Assigned',
          message: `${session.user.name || 'User'} assigned task ${task.key} to you.`,
          link: `/projects/${task.projectId}/tasks/${task.id}`,
        },
      });
    }

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create task' }, { status: 400 });
  }
}
