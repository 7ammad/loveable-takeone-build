import { SubscriptionPlans } from "@/components/forms/subscription-plans";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { subscriptionPlans, getSubscriptionByHirer } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export default async function SubscriptionPage() {
  const hirer = await getCurrentUser("HIRER");
  const currentSubscription = hirer ? getSubscriptionByHirer(hirer.id) : undefined;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <Card>
        <CardHeader>
          <CardTitle>Professional Access</CardTitle>
          <CardDescription>Subscription unlocks unlimited casting calls, full search, and concierge compliance.</CardDescription>
        </CardHeader>
        <CardContent>
          {hirer ? (
            <SubscriptionPlans plans={subscriptionPlans} hirerUserId={hirer.id} />
          ) : (
            <p className="text-sm text-slate-500">Sign in as a hirer to manage subscriptions.</p>
          )}
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <span>Current plan</span>
            <Badge variant={currentSubscription ? "success" : "warning"}>
              {currentSubscription ? currentSubscription.planId : "Not active"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Renewal date</span>
            <span className="text-xs text-slate-500">
              {currentSubscription ? formatDate(currentSubscription.currentPeriodEnd) : "—"}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Billing is processed via Stripe/Moyasar depending on client preference. Reach out to
            <a className="ml-1 font-semibold text-emerald-600" href="mailto:billing@scm.sa">
              billing@scm.sa
            </a>
            for invoices.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
