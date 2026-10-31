import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/server/services/UserService';

interface UserLists {
  watchlist: Set<string>;
  favorites: Set<string>;
  watched: Set<string>;
}

// In-memory persistent user lists store (userId -> UserLists)
const userListsStore = new Map<string, UserLists>();

function getOrCreateUserLists(userId: string): UserLists {
  if (!userListsStore.has(userId)) {
    userListsStore.set(userId, {
      watchlist: new Set(),
      favorites: new Set(),
      watched: new Set(),
    });
  }
  return userListsStore.get(userId)!;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 401 });
  }

  const session = UserService.getInstance().validateSession(token);
  if (!session) {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
  }

  const lists = getOrCreateUserLists(session.user.id);
  return NextResponse.json({
    watchlist: Array.from(lists.watchlist),
    favorites: Array.from(lists.favorites),
    watched: Array.from(lists.watched),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, titleId, listType, action, clientLists } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 401 });
    }

    const session = UserService.getInstance().validateSession(token);
    if (!session) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const userLists = getOrCreateUserLists(session.user.id);

    // Sync client local lists into server upon sign-in
    if (action === 'sync' && clientLists) {
      if (Array.isArray(clientLists.watchlist)) {
        clientLists.watchlist.forEach((id: string) => userLists.watchlist.add(id));
      }
      if (Array.isArray(clientLists.favorites)) {
        clientLists.favorites.forEach((id: string) => userLists.favorites.add(id));
      }
      if (Array.isArray(clientLists.watched)) {
        clientLists.watched.forEach((id: string) => userLists.watched.add(id));
      }
    } else if (titleId && listType) {
      const targetSet: Set<string> =
        listType === 'favorites'
          ? userLists.favorites
          : listType === 'watched'
          ? userLists.watched
          : userLists.watchlist;

      if (action === 'remove') {
        targetSet.delete(titleId);
      } else {
        targetSet.add(titleId);
      }
    }

    return NextResponse.json({
      success: true,
      watchlist: Array.from(userLists.watchlist),
      favorites: Array.from(userLists.favorites),
      watched: Array.from(userLists.watched),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'List update failed' }, { status: 500 });
  }
}
