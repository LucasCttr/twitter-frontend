import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!apiUrl) return NextResponse.json({ error: "Backend URL not configured" }, { status: 500 });

  let headers: Record<string, string> = { "Content-Type": "application/json" };
  try {
    type SessionWithToken = { accessToken?: string } & Record<string, any>;
    const session = await getServerSession(authOptions as any) as SessionWithToken;
    if (session?.accessToken) {
      headers["Authorization"] = `Bearer ${session.accessToken}`;
    }
  } catch (e) {}

  const body = await req.text();
  const res = await fetch(`${apiUrl.replace(/\/$/, "")}/tweets/${id}/reply`, {
    method: "POST",
    headers,
    body,
  });

  const data = await res.text();
  return new NextResponse(data, { status: res.status, headers: { "Content-Type": "application/json" } });
}
