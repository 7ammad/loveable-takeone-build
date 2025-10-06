'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export interface ProfileCompletionStep {
  id: string;
  label: string;
  completed: boolean;
  href: string;
  priority: 'critical' | 'important' | 'optional';
}

interface ProfileCompletionProps {
  steps: ProfileCompletionStep[];
  completionPercentage: number;
}

export function ProfileCompletion({ steps, completionPercentage }: ProfileCompletionProps) {
  const completedSteps = steps.filter((s) => s.completed).length;
  const totalSteps = steps.length;

  // Determine status
  const isComplete = completionPercentage === 100;
  const isCritical = completionPercentage < 50;

  return (
    <Card className={`${isCritical ? 'border-orange-500 border-2' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {isCritical && <AlertCircle className="w-5 h-5 text-orange-500" />}
              Profile Completion
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {isComplete 
                ? 'Your profile is complete!' 
                : `${completedSteps} of ${totalSteps} steps completed`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-foreground">{completionPercentage}%</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-3 mb-6">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              isComplete
                ? 'bg-green-500'
                : isCritical
                ? 'bg-orange-500'
                : 'bg-primary'
            }`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {/* Completion Steps */}
        {!isComplete && (
          <div className="space-y-3">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  step.completed ? 'bg-muted/50 border-muted' : 'border-border hover:bg-muted/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className={`w-5 h-5 flex-shrink-0 ${
                      step.priority === 'critical' ? 'text-orange-500' : 'text-muted-foreground'
                    }`} />
                  )}
                  <div>
                    <p className={`text-sm font-medium ${
                      step.completed ? 'text-muted-foreground line-through' : 'text-foreground'
                    }`}>
                      {step.label}
                    </p>
                    {!step.completed && step.priority === 'critical' && (
                      <p className="text-xs text-orange-600 mt-0.5">Required for applications</p>
                    )}
                  </div>
                </div>
                {!step.completed && (
                  <Link href={step.href}>
                    <Button size="sm" variant="ghost">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}

        {isComplete && (
          <div className="text-center py-4">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Your profile looks great! Casters can now discover you.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

