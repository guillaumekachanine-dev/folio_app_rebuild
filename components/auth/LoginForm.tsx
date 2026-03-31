"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <span className="text-[var(--primary)] font-semibold tracking-widest font-[var(--font-geist-mono)] text-2xl">
          FOLIO
        </span>
        <p className="mt-1 text-[var(--muted-foreground)] text-sm">
          Connexion à votre espace
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-[var(--card)] border border-[var(--border)] rounded-xl p-6"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs text-[var(--muted-foreground)]">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[var(--input)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-xs text-[var(--muted-foreground)]">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[var(--input)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
          />
        </div>

        {error && (
          <p className="text-xs text-[var(--destructive)]">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 bg-[var(--primary)] text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
