"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { submitNafathVerification } from "@/lib/actions";

interface NafathRequestProps {
  userId: string;
}

export function NafathRequest({ userId }: NafathRequestProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleClick() {
    startTransition(async () => {
      const response = await submitNafathVerification({ userId });
      setMessage(response.message);
    });
  }

  return (
    <div className="space-y-3">
      <Button onClick={handleClick} loading={isPending}>
        Launch Nafath Verification
      </Button>
      {message && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
    </div>
  );
}
