import { NextRequest, NextResponse } from 'next/server';
import { initiateNafathVerification } from '@/packages/core-security/src/nafath-gate';

// TODO: Implement proper authentication
// For now, accepting a userId in the request body for testing
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

    // Validate Saudi National ID format (10 digits starting with 1 or 2)
    if (!/^[12]\d{9}$/.test(nationalId)) {
      return NextResponse.json(
        { error: 'Invalid Saudi National ID format' },
        { status: 400 }
      );
    }

    // Initiate Nafath verification
    const result = await initiateNafathVerification(userId, nationalId);

    return NextResponse.json({
      success: true,
      transactionId: result.transactionId,
      status: result.status,
      message: 'Nafath verification initiated. Please check your phone for the verification request.'
    });

  } catch (error) {
    console.error('Nafath initiation error:', error);

    return NextResponse.json(
      {
        error: 'Failed to initiate Nafath verification',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}
