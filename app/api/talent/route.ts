import { NextResponse } from "next/server";
import { listTalentProfiles } from "@/lib/db";

export function GET() {
  const profiles = listTalentProfiles().map((profile) => ({
    id: profile.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    city: profile.city,
    verified: profile.verified,
  }));
  return NextResponse.json({ data: profiles });
}
