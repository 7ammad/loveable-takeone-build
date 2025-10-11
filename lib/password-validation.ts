/**
 * Password Validation and Policy Enforcement
 * Implements NIST SP 800-63B password guidelines
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'fair' | 'good' | 'strong' | 'very_strong';
  score: number; // 0-100
}

/**
 * Password policy configuration
 */
export const PASSWORD_POLICY = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
} as const;

/**
 * Common weak passwords (top 100 most common)
 */
const COMMON_PASSWORDS = new Set([
  'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', '1234567',
  'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
  'ashley', 'bailey', 'passw0rd', 'shadow', '123123', '654321', 'superman',
  'qazwsx', 'michael', 'football', 'welcome', 'jesus', 'ninja', 'mustang',
  'password1', '123456789', '12345', 'password123', '1234', 'qwerty123',
  'admin', 'welcome123', 'root', 'toor', 'pass', 'test', 'guest',
]);

/**
 * Validate password against policy
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  // ✅ Check minimum length
  if (!password || password.length < PASSWORD_POLICY.minLength) {
    errors.push(`Password must be at least ${PASSWORD_POLICY.minLength} characters long`);
  } else {
    score += 20;
    
    // Bonus for longer passwords
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;
  }

  // ✅ Check maximum length (prevent DoS)
  if (password.length > PASSWORD_POLICY.maxLength) {
    errors.push(`Password must not exceed ${PASSWORD_POLICY.maxLength} characters`);
    return {
      isValid: false,
      errors,
      strength: 'weak',
      score: 0,
    };
  }

  // ✅ Check for uppercase letters
  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 15;
  }

  // ✅ Check for lowercase letters
  if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 15;
  }

  // ✅ Check for numbers
  if (PASSWORD_POLICY.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 15;
  }

  // ✅ Check for special characters
  const specialCharRegex = new RegExp(`[${PASSWORD_POLICY.specialChars.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}]`);
  if (PASSWORD_POLICY.requireSpecialChars && !specialCharRegex.test(password)) {
    errors.push(`Password must contain at least one special character (${PASSWORD_POLICY.specialChars})`);
  } else {
    score += 15;
  }

  // ✅ Check for common/weak passwords
  const lowerPassword = password.toLowerCase();
  if (COMMON_PASSWORDS.has(lowerPassword)) {
    errors.push('Password is too common. Please choose a more unique password');
    score = Math.min(score, 20); // Cap score for common passwords
  }

  // ✅ Check for sequential characters (123, abc, etc.)
  if (hasSequentialChars(password)) {
    errors.push('Password contains sequential characters. Please choose a more secure password');
    score -= 10;
  }

  // ✅ Check for repeated characters (aaa, 111, etc.)
  if (hasRepeatedChars(password)) {
    errors.push('Password contains too many repeated characters');
    score -= 10;
  }

  // Bonus for character diversity
  const uniqueChars = new Set(password).size;
  const diversityRatio = uniqueChars / password.length;
  if (diversityRatio > 0.7) {
    score += 10;
  }

  // Cap score between 0-100
  score = Math.max(0, Math.min(100, score));

  // Determine strength
  let strength: PasswordValidationResult['strength'];
  if (score < 30) strength = 'weak';
  else if (score < 50) strength = 'fair';
  else if (score < 70) strength = 'good';
  else if (score < 90) strength = 'strong';
  else strength = 'very_strong';

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score,
  };
}

/**
 * Check for sequential characters (123, abc, etc.)
 */
function hasSequentialChars(password: string): boolean {
  const sequences = [
    '0123456789',
    'abcdefghijklmnopqrstuvwxyz',
    'qwertyuiop',
    'asdfghjkl',
    'zxcvbnm',
  ];

  const lower = password.toLowerCase();
  
  for (const seq of sequences) {
    for (let i = 0; i < seq.length - 2; i++) {
      const chunk = seq.substring(i, i + 3);
      if (lower.includes(chunk) || lower.includes(chunk.split('').reverse().join(''))) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Check for repeated characters (aaa, 111, etc.)
 */
function hasRepeatedChars(password: string): boolean {
  const repeatedPattern = /(.)\1{2,}/;
  return repeatedPattern.test(password);
}

/**
 * Generate password strength feedback
 */
export function getPasswordFeedback(result: PasswordValidationResult): string[] {
  const feedback: string[] = [];

  if (result.strength === 'weak') {
    feedback.push('⚠️ This password is very weak and easy to crack');
  } else if (result.strength === 'fair') {
    feedback.push('⚠️ This password is weak. Consider making it stronger');
  } else if (result.strength === 'good') {
    feedback.push('✓ This password is acceptable');
  } else if (result.strength === 'strong') {
    feedback.push('✓ This password is strong');
  } else {
    feedback.push('✓ This password is very strong');
  }

  // Add specific suggestions
  if (result.errors.length > 0) {
    feedback.push(...result.errors);
  } else {
    // Provide tips for improvement even if valid
    if (result.score < 90) {
      feedback.push('💡 Tip: Use a longer password with more varied characters for better security');
    }
  }

  return feedback;
}

/**
 * Check if password has been compromised (basic check against common passwords)
 * In production, integrate with HaveIBeenPwned API
 */
export async function checkPasswordBreach(password: string): Promise<boolean> {
  // For now, just check against our common passwords list
  return COMMON_PASSWORDS.has(password.toLowerCase());
}

/**
 * Generate a strong password suggestion
 */
export function generateStrongPassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = PASSWORD_POLICY.specialChars;
  
  const all = uppercase + lowercase + numbers + special;
  
  let password = '';
  
  // Ensure at least one of each required type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

