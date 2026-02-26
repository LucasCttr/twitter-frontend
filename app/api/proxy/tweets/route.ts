import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const accessToken = (token as any).accessToken;
  const backendRes = await fetch(`${process.env.BACKEND_URL}/tweets`, {
    headers: { Authorization: accessToken ? `Bearer ${accessToken}` : '' },
  });
  const data = await backendRes.json();
  return NextResponse.json(data, { status: backendRes.status });
}
