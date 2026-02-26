export async function fetchTweetsClient() {
  const res = await fetch('/api/proxy/tweets');
  if (!res.ok) throw new Error('Failed to fetch tweets');
  return res.json();
}

// Server-side helper for app routes or server components
import { getToken } from "next-auth/jwt";

export async function serverFetch(path: string, req: Request) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const accessToken = (token as any)?.accessToken;
  const url = `${process.env.BACKEND_URL}${path}`;
  const res = await fetch(url, {
    headers: { Authorization: accessToken ? `Bearer ${accessToken}` : '' },
  });
  const data = await res.json();
  return { status: res.status, data };
}
