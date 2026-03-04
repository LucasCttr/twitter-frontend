import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const { searchParams } = url;
  const accessToken = req.cookies.get('accessToken')?.value;
  if (!accessToken) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const backendUrl = new URL(`${process.env.BACKEND_URL}/users`);
  for (const [k, v] of searchParams.entries()) {
    if (v) backendUrl.searchParams.set(k, v);
  }

  const backendRes = await fetch(backendUrl.toString(), {
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : '',
    },
  });
  const data = await backendRes.json().catch(() => null);
  return NextResponse.json(data, { status: backendRes.status });
}
