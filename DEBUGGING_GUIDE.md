# 🔧 Authentication Debugging Guide

## Quick Testing Steps

### 1. Test Locally First
```bash
npm run dev
node test-auth.js http://localhost:3000
```

### 2. Test Vercel Health Check
Visit your Vercel deployment and go to: `https://your-app.vercel.app/api/debug/health`

This will tell you exactly what's wrong with your environment.

### 3. Check Vercel Environment Variables

Make sure these are set in your Vercel dashboard:

**Required Variables:**
- `DATABASE_URL` - Your Supabase PostgreSQL connection string
- `DIRECT_URL` - Your Supabase Direct URL (if using connection pooling)
- `JWT_SECRET` - A secure random string (generate with: `openssl rand -hex 32`)

**Common Issues:**
- ❌ `DATABASE_URL` not set → Database connection fails
- ❌ `JWT_SECRET` not set → Token generation fails  
- ❌ Wrong `DATABASE_URL` format → Prisma connection fails

### 4. Check Vercel Function Logs

In your Vercel dashboard:
1. Go to your project
2. Click "Functions" tab
3. Click on failing API routes
4. Check the logs for specific error messages

## Common Error Patterns

### "Registration failed" / "Login failed"

**Likely Causes:**
1. **Database Connection Issue**
   - Logs will show: "Database connection failed"
   - Fix: Check `DATABASE_URL` in Vercel env vars

2. **Prisma Client Issue**
   - Logs will show: "Prisma" or "Client initialization failed"
   - Fix: Redeploy after the Prisma singleton fix

3. **JWT Secret Issue**
   - Logs will show: "JWT" or "token" error
   - Fix: Set proper `JWT_SECRET` in Vercel

4. **Network/Timeout Issue**
   - Logs will show: "timeout" or "network"
   - Fix: Check Supabase connection limits

## Step-by-Step Fix Process

### Phase 1: Environment Variables
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add/verify these variables:
   ```
   DATABASE_URL=postgresql://[your-supabase-url]
   DIRECT_URL=postgresql://[your-supabase-direct-url]  
   JWT_SECRET=[32-character-random-string]
   ```
3. Redeploy

### Phase 2: Database Schema
Make sure your Supabase database has the correct tables:
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Phase 3: Test with Enhanced Logging
1. Deploy the updated code with detailed logging
2. Test registration/login
3. Check Vercel function logs for specific errors
4. Use the health check endpoint to diagnose

## Testing Commands

```bash
# Test locally
npm run dev
node test-auth.js

# Test Vercel deployment  
node test-auth.js https://your-app.vercel.app

# Generate JWT secret
openssl rand -hex 32
```

## Environment Variable Format

### DATABASE_URL (Supabase)
```
postgresql://postgres:[password]@[host]:[port]/[database]?pgbouncer=true&connection_limit=1
```

### DIRECT_URL (Supabase)
```
postgresql://postgres:[password]@[host]:[port]/[database]
```

## Next Steps After Fixes

1. Deploy the updated code to Vercel
2. Run the health check: `/api/debug/health`  
3. Test registration with a new email
4. Test login with the registered email
5. Check Vercel function logs if still failing

## Contact Points

If still failing after these steps:
1. Share the `/api/debug/health` response
2. Share Vercel function logs for auth routes
3. Confirm environment variables are set correctly
