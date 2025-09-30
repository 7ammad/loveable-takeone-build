import { NextRequest, NextResponse } from 'next/server';
import { initiateAnnualRenewal } from '@/packages/core-security/src/nafath-gate';

// TODO: Implement proper authentication
export async function POST(request: NextRequest) {
  try {
    // TODO: Get user session from authentication
    // const session = await getServerSession();
    // if (!session?.user?.id) {
    //   return NextResponse.json(
    //     { error: 'Authentication required' },
    //     { status: 401 }
    //   );
    // }

    // TEMPORARY: Accept userId from request body for testing
    const { userId, nationalId } = await request.json();

    if (!userId || !nationalId) {
      return NextResponse.json(
        { error: 'userId and nationalId are required' },
        { status: 400 }
      );
    }

    // Validate Saudi National ID format
    if (!/^[12]\d{9}$/.test(nationalId)) {
      return NextResponse.json(
        { error: 'Invalid Saudi National ID format' },
        { status: 400 }
      );
    }

    // Initiate annual renewal
    const result = await initiateAnnualRenewal(userId, nationalId);

    return NextResponse.json({
      success: true,
      transactionId: result.transactionId,
      status: result.status,
      message: 'Annual renewal initiated. Please check your phone for the verification request.'
    });

  } catch (error) {
    console.error('Nafath renewal error:', error);

    // Handle specific error messages
    let statusCode = 500;
    let errorMessage = 'Failed to initiate annual renewal';

    if ((error as Error).message === 'No existing verification found') {
      statusCode = 400;
      errorMessage = 'No existing Nafath verification found. Please complete initial verification first.';
    } else if ((error as Error).message === 'National ID does not match existing verification') {
      statusCode = 400;
      errorMessage = 'National ID does not match your existing verification record.';
    } else if ((error as Error).message === 'Verification is still valid') {
      statusCode = 400;
      errorMessage = 'Your verification is still valid. Renewal is not needed yet.';
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: statusCode }
    );
  }
}
