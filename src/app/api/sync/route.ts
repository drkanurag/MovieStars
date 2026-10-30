import { NextRequest, NextResponse } from 'next/server';
import { syncLiveOpenReleases } from '@/lib/api/liveOpenSync';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const force = searchParams.get('force') === 'true';

  try {
    const result = await syncLiveOpenReleases(force);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Sync failed' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const result = await syncLiveOpenReleases(true);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Sync failed' },
      { status: 500 }
    );
  }
}

