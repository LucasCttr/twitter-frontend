import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = token.id;
  if (!userId) return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  const url = `${process.env.BACKEND_URL}/users/${userId}`;
  const backendRes = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
      "Content-Type": "application/json",
    },
  });
  const data = await backendRes.json();
  return NextResponse.json(data, { status: backendRes.status });
}
