import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ? 'SET' : 'NOT_SET',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ? 'SET' : 'NOT_SET',
    JWT_AUDIENCE: process.env.JWT_AUDIENCE || 'NOT_SET',
    JWT_ISSUER: process.env.JWT_ISSUER || 'NOT_SET',
    S3_REGION: process.env.S3_REGION || 'NOT_SET',
    S3_ENDPOINT: process.env.S3_ENDPOINT || 'NOT_SET',
    S3_ACCESS_KEY: process.env.S3_ACCESS_KEY ? 'SET' : 'NOT_SET',
    S3_SECRET_KEY: process.env.S3_SECRET_KEY ? 'SET' : 'NOT_SET',
  });
}
