import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/progress - get all watched video ids for current user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = parseInt((session.user as any).id);

  const progress = await prisma.userProgress.findMany({
    where: { userId, watched: true },
    select: { videoId: true },
  });

  return NextResponse.json(progress.map(p => p.videoId));
}

// POST /api/progress - toggle watched for a video
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = parseInt((session.user as any).id);
  const { videoId, watched } = await req.json();

  if (!videoId) return NextResponse.json({ error: 'videoId required' }, { status: 400 });

  const result = await prisma.userProgress.upsert({
    where: { userId_videoId: { userId, videoId } },
    update: { watched, watchedAt: watched ? new Date() : null },
    create: { userId, videoId, watched, watchedAt: watched ? new Date() : null },
  });

  return NextResponse.json({ videoId: result.videoId, watched: result.watched });
}
