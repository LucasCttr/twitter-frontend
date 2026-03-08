import { NextRequest } from "next/server";
import { normalizeTweet } from "@/lib/normalizeTweet";

type ForwardResult = {
  status: number;
  data: any;
  newAccessToken?: string | null;
  newRefreshToken?: string | null;
};

export async function forwardWithAutoRefresh(req: NextRequest, backendUrl: string, init: RequestInit = {}): Promise<ForwardResult> {
  // Read tokens from incoming cookies
  const accessToken = req.cookies.get('accessToken')?.value ?? null;
  const refreshToken = req.cookies.get('refreshToken')?.value ?? null;

  const headers: Record<string, string> = { ...(init.headers as Record<string, string> || {}) };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  // First attempt
  let backendRes = await fetch(backendUrl, { ...init, headers });
  let data: any = null;
  try { data = await backendRes.json(); } catch(e) { data = null; }

  // Normalize tweet-like objects in the response so front-end receives a consistent shape
  function looksLikeTweet(obj: any) {
    return obj && typeof obj === 'object' && ('id' in obj) && (obj.author || obj.content || obj.text || obj.tweet || obj?.authorId);
  }

  function deepNormalize(obj: any): any {
    if (obj == null) return obj;
    if (Array.isArray(obj)) return obj.map(deepNormalize);
    if (looksLikeTweet(obj)) return normalizeTweet(obj);
    if (typeof obj === 'object') {
      const out: any = {};
      for (const k of Object.keys(obj)) {
        out[k] = deepNormalize(obj[k]);
      }
      return out;
    }
    return obj;
  }

  if (backendRes.status !== 401) {
    try { data = deepNormalize(data); } catch (e) { /* best-effort */ }
    return { status: backendRes.status, data };
  }

  // If 401 and we have a refresh token, try to refresh
  if (!refreshToken) {
    return { status: 401, data };
  }

  try {
    const refreshRes = await fetch(`${process.env.BACKEND_URL}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: `refreshToken=${refreshToken}` },
    });
    const refreshData = await refreshRes.json().catch(() => null);
    if (!refreshRes.ok) {
      return { status: 401, data };
    }

    const newAccessToken = refreshData?.token ?? refreshData?.accessToken ?? null;
    const newRefreshToken = refreshData?.refreshToken ?? refreshData?.refresh_token ?? null;

    if (!newAccessToken) return { status: 401, data };

    // Retry original request with new access token
    const retryHeaders = { ...(init.headers as Record<string, string> || {}) };
    retryHeaders['Authorization'] = `Bearer ${newAccessToken}`;
    backendRes = await fetch(backendUrl, { ...init, headers: retryHeaders });
    let retryData: any = null;
    try { retryData = await backendRes.json(); } catch(e) { retryData = null; }
    try { retryData = deepNormalize(retryData); } catch (e) { /* best-effort */ }
    return { status: backendRes.status, data: retryData, newAccessToken, newRefreshToken };
  } catch (err) {
    try { data = deepNormalize(data); } catch (e) { /* best-effort */ }
    return { status: 401, data };
  }
}

export default forwardWithAutoRefresh;
