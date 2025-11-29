# Phase 1: Backend Setup (Express + CORS Proxy)

**Phase**: 1 of 4
**Estimated Time**: 1.5 hours
**Dependencies**: None
**Status**: Ready

---

## Context

Project currently frontend-only (React + Vite). Wikipedia API requires CORS proxy to avoid browser security restrictions. Need minimal Express server to proxy API requests from frontend.

---

## Overview

Initialize Node.js backend with Express framework, CORS middleware, and basic routing infrastructure. Setup development environment with hot-reload and production-ready configuration.

---

## Key Insights

1. **Separation of Concerns**: Backend runs on separate port (3000), frontend on 5173 (dev) / static hosting (prod)
2. **CORS Necessity**: Wikipedia API doesn't send `Access-Control-Allow-Origin` header; direct frontend calls fail
3. **Environment Configuration**: Different CORS origins for dev (localhost:5173) vs prod (deployed URL)
4. **Minimal Dependencies**: Only essential packages (express, cors, node-fetch) to avoid bloat

---

## Requirements

### Functional Requirements
- [x] Express server listening on port 3000
- [x] CORS middleware with configurable origins
- [x] Health check endpoint (`GET /health`)
- [x] Structured error handling middleware
- [x] Request logging (dev environment)

### Non-Functional Requirements
- [x] Server starts in < 3 seconds
- [x] Hot-reload in development (nodemon)
- [x] Environment variable support (.env)
- [x] Graceful shutdown handling
- [x] Production-ready logging

---

## Architecture

### Directory Structure

```
tech_genius_project/
├── backend/
│   ├── src/
│   │   ├── server.js           # Express app entry point (60 lines)
│   │   ├── middleware/
│   │   │   ├── cors.js         # CORS configuration (25 lines)
│   │   │   └── error-handler.js # Error middleware (30 lines)
│   │   └── routes/
│   │       └── health.js       # Health check route (15 lines)
│   ├── .env                    # Environment variables
│   ├── .env.example            # Example env file
│   └── package.json            # Backend dependencies
├── src/                        # Existing frontend
└── package.json                # Root package.json (workspace)
```

### Technology Decisions

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Framework | Express 4.x | Industry standard, minimal, 14k+ stars |
| CORS | cors package | Battle-tested, configurable, simple API |
| HTTP Client | node-fetch 3.x | Native fetch API for Node.js |
| Dev Server | nodemon | Auto-restart on file changes |
| Logging | morgan (dev) | Standard HTTP request logger |

---

## Implementation Steps

### Step 1: Initialize Backend Directory (10 min)

```bash
# Create backend directory structure
mkdir -p backend/src/middleware backend/src/routes

# Initialize backend package.json
cd backend
npm init -y

# Install dependencies
npm install express cors node-fetch@3 dotenv
npm install -D nodemon
```

**Files Created**:
- `backend/package.json`
- `backend/node_modules/`

---

### Step 2: Create Server Entry Point (20 min)

**File**: `backend/src/server.js`

```javascript
import express from 'express'
import dotenv from 'dotenv'
import corsMiddleware from './middleware/cors.js'
import errorHandler from './middleware/error-handler.js'
import healthRouter from './routes/health.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(express.json())
app.use(corsMiddleware)

// Routes
app.use('/health', healthRouter)

// Error handling (must be last)
app.use(errorHandler)

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`)
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

export default app
```

**Validation**: Server starts without errors

---

### Step 3: Configure CORS Middleware (15 min)

**File**: `backend/src/middleware/cors.js`

```javascript
import cors from 'cors'

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173']

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

export default cors(corsOptions)
```

**Validation**: CORS headers present in response

---

### Step 4: Create Error Handler (15 min)

**File**: `backend/src/middleware/error-handler.js`

```javascript
export default function errorHandler(err, req, res, next) {
  console.error('Error:', err.message)

  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS_ERROR',
      message: 'Origin not allowed'
    })
  }

  // Generic errors
  res.status(err.status || 500).json({
    error: err.name || 'INTERNAL_ERROR',
    message: err.message || 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}
```

**Validation**: Errors return structured JSON responses

---

### Step 5: Create Health Check Endpoint (10 min)

**File**: `backend/src/routes/health.js`

```javascript
import express from 'express'

const router = express.Router()

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

export default router
```

**Validation**: `GET /health` returns 200 with status object

---

### Step 6: Configure Environment Variables (10 min)

**File**: `backend/.env`

```env
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

**File**: `backend/.env.example`

```env
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
```

**Validation**: Server reads environment variables

---

### Step 7: Update Backend Package.json (10 min)

**File**: `backend/package.json`

```json
{
  "name": "lich-su-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "node-fetch": "^3.3.2",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

**Validation**: `npm run dev` starts server with hot-reload

---

## Todo List

- [ ] Create backend directory structure
- [ ] Initialize package.json and install dependencies
- [ ] Create server.js with Express setup
- [ ] Implement CORS middleware
- [ ] Implement error handler middleware
- [ ] Create health check route
- [ ] Configure environment variables (.env)
- [ ] Update package.json scripts
- [ ] Test server starts successfully
- [ ] Test health endpoint returns 200
- [ ] Test CORS headers in response
- [ ] Verify hot-reload works with nodemon

---

## Success Criteria

- ✅ Server starts on port 3000 without errors
- ✅ `GET http://localhost:3000/health` returns `{"status":"ok"}`
- ✅ CORS headers allow localhost:5173 origin
- ✅ Error responses return structured JSON
- ✅ Nodemon restarts server on file changes
- ✅ Environment variables loaded from .env
- ✅ No security warnings or vulnerabilities

---

## Testing Checklist

```bash
# 1. Start backend server
cd backend
npm run dev

# 2. Test health endpoint
curl http://localhost:3000/health
# Expected: {"status":"ok","timestamp":"...","uptime":...}

# 3. Test CORS from frontend
# In browser console at http://localhost:5173:
fetch('http://localhost:3000/health')
  .then(r => r.json())
  .then(console.log)
# Expected: No CORS errors, response logged

# 4. Test invalid origin (should fail)
curl -H "Origin: http://evil.com" http://localhost:3000/health
# Expected: CORS error
```

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Port 3000 already in use | High | Check for existing processes, use PORT env var |
| CORS misconfiguration | High | Test with actual frontend URL, whitelist specific origins |
| Missing dependencies | Medium | Use exact versions, commit package-lock.json |
| .env file not gitignored | High | Add backend/.env to .gitignore immediately |

---

## Rollback Plan

If Phase 1 fails:
1. Delete `backend/` directory
2. Revert any root-level package.json changes
3. Project remains frontend-only (no breaking changes)

---

## Next Phase

After Phase 1 completion:
→ **Phase 2**: Wikipedia API Integration (proxy endpoint)
