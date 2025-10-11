'use client';

/**
 * Admin Usage Metrics Dashboard
 * Tracks API usage and costs across all services in SAR
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RefreshCw,
  Download
} from 'lucide-react';

interface ServiceUsage {
  name: string;
  category: 'AI' | 'Infrastructure' | 'Communication' | 'Storage' | 'Payment';
  currentUsage: number;
  limit: number;
  unit: string;
  costPerUnit: number;
  totalCost: number;
  currency: 'SAR';
  status: 'healthy' | 'warning' | 'critical';
  lastUpdated: string;
  billingCycle: 'monthly' | 'daily';
}

interface UsageSummary {
  totalCost: number;
  projectedMonthlyCost: number;
  compared: {
    lastMonth: number;
    percentChange: number;
  };
  breakdown: {
    ai: number;
    infrastructure: number;
    communication: number;
    storage: number;
    payment: number;
  };
}

export default function UsageMetricsPage() {
  const [services, setServices] = useState<ServiceUsage[]>([]);
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('month');

  useEffect(() => {
    fetchUsageMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const fetchUsageMetrics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/admin/usage-metrics?range=${dateRange}`);
      const data = await response.json();
      
      if (data.success) {
        setServices(data.services);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch usage metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'AI': return 'bg-purple-100 text-purple-800';
      case 'Infrastructure': return 'bg-blue-100 text-blue-800';
      case 'Communication': return 'bg-green-100 text-green-800';
      case 'Storage': return 'bg-orange-100 text-orange-800';
      case 'Payment': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatSAR = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const exportToCSV = () => {
    const headers = ['Service', 'Category', 'Usage', 'Limit', 'Unit', 'Cost (SAR)', 'Status'];
    const rows = services.map(s => [
      s.name,
      s.category,
      s.currentUsage,
      s.limit,
      s.unit,
      s.totalCost,
      s.status
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usage-metrics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" asChild size="sm">
              <Link href="/admin">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold">Usage & Costs</h1>
          <p className="text-gray-600">Monitor API usage and costs across all services</p>
        </div>
        
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          
          <Button onClick={fetchUsageMetrics} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          <Button onClick={exportToCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Cost */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Cost (MTD)</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {formatSAR(summary.totalCost)}
                  </h3>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projected Cost */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Projected (EOM)</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {formatSAR(summary.projectedMonthlyCost)}
                  </h3>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compared to Last Month */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">vs Last Month</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {summary.compared.percentChange > 0 ? '+' : ''}
                    {summary.compared.percentChange.toFixed(1)}%
                  </h3>
                </div>
                <div className={`p-3 rounded-full ${
                  summary.compared.percentChange > 0 
                    ? 'bg-red-100' 
                    : 'bg-green-100'
                }`}>
                  {summary.compared.percentChange > 0 ? (
                    <TrendingUp className="w-6 h-6 text-red-600" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-green-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cost Alerts</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {services.filter(s => s.status !== 'healthy').length}
                  </h3>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cost Breakdown by Category */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown by Category</CardTitle>
            <CardDescription>Current month spending across service categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(summary.breakdown).map(([category, cost]) => {
                const percentage = (cost / summary.totalCost) * 100;
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize">{category}</span>
                      <span className="text-gray-600">{formatSAR(cost)} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>Service Usage Details</CardTitle>
          <CardDescription>API usage and costs per service</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Service</th>
                  <th className="text-left p-4 font-medium">Category</th>
                  <th className="text-right p-4 font-medium">Usage</th>
                  <th className="text-right p-4 font-medium">Limit</th>
                  <th className="text-right p-4 font-medium">% Used</th>
                  <th className="text-right p-4 font-medium">Cost (SAR)</th>
                  <th className="text-center p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service, index) => {
                  const percentUsed = (service.currentUsage / service.limit) * 100;
                  
                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-xs text-gray-500">Updated: {new Date(service.lastUpdated).toLocaleString('ar-SA')}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={getCategoryColor(service.category)}>
                          {service.category}
                        </Badge>
                      </td>
                      <td className="text-right p-4">
                        <span className="font-mono">
                          {service.currentUsage.toLocaleString()} {service.unit}
                        </span>
                      </td>
                      <td className="text-right p-4">
                        <span className="font-mono text-gray-600">
                          {service.limit.toLocaleString()} {service.unit}
                        </span>
                      </td>
                      <td className="text-right p-4">
                        <div className="flex flex-col items-end gap-1">
                          <span className={`font-medium ${
                            percentUsed > 90 ? 'text-red-600' : 
                            percentUsed > 70 ? 'text-yellow-600' : 
                            'text-green-600'
                          }`}>
                            {percentUsed.toFixed(1)}%
                          </span>
                          <div className="w-20 bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                percentUsed > 90 ? 'bg-red-600' : 
                                percentUsed > 70 ? 'bg-yellow-600' : 
                                'bg-green-600'
                              }`}
                              style={{ width: `${Math.min(percentUsed, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="text-right p-4">
                        <span className="font-medium">{formatSAR(service.totalCost)}</span>
                        <p className="text-xs text-gray-500">
                          {formatSAR(service.costPerUnit)}/{service.unit}
                        </p>
                      </td>
                      <td className="text-center p-4">
                        <Badge className={`${getStatusColor(service.status)} border`}>
                          {service.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Cost Optimization Tips */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">💡 Cost Optimization Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 space-y-2">
          <ul className="list-disc list-inside space-y-2">
            <li>Webhook integration saves ~18,000 Whapi API calls/month (SAR 37.50/month)</li>
            <li>Pre-filter blocks 80%+ messages before expensive LLM calls</li>
            <li>Cache frequently accessed data to reduce database queries</li>
            <li>Use Redis for rate limiting instead of database lookups</li>
            <li>Monitor and set budget alerts at 80% threshold</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

