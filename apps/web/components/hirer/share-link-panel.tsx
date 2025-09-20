"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateShareLink } from "@/lib/actions";
import type { ShareLink } from "@/lib/definitions";

interface ShareLinkPanelProps {
  initialLinks: ShareLink[];
  hirerUserId: string;
  defaultRoleId?: string;
}

export function ShareLinkPanel({ initialLinks, hirerUserId, defaultRoleId }: ShareLinkPanelProps) {
  const [links, setLinks] = useState(initialLinks);
  const [roleId, setRoleId] = useState(defaultRoleId ?? "");
  const [days, setDays] = useState(7);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!roleId) {
      setMessage("Enter a role ID or casting call ID to share.");
      return;
    }
    startTransition(async () => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);
      const response = await generateShareLink({
        entityType: "Shortlist",
        entityId: roleId,
        createdByUserId: hirerUserId,
        expiresAt: expiresAt.toISOString(),
      });
      if (response.success && response.data) {
        setMessage(`Share link generated: ${response.data.token}`);
        setLinks((prev) => [
          {
            id: `share-link-${prev.length + 20}`,
            entityType: "Shortlist",
            entityId: roleId,
            token: response.data?.token ?? `share-token-${links.length + 20}`,
            createdByUserId: hirerUserId,
            createdAt: new Date().toISOString(),
            expiresAt: expiresAt.toISOString(),
            accessCount: 0,
          },
          ...prev,
        ]);
      }
    });
  }

  return (
    <div className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-elev-1)] p-6 shadow-token-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">Share shortlist</h3>
        <span className="text-xs text-muted">Generate a time-bound link for collaborators</span>
      </div>

      <form onSubmit={onCreate} className="grid gap-3 sm:grid-cols-[1fr_120px_auto]">
        <Input
          value={roleId}
          onChange={(event) => setRoleId(event.target.value)}
          placeholder="Role ID (e.g., role-1)"
          required
        />
        <Input
          type="number"
          min={1}
          max={30}
          value={days}
          onChange={(event) => setDays(Number(event.target.value))}
          placeholder="Days"
        />
        <Button type="submit" loading={isPending}>
          Generate link
        </Button>
      </form>

      {message && <p className="text-xs text-[var(--color-brand-600)]">{message}</p>}

      <div className="space-y-2 text-sm">
        {links.length === 0 && <p className="text-muted">No share links yet.</p>}
        {links.slice(0, 5).map((link) => (
          <div key={link.id} className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-3">
            <div className="space-y-1">
              <p className="font-medium">{link.entityId}</p>
              <p className="text-xs text-muted">Token: {link.token}</p>
            </div>
            <div className="text-xs text-muted">
              Expires {new Date(link.expiresAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
