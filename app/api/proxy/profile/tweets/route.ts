import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = token.id;
  if (!userId) return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const cursor = searchParams.get("cursor");
  const limit = searchParams.get("limit");
  let url = `${process.env.BACKEND_URL}/tweets?authorId=${userId}`;
  if (type) url += `&type=${type}`;
  if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`;
  if (limit) url += `&limit=${encodeURIComponent(limit)}`;
  const backendRes = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
      "Content-Type": "application/json",
    },
  });
  const data = await backendRes.json();
  return NextResponse.json(data, { status: backendRes.status });
}
