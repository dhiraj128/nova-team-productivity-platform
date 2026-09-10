import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { projectSchema } from '@/lib/validation';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'updatedAt';

    const whereClause: any = {};

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const projects = await db.project.findMany({
      where: whereClause,
      include: {
        owner: {
          select: { id: true, name: true, email: true, image: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true, role: true },
            },
          },
        },
        tasks: {
          select: { id: true, status: true, priority: true },
        },
      },
      orderBy: sort === 'name' ? { name: 'asc' } : { updatedAt: 'desc' },
    });

    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch projects' }, { status: 500 });
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
    const validated = projectSchema.parse(body);

    const project = await db.project.create({
      data: {
        name: validated.name,
        description: validated.description,
        status: validated.status,
        priority: validated.priority,
        startDate: validated.startDate ? new Date(validated.startDate) : null,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
        ownerId: userId,
        members: {
          create: [
            { userId: userId, role: 'Owner' },
            ...(validated.members || []).map((mId: string) => ({
              userId: mId,
              role: 'Member',
            })),
          ],
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true, image: true } },
        members: { include: { user: true } },
        tasks: true,
      },
    });

    // Log Activity
    await db.activity.create({
      data: {
        projectId: project.id,
        userId: userId,
        type: 'CREATE_PROJECT',
        description: `${session.user.name || 'User'} created project "${project.name}"`,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create project' }, { status: 400 });
  }
}
