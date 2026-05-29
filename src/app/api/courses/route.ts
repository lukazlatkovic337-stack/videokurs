import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const courses = await prisma.course.findMany({
    include: {
      _count: { select: { videos: true } },
    },
    orderBy: { orderIndex: 'asc' },
  });

  const result = courses.map(c => ({
    id: c.id,
    title: c.title,
    description: c.description,
    thumbnail: c.thumbnail,
    category: c.category,
    level: c.level,
    subject: c.subject,
    video_count: c._count.videos,
  }));

  return NextResponse.json(result);
}
