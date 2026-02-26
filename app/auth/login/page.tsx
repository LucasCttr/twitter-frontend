"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

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
    // success
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-6 border rounded">
        <h1 className="text-2xl mb-4">Iniciar sesión</h1>
        {error && <div className="mb-3 text-red-600">{error}</div>}
        <label className="block mb-2">
          <span>Email</span>
          <input className="mt-1 block w-full" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block mb-4">
          <span>Contraseña</span>
          <input type="password" className="mt-1 block w-full" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">Entrar</button>
      </form>
    </div>
  );
}
