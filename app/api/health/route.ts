import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      database: "mock",
      redis: "mock",
      cdn: "mock",
    },
  });
}
