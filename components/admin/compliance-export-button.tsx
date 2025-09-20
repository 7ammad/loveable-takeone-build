"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { exportCompliancePack } from "@/lib/actions";

interface ComplianceExportButtonProps {
  subjectId: string;
}

export function ComplianceExportButton({ subjectId }: ComplianceExportButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleClick() {
    startTransition(async () => {
      const response = await exportCompliancePack({ subjectId });
      setMessage(response.message + (response.data ? ` Download: ${response.data.downloadUrl}` : ""));
    });
  }

  return (
    <div className="space-y-2">
      <Button variant="outline" size="sm" onClick={handleClick} loading={isPending}>
        Export compliance pack
      </Button>
      {message && <p className="text-xs text-muted">{message}</p>}
    </div>
  );
}