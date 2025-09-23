import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  
  return NextResponse.json({
    ok: true,
    message: 'Simple test route',
    userId: userId || 'no-user-id',
    timestamp: new Date().toISOString()
  });
}
