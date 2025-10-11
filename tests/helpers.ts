import { prisma } from '@packages/core-db';
import { generateAccessToken } from '@packages/core-auth';
import bcrypt from 'bcryptjs';

/**
 * Create a test user with the specified role
 */
export async function createTestUser(role: 'admin' | 'talent' | 'caster') {
  const email = `${role}@test.com`;
  const password = 'password123';
  const name = `${role} User`;

  // Delete existing user if exists
  await prisma.user.deleteMany({
    where: { email }
  });

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
      isActive: true,
      nafathVerified: true,
    },
  });

  // Generate token
  const token = generateAccessToken(user.id, 'test-jti', user.role, {});

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    token,
  };
}

/**
 * Get authentication token for a user
 */
export async function getAuthToken(email: string, password: string) {
  // This would typically call the login API
  // For testing purposes, we'll create the token directly
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return generateAccessToken(user.id, 'test-jti', user.role, {});
}
