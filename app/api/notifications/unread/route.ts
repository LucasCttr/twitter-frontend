import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get('accessToken')?.value;
  if (!accessToken) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const backendUrl = `${process.env.BACKEND_URL?.replace(/\/$/, '') ?? ''}/notifications/unread`;
  const backendRes = await fetch(backendUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await backendRes.json().catch(() => null);
  return NextResponse.json(data, { status: backendRes.status });
}
