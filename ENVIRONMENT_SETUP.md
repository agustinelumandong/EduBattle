# 🔧 Environment Setup Guide

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Database Configuration
# PostgreSQL with Supabase (Recommended - 100% FREE):
DATABASE_URL="postgresql://postgres:password@db.project-ref.supabase.co:5432/postgres"

# Alternative PostgreSQL options:
# For Neon:
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb"

# For Railway PostgreSQL:
DATABASE_URL="postgresql://username:password@containers-us-west-xxx.railway.app:port/railway"

# For local PostgreSQL:
DATABASE_URL="postgresql://postgres:password@localhost:5432/oharaproject3"

# JWT Secret for Authentication
# Generate with: openssl rand -base64 32
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

## 🚀 Quick Setup for Vercel Deployment

### Option 1: Supabase (Recommended - 100% FREE) 🌟

1. Sign up at [Supabase](https://supabase.com/) (no credit card required)
2. Create a new project
3. Go to Settings → Database
4. Copy your PostgreSQL connection string
5. Add to Vercel environment variables

### Option 2: Neon (FREE Alternative)

1. Sign up at [Neon](https://neon.tech/)
2. Create a PostgreSQL database
3. Get your connection string
4. Add to Vercel environment variables

### Option 3: Railway (FREE with Credits)

1. Sign up at [Railway](https://railway.app/)
2. Create a PostgreSQL service (free $5/month credit)
3. Get your connection string
4. Add to Vercel environment variables

## 📝 Vercel Environment Variable Setup

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add these variables:
   - `DATABASE_URL`: Your PostgreSQL connection string from Supabase
   - `JWT_SECRET`: A secure random string (32+ characters)

## 🔄 Database Migration

After setting up your database:

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database (for development)
npx prisma db push

# Or run migrations (for production)
npx prisma migrate dev --name init
```

## ✅ Verification

Test your setup:

```bash
# Test database connection
npx prisma db pull

# Test authentication locally
npm run dev
```
