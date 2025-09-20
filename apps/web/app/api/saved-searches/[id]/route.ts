import { NextResponse } from "next/server";
import { deactivateSavedSearch } from "@/lib/db";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const success = deactivateSavedSearch(id);
  if (!success) {
    return NextResponse.json({ error: "Saved search not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}