import { NextRequest, NextResponse } from "next/server";
import { listSavedSearchesByUser, createSavedSearch } from "@/lib/db";

export async function GET() {
  const searches = listSavedSearchesByUser("user-talent-1");
  return NextResponse.json({ data: searches });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId = "user-talent-1", name, params = {}, channels = ["email"], frequency } = body ?? {};

  if (!name) {
    return NextResponse.json({ error: "Missing name" }, { status: 400 });
  }

  const saved = createSavedSearch({ userId, name, params, channels, frequency });
  return NextResponse.json({ data: saved }, { status: 201 });
}
