import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const comments = await db.comment.findMany({
      where: { taskId: params.id },
      include: {
        user: { select: { id: true, name: true, email: true, image: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(comments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();

    if (!body.content || !body.content.trim()) {
      return NextResponse.json({ error: 'Comment content cannot be empty' }, { status: 400 });
    }

    const task = await db.task.findUnique({ where: { id: params.id } });
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const comment = await db.comment.create({
      data: {
        taskId: params.id,
        userId: userId,
        content: body.content.trim(),
      },
      include: {
        user: { select: { id: true, name: true, email: true, image: true, role: true } },
      },
    });

    // Log Activity
    await db.activity.create({
      data: {
        projectId: task.projectId,
        taskId: task.id,
        userId: userId,
        type: 'COMMENT',
        description: `${session.user.name || 'User'} commented on ${task.key}`,
      },
    });

    // Notify assignee if not the commenter
    if (task.assigneeId && task.assigneeId !== userId) {
      await db.notification.create({
        data: {
          userId: task.assigneeId,
          title: 'New Comment',
          message: `${session.user.name || 'Someone'} commented on ${task.key}`,
          link: `/projects/${task.projectId}/tasks/${task.id}`,
        },
      });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to post comment' }, { status: 400 });
  }
}
