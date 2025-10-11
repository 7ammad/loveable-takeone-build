/**
 * Admin API: Usage Metrics & Costs
 * Tracks API usage across all services and calculates costs in SAR
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@packages/core-db';
import { requireRole } from '@/lib/auth-helpers';

// Exchange rates (update periodically)
const USD_TO_SAR = 3.75;

// Service pricing (in USD, converted to SAR)
const SERVICE_PRICING = {
  // AI Services
  openai_gpt4_mini: {
    name: 'OpenAI GPT-4o-mini',
    category: 'AI' as const,
    costPerUnit: 0.00015 * USD_TO_SAR, // SAR per 1K tokens (input)
    unit: 'tokens',
    limit: 2000000, // 2M tokens/month (soft limit)
  },

  // Infrastructure
  upstash_redis: {
    name: 'Upstash Redis',
    category: 'Infrastructure' as const,
    costPerUnit: (0.2 * USD_TO_SAR) / 100000, // SAR per request (PAYG)
    unit: 'requests',
    limit: 1000000, // 1M requests/month
  },

  vercel_bandwidth: {
    name: 'Vercel Bandwidth',
    category: 'Infrastructure' as const,
    costPerUnit: (40 * USD_TO_SAR) / 100, // SAR per GB
    unit: 'GB',
    limit: 100, // 100GB/month
  },

  vercel_functions: {
    name: 'Vercel Functions',
    category: 'Infrastructure' as const,
    costPerUnit: (0.18 * USD_TO_SAR) / 1000, // SAR per 1K invocations
    unit: 'invocations',
    limit: 1000000, // 1M/month
  },

  // Communication
  whapi_cloud: {
    name: 'Whapi.Cloud WhatsApp',
    category: 'Communication' as const,
    costPerUnit: (49 * USD_TO_SAR) / 10000, // SAR per API call (starter plan)
    unit: 'calls',
    limit: 10000, // 10K calls/month
  },

  // Storage
  supabase_storage: {
    name: 'Supabase Storage',
    category: 'Storage' as const,
    costPerUnit: 0.021 * USD_TO_SAR, // SAR per GB
    unit: 'GB',
    limit: 100, // 100GB
  },

  supabase_database: {
    name: 'Supabase Database',
    category: 'Storage' as const,
    costPerUnit: 0.125 * USD_TO_SAR, // SAR per GB
    unit: 'GB',
    limit: 8, // 8GB
  },

  // Payment Processing
  moyasar: {
    name: 'Moyasar Payments',
    category: 'Payment' as const,
    costPerUnit: 2.5 / 100, // 2.5% per transaction
    unit: 'SAR processed',
    limit: 10000, // 10K SAR/month
  },
} as const;

type UsageRange = 'today' | 'week' | 'month';

/**
 * Calculate current usage for each service
 */
async function calculateUsage(range: UsageRange) {
  const now = new Date();
  const startDate = new Date();

  switch (range) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      break;
    default:
      break;
  }

  // Get LLM usage (estimate from processed messages)
  const processedMessages = await prisma.processedMessage.count({
    where: {
      processedAt: { gte: startDate },
    },
  });

  // Get casting calls created (processed by LLM)
  const castingCallsCreated = await prisma.castingCall.count({
    where: {
      createdAt: { gte: startDate },
      isAggregated: true,
    },
  });

  // Estimate tokens used (avg 500 tokens per message)
  const estimatedTokens = castingCallsCreated * 500;

  // Get Redis usage (estimate from queue operations)
  const redisRequests = processedMessages * 10; // ~10 Redis ops per message

  // Get Whapi calls (0 if using webhooks, estimated from polling)
  const whapiCalls = 0; // Webhooks save all these calls!

  // Get Vercel function invocations (estimate)
  const vercelFunctions = castingCallsCreated * 3; // LLM + validation + admin

  // Mock data for other services (replace with actual metrics)
  const vercelBandwidth = 5; // GB
  const supabaseStorage = 2; // GB
  const supabaseDatabase = 0.5; // GB
  const moyasarProcessed = 0; // SAR (no payments yet)

  return {
    openai_gpt4_mini: estimatedTokens,
    upstash_redis: redisRequests,
    vercel_bandwidth: vercelBandwidth,
    vercel_functions: vercelFunctions,
    whapi_cloud: whapiCalls,
    supabase_storage: supabaseStorage,
    supabase_database: supabaseDatabase,
    moyasar: moyasarProcessed,
  } as const;
}

/**
 * Calculate service status based on usage percentage
 */
function getStatus(percentUsed: number): 'healthy' | 'warning' | 'critical' {
  if (percentUsed >= 90) return 'critical';
  if (percentUsed >= 70) return 'warning';
  return 'healthy';
}

export const GET = async (req: NextRequest) => {
  // ✅ Add role check at the very start
  const userOrError = await requireRole(req, ['admin']);
  if (userOrError instanceof NextResponse) return userOrError;

  try {
    const url = new URL(req.url);
    const range = (url.searchParams.get('range') || 'month') as UsageRange;

    // Calculate current usage
    const usage = await calculateUsage(range);

    // Build service usage array
    const services = Object.entries(SERVICE_PRICING).map(([key, config]) => {
      const currentUsage = usage[key as keyof typeof usage] || 0;
      const totalCost = currentUsage * config.costPerUnit;
      const percentUsed = (currentUsage / config.limit) * 100;

      return {
        name: config.name,
        category: config.category,
        currentUsage,
        limit: config.limit,
        unit: config.unit,
        costPerUnit: config.costPerUnit,
        totalCost,
        currency: 'SAR' as const,
        status: getStatus(percentUsed),
        lastUpdated: new Date().toISOString(),
        billingCycle: 'monthly' as const,
      };
    });

    // Calculate summary
    const totalCost = services.reduce((sum, s) => sum + s.totalCost, 0);

    // Get last month's cost (mock - implement actual tracking)
    const lastMonthCost = totalCost * 0.85; // Mock: 15% increase
    const percentChange = ((totalCost - lastMonthCost) / lastMonthCost) * 100;

    // Project end-of-month cost
    const daysInMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0,
    ).getDate();
    const currentDay = new Date().getDate();
    const projectedMonthlyCost = (totalCost / currentDay) * daysInMonth;

    // Cost breakdown by category
    const breakdown = services.reduce((acc, s) => {
      acc[s.category.toLowerCase()] =
        (acc[s.category.toLowerCase()] || 0) + s.totalCost;
      return acc;
    }, {} as Record<string, number>);

    const summary = {
      totalCost,
      projectedMonthlyCost,
      compared: {
        lastMonth: lastMonthCost,
        percentChange,
      },
      breakdown,
    };

    return NextResponse.json({
      success: true,
      services,
      summary,
      range,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Admin] Error fetching usage metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch usage metrics' },
      { status: 500 },
    );
  }
};
