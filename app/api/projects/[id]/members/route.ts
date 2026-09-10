import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { memberSchema } from '@/lib/validation';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const email = body.email?.toLowerCase().trim();
    const role = body.role || 'Member';

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const targetUser = await db.user.findUnique({
      where: { email },
    });

    if (!targetUser) {
      return NextResponse.json({ error: `No user found with email ${email}` }, { status: 404 });
    }

    const existingMember = await db.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: params.id,
          userId: targetUser.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json({ error: 'User is already a project member' }, { status: 400 });
    }

    const member = await db.projectMember.create({
      data: {
        projectId: params.id,
        userId: targetUser.id,
        role: role,
      },
      include: {
        user: { select: { id: true, name: true, email: true, image: true, role: true } },
      },
    });

    // Log activity
    await db.activity.create({
      data: {
        projectId: params.id,
        userId: (session.user as any).id,
        type: 'ADD_MEMBER',
        description: `${session.user.name || 'User'} added ${targetUser.name} to the project`,
      },
    });

    // Notification
    await db.notification.create({
      data: {
        userId: targetUser.id,
        title: 'Added to Project',
        message: `You were added to project as ${role}`,
        link: `/projects/${params.id}`,
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to add member' }, { status: 400 });
  }
}
