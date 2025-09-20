"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createMediaUploadRequest } from "@/lib/actions";

interface UploadStubProps {
  userId: string;
}

export function MediaUploadStub({ userId }: UploadStubProps) {
  const [filename, setFilename] = useState("self-tape.mp4");
  const [mime, setMime] = useState("video/mp4");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const response = await createMediaUploadRequest({ userId, filename, mime });
      if (response.success && response.data) {
        setMessage(`Upload URL: ${response.data.uploadUrl}\nFile URL: ${response.data.fileUrl}`);
      } else {
        setMessage(response.message);
      }
    });
  }

  return (
    <div className="space-y-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm">
      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <Input value={filename} onChange={(event) => setFilename(event.target.value)} placeholder="Filename" required />
        <Input value={mime} onChange={(event) => setMime(event.target.value)} placeholder="MIME type" required />
        <Button type="submit" loading={isPending}>
          Request upload
        </Button>
      </form>
      <p className="text-xs text-muted">
        This stub simulates requesting a pre-signed upload URL. In production the client would upload the file directly to
        object storage using the given link.
      </p>
      {message && (
        <pre className="whitespace-pre-wrap rounded-[var(--radius-md)] bg-[var(--color-elev-1)] p-3 text-xs text-muted">
          {message}
        </pre>
      )}
    </div>
  );
}