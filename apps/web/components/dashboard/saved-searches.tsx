"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { SavedSearch } from "@/lib/definitions";
import { disableSavedSearch, saveSearch } from "@/lib/actions";
import { cn } from "@/lib/utils";

interface SavedSearchesProps {
  initialSearches: SavedSearch[];
  userId: string;
}

const frequencyOptions: Array<SavedSearch["frequency"]> = ["instant", "daily", "weekly"];

export function SavedSearchesPanel({ initialSearches, userId }: SavedSearchesProps) {
  const [searches, setSearches] = useState(initialSearches);
  const [name, setName] = useState("New saved search");
  const [query, setQuery] = useState("");
  const [frequency, setFrequency] = useState<SavedSearch["frequency"]>("instant");
  const [isPending, startTransition] = useTransition();

  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const response = await saveSearch({
      userId,
      name,
      params: query ? { query } : {},
      channels: ["email"],
      frequency,
    });
      if (response.success && response.data) {
        setSearches((prev) => [
          {
            id: (response.data?.id ?? `saved-search-${searches.length + 50}`),
            userId,
            name,
            params: query ? { query } : {},
            channels: ["email"],
            frequency,
            active: true,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
        setName("New saved search");
        setQuery("");
        setFrequency("instant");
      }
    });
  }

  function handleDeactivate(id: string) {
    startTransition(async () => {
      const response = await disableSavedSearch(id);
      if (response.success) {
        setSearches((prev) =>
          prev.map((search) => (search.id === id ? { ...search, active: false } : search)),
        );
      }
    });
  }

  return (
    <div className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-elev-1)] p-6 shadow-token-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">Saved searches</h3>
        <span className="text-xs text-muted">Stay notified when matching roles go live</span>
      </div>

      <form onSubmit={handleCreate} className="grid gap-3 rounded-[var(--radius-md)] bg-[var(--color-surface)] p-4 sm:grid-cols-[1fr_1fr_140px_auto]">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Commercial roles in Riyadh"
          required
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Optional keyword filter"
        />
        <Select value={frequency} onChange={(event) => setFrequency(event.target.value as SavedSearch["frequency"])}>
          {frequencyOptions.map((option) => (
            <option key={option} value={option}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </option>
          ))}
        </Select>
        <Button type="submit" loading={isPending}>
          Save
        </Button>
      </form>

      <div className="space-y-3 text-sm">
        {searches.length === 0 && <p className="text-muted">No saved searches yet. Create one to receive alerts.</p>}
        {searches.map((search) => (
          <div
            key={search.id}
            className={cn(
              "flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border px-4 py-3",
              search.active ? "border-[var(--color-border)]" : "border-dashed border-[var(--color-border)] bg-[var(--color-surface)]",
            )}
          >
            <div className="space-y-1">
              <p className="font-medium">{search.name}</p>
              <p className="text-xs text-muted">
                Frequency: {search.frequency} • Channels: {search.channels.join(", ")}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {search.active ? (
                <Button variant="outline" size="sm" onClick={() => handleDeactivate(search.id)} disabled={isPending}>
                  Pause
                </Button>
              ) : (
                <span className="text-muted">Paused</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
