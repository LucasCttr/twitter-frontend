import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get('accessToken')?.value;
  if (!accessToken) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const incoming = req.nextUrl.searchParams;
  const limit = incoming.get('limit') ?? '20';
  const cursor = incoming.get('cursor');

  const backendBase = `${process.env.BACKEND_URL?.replace(/\/$/, '') ?? ''}/notifications`;
  const url = new URL(backendBase);
  url.searchParams.set('limit', limit);
  if (cursor) url.searchParams.set('cursor', cursor);

  const backendRes = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await backendRes.json().catch(() => null);
  return NextResponse.json(data, { status: backendRes.status });
}
