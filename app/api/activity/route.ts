import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const reqUrl = request?.url || '/';
    const host = (request?.headers && typeof request.headers.get === 'function' ? request.headers.get('host') : null) || 'localhost:3000';
    const protocol = (request?.headers && typeof request.headers.get === 'function' ? request.headers.get('x-forwarded-proto') : null) || (host.includes('localhost') ? 'http' : 'https');
    const baseUrl = process.env.NEXTAUTH_URL || `${protocol}://${host}`;
    const { searchParams } = new URL(reqUrl, baseUrl);
    const projectId = searchParams.get('projectId');
    const taskId = searchParams.get('taskId');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const whereClause: any = {};
    if (projectId) whereClause.projectId = projectId;
    if (taskId) whereClause.taskId = taskId;

    const activities = await db.activity.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        project: { select: { id: true, name: true } },
        task: { select: { id: true, key: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(activities);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch activity feed' }, { status: 500 });
  }
}
