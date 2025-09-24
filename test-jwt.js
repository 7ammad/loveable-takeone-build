const jwt = require('jsonwebtoken');

// Test the refresh token verification
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWZ3eG8wMngwMDAwaG9vZXE4YW00ZTJkIiwianRpIjoiYjdhZmZjNDUtNGUzMi00YTU2LTg0NTEtMzM0NmQ1ZGNmMGZlIiwiaWF0IjoxNzU4NjU0ODMyLCJleHAiOjE3NTkyNTk2MzIsImF1ZCI6InNhdWRpLWNhc3RpbmctbWFya2V0cGxhY2UiLCJpc3MiOiJzYXVkaS1jYXN0aW5nLW1hcmtldHBsYWNlIn0.N3E92Sf4sc4oR4pbnave-IsVr708FCCLJaxqE8Hfhxk';

const JWT_REFRESH_SECRET = 'bd28f3881dacfe49a127249cd3f403e60447d2bfa4f21a3fddb159bb166cfcd6';
const JWT_AUDIENCE = 'saudi-casting-marketplace';
const JWT_ISSUER = 'saudi-casting-marketplace';

console.log('Testing JWT verification...');

try {
  const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
    audience: JWT_AUDIENCE,
    issuer: JWT_ISSUER
  });

  console.log('✅ JWT verification successful!');
  console.log('Decoded payload:', decoded);
} catch (error) {
  console.log('❌ JWT verification failed:', error.message);

  // Try without audience/issuer to see if that's the issue
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    console.log('✅ JWT verification successful without aud/iss check');
    console.log('Decoded payload:', decoded);
  } catch (error2) {
    console.log('❌ JWT verification failed even without aud/iss:', error2.message);
  }
}
