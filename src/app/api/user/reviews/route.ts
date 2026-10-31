import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/server/services/UserService';

export interface PersistentReview {
  id: string;
  titleId: string;
  author: string;
  userId?: string;
  stars: number;
  content: string;
  date: string;
}

// In-memory persistent review store
const reviewsStore = new Map<string, PersistentReview[]>();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const titleId = searchParams.get('titleId');

  if (!titleId) {
    return NextResponse.json({ error: 'titleId parameter is required' }, { status: 400 });
  }

  const reviews = reviewsStore.get(titleId) || [];
  return NextResponse.json({
    titleId,
    reviews,
    count: reviews.length,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { titleId, content, stars, token, author } = body;

    if (!titleId || typeof titleId !== 'string') {
      return NextResponse.json({ error: 'Valid titleId is required' }, { status: 400 });
    }

    const cleanContent = typeof content === 'string' ? content.trim() : '';
    if (cleanContent.length < 5 || cleanContent.length > 2000) {
      return NextResponse.json({ error: 'Review text must be between 5 and 2000 characters' }, { status: 400 });
    }

    const starNum = Math.min(5.0, Math.max(0.5, parseFloat(stars) || 5.0));

    let verifiedAuthor = author?.trim() || 'Movie Fan';
    let userId: string | undefined = undefined;

    if (token) {
      const session = UserService.getInstance().validateSession(token);
      if (session) {
        verifiedAuthor = session.user.displayName;
        userId = session.user.id;
      }
    }

    const newReview: PersistentReview = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      titleId,
      author: verifiedAuthor,
      userId,
      stars: starNum,
      content: cleanContent,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    if (!reviewsStore.has(titleId)) {
      reviewsStore.set(titleId, []);
    }

    const existing = reviewsStore.get(titleId)!;
    existing.unshift(newReview);

    return NextResponse.json({
      success: true,
      review: newReview,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to submit review' }, { status: 500 });
  }
}
