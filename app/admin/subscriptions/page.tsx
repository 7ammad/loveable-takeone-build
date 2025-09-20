import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { subscriptionPlans, listSubscriptions, getUserById } from "@/lib/db";
import { formatDate } from "@/lib/utils";

const subscriptions = listSubscriptions();

export default function AdminSubscriptionsPage() {
  return (
    <div className="space-y-6">
      <Card className="bg-slate-900/40">
        <CardHeader>
          <CardTitle>Active subscriptions</CardTitle>
          <CardDescription>Monitor Professional Access adoption and renewal cadence.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {subscriptions.map((subscription) => {
            const hirer = getUserById(subscription.hirerUserId);
            const plan = subscriptionPlans.find((plan) => plan.id === subscription.planId);
            return (
              <div key={subscription.id} className="rounded-2xl border border-emerald-500/20 p-4 text-sm text-slate-300">
                <p className="text-lg font-semibold text-emerald-200">{plan?.name ?? subscription.planId}</p>
                <p className="text-xs text-slate-400">{hirer?.fullName}</p>
                <p className="mt-2 text-xs text-slate-400">Renewal: {formatDate(subscription.currentPeriodEnd)}</p>
              </div>
            );
          })}
          {subscriptions.length === 0 && <p>No active subscriptions during pilot.</p>}
        </CardContent>
      </Card>

      <Card className="bg-slate-900/40">
        <CardHeader>
          <CardTitle>Plan catalogue</CardTitle>
          <CardDescription>Review the pricing options offered to hirers.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {subscriptionPlans.map((plan) => (
            <div key={plan.id} className="rounded-2xl border border-emerald-500/20 p-4 text-sm text-slate-300">
              <p className="text-lg font-semibold text-emerald-200">{plan.name}</p>
              <p className="mt-2 text-xs uppercase tracking-wide text-emerald-400">{plan.billingInterval}</p>
              <ul className="mt-3 space-y-1 text-xs text-slate-400">
                {plan.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
