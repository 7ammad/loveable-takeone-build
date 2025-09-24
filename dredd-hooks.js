const hooks = require('hooks');
const Dredd = require('dredd');

let stash = { cookies: {}, testEmail: '', testPassword: 'password123', refreshToken: null };

const TEST_USER = {
  email: `test-${Date.now()}@example.com`,
  password: 'password123',
};

function parseSetCookie(setCookieHeader) {
  const cookies = {};
  const headers = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
  headers.filter(Boolean).forEach((h) => {
    const [pair] = h.split(/;\s*/);
    const [name, value] = pair.split('=');
    if (name && value) cookies[name.trim()] = value.trim();
  });
  return cookies;
}

// Helper function to parse cookie strings from Cookie header
function parseCookieHeader(cookieHeader) {
  const list = {};
  if (!cookieHeader) return list;

  cookieHeader.split(';').forEach(cookie => {
    let [name, ...rest] = cookie.split('=');
    name = name?.trim();
    if (!name) return;
    const value = rest.join('=').trim();
    if (!value) return;
    list[name] = decodeURIComponent(value);
  });

  return list;
}

function cookiesToHeader(cookieJar) {
  return Object.entries(cookieJar)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
}

hooks.beforeAll(async (transactions, done) => {
  hooks.log('Setting up test user and environment...');

  // Set test environment variables (disable virus scan for testing)
  process.env.VIRUS_SCAN_ENABLED = 'false';
  hooks.log('Test environment variables set');

  try {
    stash.testEmail = `test-${Date.now()}@example.com`;
    stash.testPassword = 'password123';
    await fetch('http://localhost:3000/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: stash.testEmail, password: stash.testPassword }),
    });

    const response = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: stash.testEmail, password: stash.testPassword }),
    });

    // Try both standard and non-standard ways to access Set-Cookie
    const setCookie = response.headers.get('set-cookie') || response.headers.get('Set-Cookie') || (response.headers.getSetCookie && response.headers.getSetCookie());
    if (setCookie) {
      const parsed = parseSetCookie(setCookie);
      stash.cookies = { ...stash.cookies, ...parsed };
      if (stash.cookies['access_token']) hooks.log('Access token cookie captured.');
      if (stash.cookies['refresh_token']) hooks.log('Refresh token cookie captured.');
      if (stash.cookies['csrf_token']) hooks.log('CSRF token cookie captured.');
    } else {
      hooks.log('Set-Cookie header not found in login response.');
    }
  } catch (error) {
    hooks.log('Error setting up test user: ' + (error && error.message ? error.message : String(error)));
  }

  done();
});

// Capture refresh token from login response
hooks.after('/auth/login > Log in a user > 200 > application/json', (transaction) => {
  const setCookieHeader = transaction.real.headers['set-cookie'] || transaction.real.headers['Set-Cookie'];
  if (setCookieHeader) {
    const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    for (const cookie of cookies) {
      if (cookie.includes('refresh_token=')) {
        const match = cookie.match(/refresh_token=([^;]+)/);
        if (match && match[1]) {
          stash.refreshToken = decodeURIComponent(match[1]);
          hooks.log('Captured refresh token from login response');
          break;
        }
      }
    }
  }
});

// Capture rotated refresh token after successful refresh
hooks.after('/auth/refresh > Refresh access token > 200 > application/json', (transaction) => {
  const setCookieHeader = transaction.real.headers['set-cookie'] || transaction.real.headers['Set-Cookie'];
  if (setCookieHeader) {
    const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    for (const cookie of cookies) {
      if (cookie.includes('refresh_token=')) {
        const match = cookie.match(/refresh_token=([^;]+)/);
        if (match && match[1]) {
          stash.refreshToken = decodeURIComponent(match[1]);
          hooks.log('Captured rotated refresh token after refresh');
          break;
        }
      }
    }
  }
});

hooks.beforeEach((transaction, done) => {
  const path = transaction.request.uri;
  const method = transaction.request.method.toUpperCase();
  const expected = String(transaction.expected && transaction.expected.statusCode ? transaction.expected.statusCode : '');

  // Build per-transaction cookie header (allow removing cookies for negative cases)
  const cookieJar = { ...stash.cookies };

  // Populate request bodies per scenario to hit each documented response
  if (method === 'POST' && path === '/auth/register') {
    if (expected === '201') {
      transaction.request.body = JSON.stringify({ email: `new-${Date.now()}@example.com`, password: 'password123' });
    } else if (expected === '409') {
      // Reuse the same email to trigger conflict (if backend enforces uniqueness)
      transaction.request.body = JSON.stringify({ email: stash.testEmail, password: stash.testPassword });
    } else if (expected === '422') {
      transaction.request.body = JSON.stringify({ email: '', password: '' });
    }
  }

  if (method === 'POST' && path === '/auth/login') {
    if (expected === '200') {
      transaction.request.body = JSON.stringify({ email: stash.testEmail, password: stash.testPassword });
    } else if (expected === '401') {
      transaction.request.body = JSON.stringify({ email: stash.testEmail, password: 'wrong-pass' });
    }
  }

  if (method === 'POST' && path === '/auth/refresh') {
    if (expected === '200') {
      // Use valid refresh token from stash
      if (stash.refreshToken) {
        transaction.request.body = JSON.stringify({ refreshToken: stash.refreshToken });
        hooks.log('Injected refresh token for successful refresh test');
      } else {
        hooks.log('No refresh token in stash for refresh test');
        transaction.request.body = JSON.stringify({ refreshToken: 'missing-token' });
      }
    } else if (expected === '401') {
      // Use invalid refresh token
      transaction.request.body = JSON.stringify({ refreshToken: 'invalid-token' });
    }
  }

  if (method === 'POST' && path === '/auth/logout') {
    if (expected === '200') {
      // Use valid refresh token from stash
      if (stash.refreshToken) {
        transaction.request.body = JSON.stringify({ refreshToken: stash.refreshToken });
        hooks.log('Injected refresh token for successful logout test');
      } else {
        hooks.log('No refresh token in stash for logout test');
        transaction.request.body = JSON.stringify({ refreshToken: 'missing-token' });
      }
    } else if (expected === '401') {
      // Use invalid refresh token
      transaction.request.body = JSON.stringify({ refreshToken: 'invalid-token' });
    }
  }

  // Simulate health check failure
  if (method === 'GET' && path === '/health' && expected === '500') {
    // Add a custom header to trigger error simulation
    transaction.request.headers['X-Simulate-Error'] = 'true';
    hooks.log('Simulating health check failure via header');
  }

  // Simulate search validation errors
  if (method === 'GET' && path === '/search/talent') {
    if (expected === '422') {
      // Force 422 via test header
      transaction.request.headers['X-Simulate-422'] = 'true';
      hooks.log('Simulating search validation error via header');
    } else if (expected === '500') {
      // Add custom header to trigger internal error
      transaction.request.headers['X-Simulate-Error'] = 'true';
      hooks.log('Simulating search internal error via header');
    }
  }

  if (method === 'POST' && path === '/billing/payment-intents') {
    if (expected === '201') {
      transaction.request.body = JSON.stringify({
        amount: 10000,
        currency: 'SAR',
        description: 'Casting call subscription',
        metadata: { userId: 'user-123', planId: 'plan-basic' },
      });
    } else if (expected === '422') {
      transaction.request.body = JSON.stringify({ amount: -1, currency: '', description: '', metadata: {} });
    } else if (expected === '500') {
      // Leave as valid; server may return 500 in error scenarios
      transaction.request.body = JSON.stringify({
        amount: 10000,
        currency: 'SAR',
        description: 'Casting call subscription',
        metadata: { userId: 'user-123', planId: 'plan-basic' },
      });
    }
  }

      if (method === 'POST' && path === '/billing/moyasar/webhooks') {
        if (expected === '200') {
          // Provide a dummy signature header if backend accepts it in dev
          transaction.request.headers['x-moyasar-signature'] = 'test-signature';
        }
        transaction.request.body = transaction.request.body || JSON.stringify({});
      }

      if (method === 'POST' && path === '/media/uploads') {
        if (expected === '200') {
          // Valid upload request
          transaction.request.body = JSON.stringify({
            filename: 'test-video.mp4',
            contentType: 'video/mp4',
            size: 1024 * 1024, // 1MB
            roleId: 'role-123',
            applicationId: 'app-123'
          });
        } else if (expected === '422') {
          // Invalid upload request - missing required fields
          transaction.request.body = JSON.stringify({
            filename: '', // Invalid - empty filename
            contentType: 'video/mp4',
            size: -1 // Invalid - negative size
          });
        } else if (expected === '500') {
          // Trigger server-side simulation of error
          transaction.request.headers['X-Simulate-Error'] = 'true';
        }
      }

  // Authenticated, state-changing: add CSRF and Authorization when available
  const isPublic = path === '/health' || path.startsWith('/auth/');
  if (!isPublic) {
    if (stash.cookies['csrf_token']) {
      transaction.request.headers['X-CSRF-Token'] = stash.cookies['csrf_token'];
    }
    if (stash.cookies['access_token']) {
      transaction.request.headers['Authorization'] = `Bearer ${stash.cookies['access_token']}`;
    }
  }

  const cookieHeader = cookiesToHeader(cookieJar);
  if (cookieHeader) {
    transaction.request.headers['Cookie'] = cookieHeader;
  }

  // Always ensure JSON content-type for bodies we set
  if (transaction.request.body && !transaction.request.headers['Content-Type']) {
    transaction.request.headers['Content-Type'] = 'application/json';
  }
  
  done();
});

hooks.afterAll((transactions, done) => {
  hooks.log('Testing finished.');
  done();
});
