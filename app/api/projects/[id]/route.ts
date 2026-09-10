import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { projectSchema } from '@/lib/validation';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const project = await db.project.findUnique({
      where: { id: params.id },
      include: {
        owner: { select: { id: true, name: true, email: true, image: true, role: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true, role: true } },
          },
        },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true, image: true } },
            reporter: { select: { id: true, name: true, email: true, image: true } },
            subtasks: true,
            comments: {
              include: { user: { select: { id: true, name: true, email: true, image: true } } },
            },
            attachments: true,
          },
          orderBy: { position: 'asc' },
        },
        activities: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();

    const updated = await db.project.update({
      where: { id: params.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.status && { status: body.status }),
        ...(body.priority && { priority: body.priority }),
        ...(body.startDate && { startDate: new Date(body.startDate) }),
        ...(body.dueDate && { dueDate: new Date(body.dueDate) }),
      },
      include: {
        owner: true,
        members: { include: { user: true } },
        tasks: true,
      },
    });

    await db.activity.create({
      data: {
        projectId: params.id,
        userId: userId,
        type: 'UPDATE_PROJECT',
        description: `${session.user.name || 'User'} updated project details`,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update project' }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db.project.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, id: params.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete project' }, { status: 400 });
  }
}
