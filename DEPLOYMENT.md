# Easypanel Deployment Guide

## Prerequisites

1. Easypanel account and dashboard access
2. GitHub repository with your code
3. PostgreSQL service available in Easypanel

## Step 1: Prepare Repository

### 1.1 Update package.json

Add these scripts:
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "start": "next start",
    "postinstall": "prisma generate"
  }
}
```

### 1.2 Create .env.production (for reference)

```bash
# Don't commit this! Just for documentation
DATABASE_URL="postgresql://user:password@postgres-hostname:5432/dbname"
NEXTAUTH_SECRET="production-secret-here"
NEXTAUTH_URL="https://your-domain.com"
# ... other variables
```

### 1.3 Push to GitHub

```bash
git add .
git commit -m "feat: prepare for Easypanel deployment"
git push origin main
```

## Step 2: Create PostgreSQL Database in Easypanel

1. Go to Easypanel Dashboard
2. Click **"+ New Service"**
3. Select **"Postgres"**
4. Configure:
   - **Name**: `zoom-dialer-db`
   - **Version**: Latest PostgreSQL
   - **Database Name**: `zoom_dialer`
   - **Username**: (auto-generated or custom)
   - **Password**: (generate strong password)

5. **Deploy** and wait for it to start

6. **Copy the connection string**:
   ```
   postgresql://username:password@postgres-hostname:5432/zoom_dialer
   ```

## Step 3: Create Next.js App in Easypanel

### 3.1 Create New App

1. Click **"+ New Service"**
2. Select **"App"** (not template)
3. Choose **"GitHub"** as source

### 3.2 Configure App

**General Settings:**
- **Name**: `zoom-smart-dialer`
- **Repository**: Select your GitHub repo
- **Branch**: `main`
- **Build Path**: `/` (root)

**Build Settings:**
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Install Command**: `npm install`

**Port Configuration:**
- **Port**: `3000`

### 3.3 Environment Variables

Click **"Environment"** tab and add:

```env
# Database
DATABASE_URL=postgresql://username:password@postgres-hostname:5432/zoom_dialer

# Authentication
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=https://your-domain.com

# Vapi (if you have keys)
NEXT_PUBLIC_VAPI_KEY=your-vapi-key
VAPI_PRIVATE_KEY=your-vapi-private-key

# ElevenLabs (if you have keys)
NEXT_PUBLIC_ELEVENLABS_VOICE_ID=bIHbv24MWmeRgasZH58o
ELEVENLABS_API_KEY=your-elevenlabs-key

# Zoom (if you have credentials)
ZOOM_CLIENT_ID=your-zoom-client-id
ZOOM_CLIENT_SECRET=your-zoom-client-secret
ZOOM_SDK_KEY=your-zoom-sdk-key
ZOOM_SDK_SECRET=your-zoom-sdk-secret

# OpenAI (if you have key)
OPENAI_API_KEY=your-openai-key

# UploadThing (when you set it up)
UPLOADTHING_SECRET=your-uploadthing-secret
UPLOADTHING_APP_ID=your-uploadthing-app-id
```

**Important**: Generate a NEW `NEXTAUTH_SECRET` for production!

```bash
openssl rand -base64 32
```

## Step 4: Run Database Migrations

### Option A: Using Easypanel Terminal

1. Go to your app in Easypanel
2. Open **"Terminal"**
3. Run:
```bash
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

### Option B: Local Migration (Recommended First Time)

1. On your local machine, temporarily use production DATABASE_URL:
```bash
DATABASE_URL="production-url-here" npx prisma migrate deploy
DATABASE_URL="production-url-here" npx tsx prisma/seed.ts
```

## Step 5: Deploy

1. Click **"Deploy"** in Easypanel
2. Monitor build logs
3. Wait for successful deployment

## Step 6: Configure Domain

### 6.1 Add Custom Domain (Optional)

1. Go to **"Domains"** tab
2. Add your domain: `zoom-dialer.yourdomain.com`
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` environment variable

### 6.2 SSL Certificate

Easypanel should auto-provision SSL via Let's Encrypt.

## Step 7: Verify Deployment

### 7.1 Health Check

Visit your deployed app:
```
https://your-domain.com
```

### 7.2 Test Auth

1. Go to `/login`
2. Login with seed credentials:
   - `admin@example.com` / `password123`
   - `customer@example.com` / `password123`

### 7.3 Test API

Open browser console and run:
```javascript
fetch('/api/agents')
  .then(r => r.json())
  .then(console.log);
```

## Step 8: Post-Deployment

### 8.1 Change Default Passwords

**IMPORTANT**: Change the seed passwords immediately!

```sql
-- Connect to database
psql $DATABASE_URL

-- Update admin password
UPDATE "User" 
SET password = '$2a$10$new_hashed_password_here' 
WHERE email = 'admin@example.com';
```

Or create new admin via app UI.

### 8.2 Monitor Logs

In Easypanel:
1. Go to **"Logs"** tab
2. Monitor for errors
3. Check database connections

### 8.3 Set Up Backup

1. In Easypanel PostgreSQL service
2. Enable automatic backups
3. Set retention period

## Troubleshooting

### Build Fails

**Check:**
- Node version compatibility
- All dependencies in `package.json`
- Environment variables set correctly

**Fix:**
```bash
# Clear cache and rebuild locally first
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Errors

**Check:**
- `DATABASE_URL` format is correct
- PostgreSQL service is running
- Network access allowed between services

### Prisma Client Errors

**Fix:**
```bash
# SSH into Easypanel container
npx prisma generate
```

### 404 on All Pages

**Check:**
- Build completed successfully
- Start command is `next start`
- Port 3000 is exposed

## Environment Variable Reference

### Required:
- `DATABASE_URL` - PostgreSQL connection
- `NEXTAUTH_SECRET` - Auth encryption key
- `NEXTAUTH_URL` - Your app URL

### Optional (add when ready):
- `NEXT_PUBLIC_VAPI_KEY` - Vapi public key
- `VAPI_PRIVATE_KEY` - Vapi server key
- `ELEVENLABS_API_KEY` - ElevenLabs key
- `ZOOM_SDK_KEY` - Zoom Video SDK
- `OPENAI_API_KEY` - OpenAI key

## Scaling Recommendations

### For Production:

1. **Database Connection Pooling**:
   - Use PgBouncer
   - Set `connection_limit` in Prisma

2. **Caching**:
   - Add Redis for session storage
   - Cache API responses

3. **Monitoring**:
   - Set up error tracking (Sentry)
   - APM monitoring
   - Uptime monitoring

4. **Load Balancing**:
   - Multiple app instances
   - Auto-scaling rules

## Security Checklist

- [ ] Change all default passwords
- [ ] Set strong `NEXTAUTH_SECRET`
- [ ] Enable HTTPS only
- [ ] Set up CORS properly
- [ ] Enable rate limiting
- [ ] Regular security updates
- [ ] Database backups automated
- [ ] Environment variables secured
- [ ] API keys rotated regularly

## Success!

Your Zoom Smart Dialer is now deployed to Easypanel! 🎉

Next steps:
1. Add your actual API keys
2. Configure Vapi webhooks
3. Set up file upload (UploadThing)
4. Monitor and optimize performance
