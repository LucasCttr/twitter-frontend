import { NextRequest, NextResponse } from "next/server";

async function forward(req: NextRequest, method: string) {
  const url = new URL(req.url);
  const parts = url.pathname.split('/');
  // parts: ['', 'api', 'proxy', 'users', ':id', 'follow', 'route'] maybe; find id
  const idIndex = parts.findIndex(p => p === 'users') + 1;
  const id = parts[idIndex];
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const accessToken = req.cookies.get('accessToken')?.value;
  const backendUrl = `${process.env.BACKEND_URL}/users/${encodeURIComponent(id)}/follow`;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const backendRes = await fetch(backendUrl, { method, headers });
  const data = await backendRes.json().catch(() => null);
  return NextResponse.json(data, { status: backendRes.status });
}

export async function POST(req: NextRequest) {
  return forward(req, 'POST');
}

export async function DELETE(req: NextRequest) {
  return forward(req, 'DELETE');
}
