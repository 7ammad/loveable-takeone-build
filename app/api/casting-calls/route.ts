import { NextResponse } from "next/server";
import { listCastingCalls, listRolesByCastingCall } from "@/lib/db";

export function GET() {
  const castingCalls = listCastingCalls().map((call) => ({
    id: call.id,
    title: call.title,
    status: call.status,
    city: call.city,
    roles: listRolesByCastingCall(call.id).length,
  }));
  return NextResponse.json({ data: castingCalls });
}
