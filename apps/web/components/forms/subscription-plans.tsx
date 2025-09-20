"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { SubscriptionPlan } from "@/lib/definitions";
import { startSubscription } from "@/lib/actions";

interface SubscriptionPlansProps {
  plans: SubscriptionPlan[];
  hirerUserId: string;
}

export function SubscriptionPlans({ plans, hirerUserId }: SubscriptionPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState(plans[0]?.id ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const response = await startSubscription({ hirerUserId, planId: selectedPlan });
      setMessage(response.message);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          return (
            <button
              type="button"
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`flex flex-col gap-3 rounded-2xl border p-5 text-left transition ${isSelected ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-emerald-300"}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{plan.name}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-500">{plan.billingInterval}</p>
                </div>
                <p className="text-xl font-semibold text-emerald-600">SAR {plan.priceSAR}</p>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <Button type="submit" loading={isPending}>
        Activate Professional Access
      </Button>

      {message && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
    </form>
  );
}
