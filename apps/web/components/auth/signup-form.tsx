"use client";

import { useCallback, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUp } from "@/lib/actions";
import type { UserRole } from "@/lib/definitions";

const roleOptions: Array<{
  label: string;
  value: UserRole;
  description: string;
}> = [
  {
    label: "Talent",
    value: "TALENT",
    description: "Create a verified profile, upload media, and apply once Nafath is complete.",
  },
  {
    label: "Guardian",
    value: "GUARDIAN",
    description: "Manage minors’ profiles, consent workflows, and application responses.",
  },
  {
    label: "Hirer",
    value: "HIRER",
    description: "Post casting calls, unlock search, and manage pipelines via Professional Access.",
  },
];

const socialProviders = [
  { id: "apple", label: "Continue with Apple" },
  { id: "google", label: "Continue with Google" },
  { id: "linkedin", label: "Continue with LinkedIn", roles: ["HIRER"] as UserRole[] },
];

interface SignupFormProps {
  onRoleChange?: (role: UserRole) => void;
}

export function SignupForm({ onRoleChange }: SignupFormProps) {
  const [email, setEmail] = useState("productions@studio.sa");
  const [password, setPassword] = useState("SecurePass123!");
  const [role, setRole] = useState<UserRole>("HIRER");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRoleSelect = useCallback(
    (nextRole: UserRole) => {
      setRole(nextRole);
      onRoleChange?.(nextRole);
    },
    [onRoleChange],
  );

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await signUp({ email, role });
      setMessage(result.message);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Request pilot access</h1>
        <p className="text-sm text-muted">
          Choose the role that best describes you. Guardians manage minors end-to-end and complete Nafath before applying.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {roleOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleRoleSelect(option.value)}
            aria-pressed={role === option.value}
            className={"text-left"}
          >
            <div
              className={`rounded-[var(--radius-md)] border p-4 transition ${
                role === option.value
                  ? "border-[var(--color-brand)] bg-[var(--color-brand)]/10 shadow-token-sm"
                  : "border-[var(--color-border)] bg-[var(--color-elev-1)] hover:border-[var(--color-brand)]/60"
              }`}
            >
              <p className="text-sm font-semibold">{option.label}</p>
              <p className="mt-2 text-xs text-muted">{option.description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">
            Work email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@production.sa"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full" loading={isPending}>
        Continue
      </Button>

      <div className="space-y-2 text-sm text-muted">
        <p className="text-center text-xs uppercase tracking-wide">Or</p>
        <div className="grid gap-2">
          {socialProviders
            .filter((provider) => !provider.roles || provider.roles.includes(role))
            .map((provider) => (
              <Button key={provider.id} type="button" variant="outline" className="w-full justify-center">
                {provider.label}
              </Button>
            ))}
        </div>
      </div>

      <p className="text-xs text-muted">
        By creating an account you agree to our Terms, Privacy Notice, and PDPL obligations. We require Nafath verification before any application or shortlist.
      </p>

      {message && <p className="rounded-[var(--radius-md)] bg-[var(--color-brand)]/10 px-4 py-3 text-sm text-[var(--color-brand-600)]">{message}</p>}

      <p className="text-center text-xs text-muted">
        Already onboarded? <a href="/login" className="font-semibold text-[var(--color-brand)]">Sign in</a>.
      </p>
    </form>
  );
}
