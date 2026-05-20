import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get('courseId');

  const where = courseId ? { courseId: parseInt(courseId) } : {};

  const videos = await prisma.video.findMany({
    where,
    include: { course: { select: { title: true } } },
    orderBy: [{ courseId: 'asc' }, { orderIndex: 'asc' }],
  });

  const result = videos.map(v => ({
    id: v.id,
    course_id: v.courseId,
    title: v.title,
    description: v.description,
    youtube_url: v.youtubeUrl,
    duration: v.duration,
    order_index: v.orderIndex,
    course_title: v.course.title,
  }));

  return NextResponse.json(result);
}
