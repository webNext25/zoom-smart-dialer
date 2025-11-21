# Local Development Setup Guide

## Prerequisites

1. **PostgreSQL** installed and running
2. **Node.js** 18+ installed
3. **Git** for version control

## Step 1: Install PostgreSQL (if needed)

### macOS:
```bash
brew install postgresql@17
brew services start postgresql@17
```

### Verify installation:
```bash
psql --version
```

## Step 2: Create Database

```bash
# Create the database
createdb zoom_dialer

# Verify it was created
psql -l | grep zoom_dialer
```

## Step 3: Configure Environment

Create `.env.local` file in project root:

```bash
cat > .env.local << 'EOF'
# Database
DATABASE_URL="postgresql://$(whoami)@localhost:5432/zoom_dialer"

# Authentication (generate new secret)
NEXTAUTH_SECRET="your-secret-here-run-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Add these later when you have API keys
NEXT_PUBLIC_VAPI_KEY=""
VAPI_PRIVATE_KEY=""
NEXT_PUBLIC_ELEVENLABS_VOICE_ID="bIHbv24MWmeRgasZH58o"
ELEVENLABS_API_KEY=""
ZOOM_CLIENT_ID=""
ZOOM_CLIENT_SECRET=""
ZOOM_SDK_KEY=""
ZOOM_SDK_SECRET=""
OPENAI_API_KEY=""
UPLOADTHING_SECRET=""
UPLOADTHING_APP_ID=""
EOF
```

### Generate NEXTAUTH_SECRET:
```bash
# Generate a secure secret
openssl rand -base64 32

# Then manually add it to .env.local
```

## Step 4: Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Create database schema
npx prisma migrate dev --name init

# Seed with sample data
npx tsx prisma/seed.ts
```

Expected output:
```
🌱 Starting database seed...
✅ Created admin user: admin@example.com
✅ Created customer user: customer@example.com
✅ Created 4 voices
✅ Created sample agent: Sales Assistant
✅ Created sample call recording

🎉 Database seeded successfully!

📝 Login credentials:
  Admin:    admin@example.com / password123
  Customer: customer@example.com / password123
```

## Step 5: Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

## Step 6: Test Authentication

1. Go to http://localhost:3000/login
2. Login as:
   - **Admin**: `admin@example.com` / `password123`
   - **Customer**: `customer@example.com` / `password123`

## Step 7: Explore the Database

```bash
# Open Prisma Studio (database GUI)
npx prisma studio
```

This will open http://localhost:5555 where you can view/edit all data.

## Common Issues

### Issue: "Role peer authentication failed"
**Solution**: Edit PostgreSQL config to allow local connections

```bash
# Find config file
psql -c "SHOW hba_file"

# Edit it (use sudo if needed)
# Change METHOD from "peer" to "trust" for local connections
```

### Issue: "Prisma client not found"
**Solution**: 
```bash
npx prisma generate
```

### Issue: "Database does not exist"
**Solution**:
```bash
createdb zoom_dialer
```

### Issue: Port 3000 already in use
**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

## API Testing

### Test API Endpoints:

```bash
# Get all agents (requires auth)
curl http://localhost:3000/api/agents

# Get all users (admin only)
curl http://localhost:3000/api/users
```

## Next Steps

After everything is running:
1. ✅ Test login flow
2. ✅ Test agent creation
3. ✅ Test API endpoints
4. ✅ Replace all `alert()` with `toast`
5. ✅ Deploy to Easypanel

## Deployment Checklist

Before deploying to Easypanel:
- [ ] All features tested locally
- [ ] Environment variables documented
- [ ] Database schema finalized
- [ ] Seed data prepared for production
- [ ] API routes tested
- [ ] Authentication flow tested
- [ ] Build succeeds: `npm run build`
