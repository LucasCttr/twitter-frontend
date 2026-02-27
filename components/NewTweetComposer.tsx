"use client"

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NewTweetComposer() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/proxy/tweets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
        credentials: "same-origin",
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Failed to post: ${res.status} ${body}`);
      }
      setContent("");
      // refresh server components to show new tweet
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-b bg-white dark:bg-zinc-900">
      <label className="sr-only">Nuevo tweet</label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's happening?"
        className="w-full min-h-[72px] resize-none rounded-md border p-3 text-base text-zinc-900 dark:text-zinc-100 bg-transparent border-zinc-200 dark:border-zinc-700"
      />
      <div className="mt-3 flex items-center justify-end gap-2">
        {error && <div className="text-sm text-red-600 mr-auto">{error}</div>}
        <Button type="submit" disabled={loading || !content.trim()}>
          {loading ? "Publicando..." : "Twittear"}
        </Button>
      </div>
    </form>
  );
}
