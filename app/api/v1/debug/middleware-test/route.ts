import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const authHeader = request.headers.get('authorization');
    const cookies = request.cookies.getAll();
    
    return NextResponse.json({
      ok: true,
      message: 'Middleware test endpoint',
      userId: userId || 'no-user-id',
      authHeader: authHeader || 'no-auth-header',
      cookies: cookies.map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' })),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      ok: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
