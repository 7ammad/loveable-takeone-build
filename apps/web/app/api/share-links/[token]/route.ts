import { NextResponse } from "next/server";
import { getShareLinkByToken } from "@/lib/db";

interface RouteContext {
  params: Promise<{ token: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { token } = await context.params;
  const link = getShareLinkByToken(token);
  if (!link) {
    return NextResponse.json({ error: "Share link not found" }, { status: 404 });
  }
  return NextResponse.json({ data: link });
}