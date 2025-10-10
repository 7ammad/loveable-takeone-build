import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@packages/core-auth';
import { llmLearningService } from '@packages/core-lib';
import { z } from 'zod';

const feedbackSchema = z.object({
  originalText: z.string().min(1),
  wasMissed: z.boolean(),
  correctClassification: z.boolean(),
  userFeedback: z.enum(['correct', 'incorrect']).optional(),
});

/**
 * POST /api/v1/admin/llm-feedback
 * Provide feedback on LLM classification for learning
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const authResult = await verifyAccessToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const validationResult = feedbackSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { originalText, wasMissed, correctClassification, userFeedback } = validationResult.data;

    // Learn from the feedback
    await llmLearningService.learnFromMissedCall(
      originalText,
      wasMissed,
      correctClassification,
      userFeedback
    );

    return NextResponse.json({
      success: true,
      message: 'Feedback recorded and learning system updated'
    });

  } catch (error) {
    console.error('LLM feedback API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/admin/llm-feedback
 * Get learning system statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const authResult = await verifyAccessToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const stats = await llmLearningService.getLearningStats();
    const learnedPatterns = await llmLearningService.getLearnedPatterns();

    return NextResponse.json({
      success: true,
      data: {
        stats,
        learnedPatterns
      }
    });

  } catch (error) {
    console.error('LLM learning stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
