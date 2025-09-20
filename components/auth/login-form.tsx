"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/actions";

const socialProviders = [
  "Continue with Apple",
  "Continue with Google",
  "Continue with LinkedIn",
];

export function LoginForm() {
  const [email, setEmail] = useState("casting@riyadhmedia.sa");
  const [password, setPassword] = useState("password123");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await signIn({ email, password });
      setMessage(result.message);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="text-sm text-muted">
          Professional Access requires an active subscription. Need a seat?
          <Link href="/signup?role=hirer" className="ml-1 font-semibold text-[var(--color-brand)]">
            Request access
          </Link>
          .
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">
            Work email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@studio.sa"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <label className="font-medium" htmlFor="password">
              Password
            </label>
            <Link href="/reset-password" className="text-[var(--color-brand)]">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full" loading={isPending}>
        Sign in
      </Button>

      <Button type="button" variant="outline" className="w-full justify-center">
        Send magic link
      </Button>

      <div className="space-y-2 text-sm text-muted">
        <p className="text-center text-xs uppercase tracking-wide">Or</p>
        <div className="grid gap-2">
          {socialProviders.map((label) => (
            <Button key={label} type="button" variant="outline" className="w-full justify-center">
              {label}
            </Button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted">
        By signing in you agree to PDPL-aligned processing and our trust & safety guidelines.
      </p>

      {message && (
        <p className="rounded-[var(--radius-md)] bg-[var(--color-brand)]/10 px-4 py-3 text-sm text-[var(--color-brand-600)]">
          {message}
        </p>
      )}
    </form>
  );
}
