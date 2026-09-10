import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.title) {
      return NextResponse.json({ error: 'Subtask title is required' }, { status: 400 });
    }

    const subtask = await db.subtask.create({
      data: {
        taskId: params.id,
        title: body.title,
        completed: !!body.completed,
      },
    });

    return NextResponse.json(subtask, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create subtask' }, { status: 400 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.subtaskId) {
      return NextResponse.json({ error: 'subtaskId is required' }, { status: 400 });
    }

    const updated = await db.subtask.update({
      where: { id: body.subtaskId },
      data: {
        ...(body.completed !== undefined && { completed: body.completed }),
        ...(body.title && { title: body.title }),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update subtask' }, { status: 400 });
  }
}
