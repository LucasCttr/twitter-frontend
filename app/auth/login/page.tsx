import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginClient from "./LoginClient";

export default async function LoginPage() {
  const cookieStore = await cookies();
  let accessToken: string | undefined | null = undefined;
  if (cookieStore && typeof (cookieStore as any).get === 'function') {
    accessToken = (cookieStore as any).get('accessToken')?.value;
  } else {
    try {
      const raw = (cookieStore as any)?.toString?.();
      const m = raw?.match(/(?:^|; )accessToken=([^;]+)/);
      accessToken = m?.[1];
    } catch (e) {
      accessToken = undefined;
    }
  }
  if (accessToken) redirect('/home');
  return <LoginClient />;
}
