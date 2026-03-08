import { NextResponse, NextRequest } from "next/server";
import forwardWithAutoRefresh from "../_utils";

export async function GET(req: NextRequest) {
  // forward query params as-is to backend /bookmarks
  const { searchParams } = new URL(req.url);
  const backendUrl = new URL(`${process.env.BACKEND_URL}/bookmarks`);
  for (const [key, value] of searchParams.entries()) {
    if (!value) continue;
    backendUrl.searchParams.set(key, value);
  }

  const result = await forwardWithAutoRefresh(req, backendUrl.toString(), { method: 'GET' });
  const res = NextResponse.json(result.data, { status: result.status });
  if (result.newAccessToken) res.cookies.set({ name: 'accessToken', value: result.newAccessToken, httpOnly: true, path: '/' });
  if (result.newRefreshToken) res.cookies.set({ name: 'refreshToken', value: result.newRefreshToken, httpOnly: true, path: '/' });
  return res;
}

export async function POST(req: NextRequest) {
  let body: any = null;
  try { body = await req.json(); } catch(e) { body = null; }
  const backendUrl = `${process.env.BACKEND_URL}/bookmarks`;
  const result = await forwardWithAutoRefresh(req, backendUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  const res = NextResponse.json(result.data ?? { message: 'OK' }, { status: result.status });
  if (result.newAccessToken) res.cookies.set({ name: 'accessToken', value: result.newAccessToken, httpOnly: true, path: '/' });
  if (result.newRefreshToken) res.cookies.set({ name: 'refreshToken', value: result.newRefreshToken, httpOnly: true, path: '/' });
  return res;
}

export async function DELETE(req: NextRequest) {
  let body: any = null;
  try { body = await req.json(); } catch(e) { body = null; }
  // Support deletion by id in body or query
  const urlObj = new URL(req.url);
  const idFromQuery = urlObj.searchParams.get('tweetId') ?? urlObj.searchParams.get('id');
  const backendUrl = idFromQuery ? `${process.env.BACKEND_URL}/bookmarks/${encodeURIComponent(idFromQuery)}` : `${process.env.BACKEND_URL}/bookmarks`;
  const init: RequestInit = { method: 'DELETE', headers: {} };
  if (!idFromQuery) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(body ?? {});
  }
  const result = await forwardWithAutoRefresh(req, backendUrl, init);
  const res = NextResponse.json(result.data ?? { message: 'OK' }, { status: result.status });
  if (result.newAccessToken) res.cookies.set({ name: 'accessToken', value: result.newAccessToken, httpOnly: true, path: '/' });
  if (result.newRefreshToken) res.cookies.set({ name: 'refreshToken', value: result.newRefreshToken, httpOnly: true, path: '/' });
  return res;
}
