import { NextRequest, NextResponse } from 'next/server';
import { ApiGateway } from '@/server/gateway/ApiGateway';

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path || [];
  const service = path[0] || 'health';
  const action = path[1] || 'default';

  const searchParams = req.nextUrl.searchParams;
  const queryParams: Record<string, any> = {};
  searchParams.forEach((val, key) => {
    queryParams[key] = val;
  });

  const gateway = ApiGateway.getInstance();
  const result = gateway.handleRequest(service, action, queryParams);

  return NextResponse.json(result, { status: result.status });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path || [];
  const service = path[0] || 'health';
  const action = path[1] || 'default';

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const gateway = ApiGateway.getInstance();
  const result = gateway.handleRequest(service, action, body);

  return NextResponse.json(result, { status: result.status });
}

