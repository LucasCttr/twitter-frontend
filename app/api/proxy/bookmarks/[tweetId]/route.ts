import { NextRequest, NextResponse } from "next/server";
import forwardWithAutoRefresh from "../../_utils";

export async function POST(req: NextRequest, context: any) {
  const params = await (context as any).params;
  const { tweetId } = params;
  const apiUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? process.env.BACKEND_URL)?.replace(/\/$/, "");
  if (!apiUrl) return NextResponse.json({ error: "Backend URL not configured" }, { status: 500 });

  const backendUrl = `${apiUrl}/bookmarks/${encodeURIComponent(tweetId)}`;
  const bodyText = await req.text();
  const result = await forwardWithAutoRefresh(req, backendUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: bodyText,
  });

  const res = NextResponse.json(result.data, { status: result.status });
  if (result.newAccessToken) res.cookies.set({ name: 'accessToken', value: result.newAccessToken, httpOnly: true, path: '/' });
  if (result.newRefreshToken) res.cookies.set({ name: 'refreshToken', value: result.newRefreshToken, httpOnly: true, path: '/' });
  return res;
}

export async function DELETE(req: NextRequest, context: any) {
  const params = await (context as any).params;
  const { tweetId } = params;
  const apiUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? process.env.BACKEND_URL)?.replace(/\/$/, "");
  if (!apiUrl) return NextResponse.json({ error: "Backend URL not configured" }, { status: 500 });

  const backendUrl = `${apiUrl}/bookmarks/${encodeURIComponent(tweetId)}`;
  const result = await forwardWithAutoRefresh(req, backendUrl, { method: 'DELETE' });
  const res = NextResponse.json(result.data, { status: result.status });
  if (result.newAccessToken) res.cookies.set({ name: 'accessToken', value: result.newAccessToken, httpOnly: true, path: '/' });
  if (result.newRefreshToken) res.cookies.set({ name: 'refreshToken', value: result.newRefreshToken, httpOnly: true, path: '/' });
  return res;
}
