const hooks = require('hooks');
const Dredd = require('dredd');

let stash = {};

const TEST_USER = {
  email: `test-${Date.now()}@example.com`,
  password: 'password123',
};

// This function will be executed before all tests.
// It registers a new user and logs them in to get an auth token.
hooks.beforeAll(async (transactions, done) => {
  hooks.log('Setting up test user...');

  try {
    // 1. Register a new user
    await fetch('http://localhost:3000/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER),
    });

    // 2. Log in with the new user
    const response = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER),
    });
    
    const data = await response.json();
    
    if (data.accessToken) {
      stash.accessToken = data.accessToken;
      hooks.log('Test user set up and logged in.');
    } else {
      hooks.log('Failed to get access token for test user.');
    }

  } catch (error) {
    hooks.log('Error setting up test user:', error);
  }
  
  done();
});

// This function will be executed before each test.
// It adds the auth token to the request headers for protected endpoints.
hooks.beforeEach((transaction, done) => {
  // Skip adding the auth header for auth-related and health check endpoints
  if (transaction.name.includes('Auth >') || transaction.name.includes('Health >')) {
    done();
    return;
  }

  if (stash.accessToken) {
    transaction.request.headers['Authorization'] = `Bearer ${stash.accessToken}`;
  }
  
  done();
});

// This function will be executed after all tests.
// You can use it for cleanup, but we don't need it here.
hooks.afterAll((transactions, done) => {
  hooks.log('Testing finished.');
  done();
});
