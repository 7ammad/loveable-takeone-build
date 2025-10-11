# MCP Servers Setup & Configuration Guide

## Status Check Results

Based on the diagnostics, here's what each MCP server needs to become active:

---

## ✅ **GitHub** 
**Status:** ACTIVE (26 tools enabled)
- No additional configuration needed
- Uses your GitHub account authentication

---

## 🔴 **Inactive Servers Requiring Configuration**

### **Sentry**
**Why inactive:** Missing API token
**Required environment variables:**
```json
"sentry": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-sentry"],
  "env": {
    "SENTRY_AUTH_TOKEN": "your_sentry_auth_token",
    "SENTRY_ORG": "your_org_slug"
  }
}
```
**How to get credentials:**
1. Go to https://sentry.io/settings/account/api/auth-tokens/
2. Create a new auth token with "project:read" and "org:read" scopes
3. Note your organization slug from your Sentry URL

---

### **Playwright**
**Why inactive:** Missing configuration or browser installation
**Fix:**
```powershell
# Install Playwright browsers first
npx playwright install
```
Then update config:
```json
"playwright": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-playwright"]
}
```

---

### **Linear**
**Why inactive:** Missing API key
**Required environment variables:**
```json
"linear": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-linear"],
  "env": {
    "LINEAR_API_KEY": "your_linear_api_key"
  }
}
```
**How to get credentials:**
1. Go to https://linear.app/settings/api
2. Create a new API key
3. Copy the key

---

### **Figma**
**Why inactive:** Missing access token
**Required environment variables:**
```json
"figma": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-figma"],
  "env": {
    "FIGMA_ACCESS_TOKEN": "your_figma_token"
  }
}
```
**How to get credentials:**
1. Go to https://www.figma.com/developers/api#access-tokens
2. Generate a personal access token
3. Copy the token

---

### **Postgres (Neon)**
**Why inactive:** Missing database connection string
**Required environment variables:**
```json
"postgres": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-postgres"],
  "env": {
    "POSTGRES_CONNECTION_STRING": "postgresql://user:password@host:5432/database"
  }
}
```
**How to get credentials:**
- Get your connection string from your Neon dashboard or database provider

---

### **MongoDB**
**Why inactive:** Missing connection string
**Required environment variables:**
```json
"mongodb": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-mongodb"],
  "env": {
    "MONGODB_URI": "mongodb+srv://username:password@cluster.mongodb.net/database"
  }
}
```
**How to get credentials:**
- Get your MongoDB connection string from MongoDB Atlas or your MongoDB provider

---

### **Stripe**
**Why inactive:** Missing API keys
**Required environment variables:**
```json
"stripe": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-stripe"],
  "env": {
    "STRIPE_SECRET_KEY": "sk_test_...",
    "STRIPE_WEBHOOK_SECRET": "whsec_..."
  }
}
```
**How to get credentials:**
1. Go to https://dashboard.stripe.com/apikeys
2. Copy your secret key (use test key for development)
3. Get webhook secret from https://dashboard.stripe.com/webhooks

---

### **PayPal**
**Why inactive:** Missing credentials
**Required environment variables:**
```json
"paypal": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-paypal"],
  "env": {
    "PAYPAL_CLIENT_ID": "your_client_id",
    "PAYPAL_CLIENT_SECRET": "your_client_secret",
    "PAYPAL_MODE": "sandbox"
  }
}
```
**How to get credentials:**
1. Go to https://developer.paypal.com/dashboard/
2. Create an app
3. Copy client ID and secret

---

### **PostHog**
**Why inactive:** Missing API key and host
**Required environment variables:**
```json
"posthog": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-posthog"],
  "env": {
    "POSTHOG_API_KEY": "your_api_key",
    "POSTHOG_HOST": "https://app.posthog.com"
  }
}
```
**How to get credentials:**
1. Go to your PostHog project settings
2. Copy your project API key

---

### **Socket**
**Why inactive:** Missing API key
**Required environment variables:**
```json
"socket": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-socket"],
  "env": {
    "SOCKET_API_KEY": "your_socket_api_key"
  }
}
```
**How to get credentials:**
1. Go to https://socket.dev/
2. Create an account and generate an API key

---

### **SonarQube**
**Why inactive:** Missing server URL and token
**Required environment variables:**
```json
"sonarqube": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-sonarqube"],
  "env": {
    "SONAR_HOST_URL": "https://sonarcloud.io",
    "SONAR_TOKEN": "your_sonar_token"
  }
}
```
**How to get credentials:**
1. Go to https://sonarcloud.io/account/security
2. Generate a token

---

### **Graphite**
**Why inactive:** Missing auth token
**Required environment variables:**
```json
"graphite": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-graphite"],
  "env": {
    "GRAPHITE_AUTH_TOKEN": "your_graphite_token"
  }
}
```
**How to get credentials:**
1. Install Graphite CLI: `npm install -g @withgraphite/graphite-cli`
2. Run: `gt auth`
3. Follow the authentication flow

---

### **Auth0**
**Why inactive:** Missing domain and credentials
**Required environment variables:**
```json
"auth0": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-auth0"],
  "env": {
    "AUTH0_DOMAIN": "your-tenant.auth0.com",
    "AUTH0_CLIENT_ID": "your_client_id",
    "AUTH0_CLIENT_SECRET": "your_client_secret"
  }
}
```
**How to get credentials:**
1. Go to your Auth0 dashboard
2. Navigate to Applications
3. Copy domain, client ID, and secret

---

### **Browserbase**
**Why inactive:** Missing API key
**Required environment variables:**
```json
"browserbase": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-browserbase"],
  "env": {
    "BROWSERBASE_API_KEY": "your_browserbase_api_key",
    "BROWSERBASE_PROJECT_ID": "your_project_id"
  }
}
```
**How to get credentials:**
1. Go to https://browserbase.com
2. Create an account and project
3. Copy your API key and project ID

---

### **DuckDB**
**Why inactive:** May need database path or missing installation
**Fix:**
```json
"duckdb": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-duckdb"],
  "env": {
    "DUCKDB_PATH": "path/to/your/database.duckdb"
  }
}
```

---

### **Honeycomb**
**Why inactive:** Missing API key
**Required environment variables:**
```json
"honeycomb": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-honeycomb"],
  "env": {
    "HONEYCOMB_API_KEY": "your_honeycomb_api_key",
    "HONEYCOMB_DATASET": "your_dataset"
  }
}
```
**How to get credentials:**
1. Go to https://ui.honeycomb.io/account
2. Create an API key

---

### **Notion**
**Why inactive:** Missing integration token
**Required environment variables:**
```json
"notion": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-notion"],
  "env": {
    "NOTION_API_KEY": "secret_..."
  }
}
```
**How to get credentials:**
1. Go to https://www.notion.so/my-integrations
2. Create a new integration
3. Copy the internal integration token

---

### **Slack**
**Why inactive:** Missing bot token
**Required environment variables:**
```json
"slack": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-slack"],
  "env": {
    "SLACK_BOT_TOKEN": "xoxb-...",
    "SLACK_APP_TOKEN": "xapp-..."
  }
}
```
**How to get credentials:**
1. Go to https://api.slack.com/apps
2. Create a new app
3. Add OAuth scopes and install to workspace
4. Copy bot token and app token

---

## 📝 **Recommended Priority Setup**

For your casting platform project, prioritize these in order:

1. **GitHub** ✅ (Already working)
2. **Postgres/MongoDB** (Database access for development)
3. **Sentry** (Error tracking)
4. **Playwright** (E2E testing)
5. **Stripe** (If you handle payments)
6. **Figma** (If working with designs)
7. **Notion/Slack** (Team collaboration)
8. Rest as needed

---

## 🔧 **How to Update Configuration**

Edit `c:\Users\Hammad\.cursor\mcp.json` and add the `env` object to each server you want to activate with the appropriate credentials.

After updating, restart Cursor for changes to take effect.

