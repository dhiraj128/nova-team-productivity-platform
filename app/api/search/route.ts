import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ projects: [], tasks: [], members: [] });
    }

    const projects = await db.project.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        priority: true,
      },
      take: 5,
    });

    const tasks = await db.task.findMany({
      where: {
        OR: [
          { key: { contains: query } },
          { title: { contains: query } },
          { description: { contains: query } },
        ],
      },
      select: {
        id: true,
        key: true,
        title: true,
        status: true,
        priority: true,
        projectId: true,
      },
      take: 8,
    });

    const members = await db.user.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { email: { contains: query } },
          { role: { contains: query } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
      take: 5,
    });

    return NextResponse.json({ projects, tasks, members });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Search failed' }, { status: 500 });
  }
}
