import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get('accessToken')?.value;
  if (!accessToken) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // Obtener los parámetros de la query string
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const take = searchParams.get("take");

  // Decide target: if any search/filter params present, forward to /tweets, else /feed
  const hasSearch = searchParams.has('q') || searchParams.has('content') || searchParams.has('sort');
  const targetPath = hasSearch ? '/tweets' : '/feed';
  const backendUrl = new URL(`${process.env.BACKEND_URL}${targetPath}`);

  // Forward all query params as-is (do NOT map `q` -> `content`) so both tweets and users use `q`.
  for (const [key, value] of searchParams.entries()) {
    if (!value) continue;
    backendUrl.searchParams.set(key, value);
  }

  const backendRes = await fetch(backendUrl.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  let data;
  try {
    data = await backendRes.json();
  } catch (e) {
    data = null;
  }
  return NextResponse.json(data, { status: backendRes.status });
}

export async function POST(req: NextRequest) {
  const accessToken = req.cookies.get('accessToken')?.value;
  if (!accessToken) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  let body: any = null;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  const backendRes = await fetch(`${process.env.BACKEND_URL}/tweets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: accessToken ? `Bearer ${accessToken}` : '',
    },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json().catch(() => null);
  return NextResponse.json(data ?? { message: 'OK' }, { status: backendRes.status });
}
