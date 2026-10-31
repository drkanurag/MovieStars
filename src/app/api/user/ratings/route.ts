import { NextRequest, NextResponse } from 'next/server';
import { RatingService } from '@/server/services/RatingService';
import { UserService } from '@/server/services/UserService';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const titleId = searchParams.get('titleId');
  const token = searchParams.get('token');

  if (!titleId) {
    return NextResponse.json({ error: 'titleId parameter is required' }, { status: 400 });
  }

  const ratingService = RatingService.getInstance();
  const userService = UserService.getInstance();

  let userId = 'anonymous';
  if (token) {
    const session = userService.validateSession(token);
    if (session) userId = session.user.id;
  }

  const ratings = ratingService.getTitleRatings(titleId);
  const userRating = ratingService.getUserRating(titleId, userId);

  return NextResponse.json({
    titleId,
    ratings,
    userRating,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { titleId, stars, token } = body;

    if (!titleId || typeof titleId !== 'string') {
      return NextResponse.json({ error: 'Valid titleId is required' }, { status: 400 });
    }

    const starNum = parseFloat(stars);
    if (isNaN(starNum) || starNum < 0.5 || starNum > 5.0) {
      return NextResponse.json({ error: 'Stars rating must be between 0.5 and 5.0' }, { status: 400 });
    }

    const userService = UserService.getInstance();
    const ratingService = RatingService.getInstance();

    let userId = 'anonymous';
    if (token) {
      const session = userService.validateSession(token);
      if (session) userId = session.user.id;
    }

    const updatedRatings = ratingService.submitUserRating(titleId, userId, starNum);

    return NextResponse.json({
      success: true,
      titleId,
      userRating: starNum,
      ratings: updatedRatings,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Rating submission failed' }, { status: 500 });
  }
}
