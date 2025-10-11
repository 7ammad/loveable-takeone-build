import { NextRequest, NextResponse } from 'next/server';
import { llmLearningService } from '@packages/core-lib';
import { z } from 'zod';
import { requireRole } from '@/lib/auth-helpers';

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
export const POST = async (request: NextRequest) => {
  // ✅ Add role check at the very start
  const userOrError = await requireRole(request, ['admin']);
  if (userOrError instanceof NextResponse) return userOrError;

  try {
    const body = await request.json();
    const validationResult = feedbackSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 },
      );
    }

    const { originalText, wasMissed, correctClassification, userFeedback } =
      validationResult.data;

    // Learn from the feedback
    await llmLearningService.learnFromMissedCall(
      originalText,
      wasMissed,
      correctClassification,
      userFeedback,
    );

    return NextResponse.json({
      success: true,
      message: 'Feedback recorded and learning system updated',
    });
  } catch (error) {
    console.error('LLM feedback API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
};

/**
 * GET /api/v1/admin/llm-feedback
 * Get learning system statistics
 */
export const GET = async (request: NextRequest) => {
  // ✅ Add role check at the very start
  const userOrError = await requireRole(request, ['admin']);
  if (userOrError instanceof NextResponse) return userOrError;

  try {
    const stats = await llmLearningService.getLearningStats();
    const learnedPatterns = await llmLearningService.getLearnedPatterns();

    return NextResponse.json({
      success: true,
      data: {
        stats,
        learnedPatterns,
      },
    });
  } catch (error) {
    console.error('LLM learning stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
};
