import { NextResponse } from "next/server";
import { getMessageThreadById, listMessagesByThread } from "@/lib/db";

interface RouteContext {
  params: Promise<{ threadId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { threadId } = await context.params;
  const thread = getMessageThreadById(threadId);
  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }
  const messages = listMessagesByThread(thread.id);
  return NextResponse.json({ data: { thread, messages } });
}
