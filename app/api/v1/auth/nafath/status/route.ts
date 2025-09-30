import { NextRequest, NextResponse } from 'next/server';
import { hasNafathVerification, needsAnnualRenewal } from '@/packages/core-security/src/nafath-gate';

// TODO: Implement proper authentication
export async function GET(request: NextRequest) {
  try {
    // TODO: Get user session from authentication
    // const session = await getServerSession();
    // if (!session?.user?.id) {
    //   return NextResponse.json(
    //     { error: 'Authentication required' },
    //     { status: 401 }
    //   );
    // }

    // TEMPORARY: Accept userId from query params for testing
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter required' },
        { status: 400 }
      );
    }

    // Check verification status
    const isVerified = await hasNafathVerification(userId);
    const needsRenewal = await needsAnnualRenewal(userId);

    // TODO: Get user data for additional details when database layer is implemented
    // const user = await getUserById(userId);

    const response = {
      verified: isVerified,
      needsRenewal,
      verifiedAt: null, // TODO: Implement when database layer is ready
      expiresAt: null, // TODO: Implement when database layer is ready
      nationalId: null, // TODO: Implement when database layer is ready
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Nafath status check error:', error);

    return NextResponse.json(
      {
        error: 'Failed to check verification status',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

// TODO: Implement proper database layer for user lookup
