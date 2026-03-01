"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/home");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await signIn("credentials", { redirect: false, email, password });
    if (res?.error) {
      setError(res.error);
      return;
    }
    router.push("/home");
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 p-6">
    <Card className="w-full max-w-md p-6">
      <h1 className="text-2xl font-bold mb-6">Sign in</h1>
      {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <Input 
            type="email"
            placeholder="youremail@example.com"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Password</label>
          <Input 
            type="password"
            placeholder="••••••••"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>

        <Button type="submit" className="w-full">Sign in</Button>
      </form>
      <div className="mt-6 text-center">
        <a href="/auth/register" className="text-sm text-blue-600 hover:underline">
          Don't have an account? Sign up
        </a>
      </div>
    </Card>
  </div>
);
}
