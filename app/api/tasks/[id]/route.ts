import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const task = await db.task.findUnique({
      where: { id: params.id },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true, image: true, role: true } },
        reporter: { select: { id: true, name: true, email: true, image: true, role: true } },
        subtasks: { orderBy: { createdAt: 'asc' } },
        comments: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        attachments: true,
        activities: {
          include: { user: { select: { id: true, name: true, image: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch task' }, { status: 500 });
  }
}

async function handleTaskUpdate(request: Request, params: { id: string }) {
  try {
    const session = await getAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();

    const existing = await db.task.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const updated = await db.task.update({
      where: { id: params.id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.status && { status: body.status }),
        ...(body.priority && { priority: body.priority }),
        ...(body.position !== undefined && { position: body.position }),
        ...(body.dueDate !== undefined && { dueDate: body.dueDate ? new Date(body.dueDate) : null }),
        ...(body.assigneeId !== undefined && { assigneeId: body.assigneeId }),
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true, image: true } },
        reporter: { select: { id: true, name: true, email: true, image: true } },
        subtasks: true,
        comments: true,
      },
    });

    // Log Activity for status changes or assignments
    if (body.status && body.status !== existing.status) {
      await db.activity.create({
        data: {
          projectId: existing.projectId,
          taskId: params.id,
          userId: userId,
          type: 'UPDATE_STATUS',
          description: `${session.user.name || 'User'} moved task ${existing.key} from ${existing.status} to ${body.status}`,
        },
      });
    }

    if (body.assigneeId && body.assigneeId !== existing.assigneeId) {
      const assigneeUser = await db.user.findUnique({ where: { id: body.assigneeId } });
      await db.activity.create({
        data: {
          projectId: existing.projectId,
          taskId: params.id,
          userId: userId,
          type: 'ASSIGN_TASK',
          description: `${session.user.name || 'User'} assigned ${existing.key} to ${assigneeUser?.name || 'team member'}`,
        },
      });

      if (body.assigneeId !== userId) {
        await db.notification.create({
          data: {
            userId: body.assigneeId,
            title: 'Task Assigned',
            message: `${session.user.name || 'User'} assigned ${existing.key} to you`,
            link: `/projects/${existing.projectId}/tasks/${params.id}`,
          },
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update task' }, { status: 400 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  return handleTaskUpdate(request, params);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  return handleTaskUpdate(request, params);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db.task.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, id: params.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete task' }, { status: 400 });
  }
}
