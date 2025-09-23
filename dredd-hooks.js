const hooks = require('hooks');
const Dredd = require('dredd');

let stash = { cookies: {}, testEmail: '', testPassword: 'password123' };

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

function cookiesToHeader(cookieJar) {
  return Object.entries(cookieJar)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
}

hooks.beforeAll(async (transactions, done) => {
  hooks.log('Setting up test user...');

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
      if (stash.cookies['csrf_token']) hooks.log('CSRF token cookie captured.');
    } else {
      hooks.log('Set-Cookie header not found in login response.');
    }
  } catch (error) {
    hooks.log('Error setting up test user: ' + (error && error.message ? error.message : String(error)));
  }

  done();
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
      // Ensure refresh cookie present
    } else if (expected === '401') {
      // Remove refresh cookie to force invalid
      delete cookieJar['refresh_token'];
    }
    // Body is ignored by our API; keep minimal
    transaction.request.body = transaction.request.body || JSON.stringify({});
  }

  if (method === 'POST' && path === '/auth/logout') {
    if (expected === '401') {
      // Remove cookies to simulate unauthenticated
      delete cookieJar['access_token'];
      delete cookieJar['refresh_token'];
    }
    transaction.request.body = transaction.request.body || JSON.stringify({});
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
