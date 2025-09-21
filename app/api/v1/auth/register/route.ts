import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/packages/core-db/src/client';
import { RegisterRequestSchema } from '@/packages/core-contracts/src/schemas';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/packages/core-notify/src/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = RegisterRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ ok: false, error: validation.error.format() }, { status: 422 });
    }

    const { email, password } = validation.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ ok: false, error: 'User with this email already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    await sendEmail({
      to: newUser.email,
      template: 'welcome',
      language: 'en',
      context: {
        name: newUser.email,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });

  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
