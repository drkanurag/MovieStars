import { NextRequest, NextResponse } from 'next/server';
import { syncLiveOpenReleases } from '@/lib/api/liveOpenSync';
import { UserService } from '@/server/services/UserService';

function isAuthorized(req: NextRequest): boolean {
  // 1. Check API Key header (for automated cron jobs / server-to-server)
  const apiKey = req.headers.get('x-api-key');
  const configuredAdminKey = process.env.ADMIN_API_KEY || process.env.CRON_SECRET;
  if (configuredAdminKey && apiKey === configuredAdminKey) {
    return true;
  }

  // 2. Check Admin Session Bearer Token
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    const session = UserService.getInstance().validateSession(token);
    if (session && session.user.role === 'admin') {
      return true;
    }
  }

  return false;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Admin session or valid API key required to trigger sync.' },
      { status: 401 }
    );
  }

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
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Admin session or valid API key required to trigger sync.' },
      { status: 401 }
    );
  }

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
