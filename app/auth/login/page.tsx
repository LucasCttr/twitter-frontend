"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await signIn("credentials", { redirect: false, email, password });
    if (res?.error) {
      setError(res.error);
      return;
    }
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 p-6">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl mb-4">Iniciar sesión</h1>
        {error && <div className="mb-3 text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm">Email</span>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>

          <label className="block">
            <span className="text-sm">Contraseña</span>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>

          <div className="flex justify-end">
            <Button type="submit">Entrar</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
