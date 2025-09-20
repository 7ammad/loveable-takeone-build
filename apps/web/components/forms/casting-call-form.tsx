"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { createCastingCall } from "@/lib/actions";
import type { CastingCallStatus } from "@/lib/definitions";

const statusOptions: CastingCallStatus[] = ["DRAFT", "OPEN", "CLOSED"];

interface CastingCallFormProps {
  hirerUserId: string;
}

export function CastingCallForm({ hirerUserId }: CastingCallFormProps) {
  const [title, setTitle] = useState("New production");
  const [project, setProject] = useState("Project name");
  const [status, setStatus] = useState<CastingCallStatus>("DRAFT");
  const [city, setCity] = useState("Riyadh");
  const [shootStart, setShootStart] = useState("2025-11-01");
  const [shootEnd, setShootEnd] = useState("2025-11-10");
  const [description, setDescription] = useState("Outline your casting goals, deliverables, and timelines.");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const response = await createCastingCall({
        hirerUserId,
        payload: {
          title,
          project,
          status,
          city,
          shootStart,
          shootEnd,
        },
      });
      setMessage(response.message);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Casting call title</Label>
          <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="project">Project name</Label>
          <Input id="project" value={project} onChange={(event) => setProject(event.target.value)} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Project overview</Label>
        <Textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} required />
        <p className="text-xs text-slate-500">Include deliverables, tone, and any brand safety considerations.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select id="status" value={status} onChange={(event) => setStatus(event.target.value as CastingCallStatus)}>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" value={city} onChange={(event) => setCity(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shootStart">Shoot window</Label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="shootStart"
              type="date"
              value={shootStart}
              onChange={(event) => setShootStart(event.target.value)}
            />
            <Input
              id="shootEnd"
              type="date"
              value={shootEnd}
              onChange={(event) => setShootEnd(event.target.value)}
            />
          </div>
        </div>
      </div>

      <Button type="submit" loading={isPending}>
        Save casting call draft
      </Button>

      {message && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
    </form>
  );
}
