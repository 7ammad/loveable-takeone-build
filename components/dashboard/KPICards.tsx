'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface KPICardData {
  title: string;
  value: string | number;
  trend?: string;
  icon: LucideIcon;
  iconColor?: string;
}

interface KPICardsProps {
  cards: KPICardData[];
}

export default function KPICards({ cards }: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.iconColor || 'bg-primary/10'}`}>
                <Icon className={`w-5 h-5 ${card.iconColor ? '' : 'text-primary'}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{card.value}</div>
              {card.trend && (
                <p className="text-xs text-muted-foreground mt-1">{card.trend}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

