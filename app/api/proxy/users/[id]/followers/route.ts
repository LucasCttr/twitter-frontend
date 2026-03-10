import { NextRequest, NextResponse } from "next/server";
import forwardWithAutoRefresh from "../../../_utils";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const parts = url.pathname.split('/');
  const idIndex = parts.findIndex(p => p === 'users') + 1;
  const id = parts[idIndex];
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { searchParams } = url;
  const cursor = searchParams.get('cursor');
  const limit = searchParams.get('limit');

  let backendUrl = `${process.env.BACKEND_URL}/users/${encodeURIComponent(id)}/followers`;
  const params: string[] = [];
  if (limit) params.push(`limit=${encodeURIComponent(limit)}`);
  if (cursor) params.push(`cursor=${encodeURIComponent(cursor)}`);
  if (params.length) backendUrl += `?${params.join('&')}`;

  const result = await forwardWithAutoRefresh(req, backendUrl, { method: 'GET' });
  const res = NextResponse.json(result.data, { status: result.status });
  if (result.newAccessToken) res.cookies.set({ name: 'accessToken', value: result.newAccessToken, httpOnly: true, path: '/' });
  if (result.newRefreshToken) res.cookies.set({ name: 'refreshToken', value: result.newRefreshToken, httpOnly: true, path: '/' });
  return res;
}
