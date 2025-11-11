# Frontend Deployment Guide - AWS Amplify

**Deploy your Next.js frontend to AWS Amplify**

---

## Prerequisites

- ✅ AWS Account configured
- ✅ Backend API deployed and working
- ✅ API Gateway endpoint URL
- ✅ Git repository (GitHub, GitLab, or Bitbucket)

**Your API Endpoint:**
```
https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod
```

**Your Repository:**
```
https://github.com/Davaakhatan/zapier-trigger-api
```

---

## 🚀 Quick Deployment Steps

### Step 1: Open AWS Amplify Console

Go to: **https://console.aws.amazon.com/amplify**

### Step 2: Create New App

1. Click **"New app"** button (top right)
2. Select **"Host web app"**

### Step 3: Connect Repository

1. **Choose Git provider**: Click **"GitHub"** (or your provider)
2. **Authorize**: Click **"Authorize"** if this is your first time
   - You'll be redirected to GitHub to authorize AWS Amplify
   - Click **"Authorize aws-amplify-console"**
3. **Select repository**: 
   - Find and select: **`Davaakhatan/zapier-trigger-api`**
4. **Select branch**: 
   - Choose: **`main`**
5. Click **"Next"**

### Step 4: Configure Build Settings

**App name**: `zapier-triggers-frontend`

**Build settings**: Amplify should auto-detect `amplify.yml` ✅

**Environment variables**: Click **"Add environment variable"**
- **Key**: `NEXT_PUBLIC_API_URL`
- **Value**: `https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod`
- Click **"Save"**

Click **"Next"**

### Step 5: Review and Deploy

1. **Review** all settings
2. Click **"Save and deploy"**

### Step 6: Wait for Build

- Build will start automatically
- Takes **5-10 minutes**
- Watch progress in real-time
- You'll see:
  - ✅ Provision
  - ✅ Build
  - ✅ Deploy
  - ✅ Verify

### Step 7: Get Your App URL

Once complete, you'll see:
- **App URL**: `https://main.xxxxx.amplifyapp.com`
- **Status**: ✅ Deployed

---

## Detailed Deployment Options

### Option 1: Deploy via AWS Amplify Console (Recommended)

### Step 1: Prepare Environment Variable

Create `.env.production` in your project root:

```bash
NEXT_PUBLIC_API_URL=https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod
```

### Step 2: Push to Git Repository

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - ready for Amplify deployment"

# Add your remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/zapier-triggers.git
git push -u origin main
```

### Step 3: Deploy via Amplify Console

1. **Go to AWS Amplify Console**
   - Open https://console.aws.amazon.com/amplify
   - Click **"New app"** → **"Host web app"**

2. **Connect Repository**
   - Choose your Git provider (GitHub/GitLab/Bitbucket)
   - Authorize AWS Amplify
   - Select your repository
   - Select branch (usually `main` or `master`)

3. **Configure Build Settings**
   - **App name**: `zapier-triggers-frontend`
   - **Environment variables**: Click **"Add environment variable"**
     - Key: `NEXT_PUBLIC_API_URL`
     - Value: `https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod`
   - **Build settings**: Use default or customize:
     ```yaml
     version: 1
     frontend:
       phases:
         preBuild:
           commands:
             - pnpm install
         build:
           commands:
             - pnpm build
       artifacts:
         baseDirectory: .next
         files:
           - '**/*'
       cache:
         paths:
           - node_modules/**/*
           - .next/cache/**/*
     ```

4. **Review and Deploy**
   - Review settings
   - Click **"Save and deploy"**

5. **Wait for Deployment**
   - Build takes 5-10 minutes
   - You'll see build progress in real-time
   - Once complete, you'll get a URL like: `https://main.xxxxx.amplifyapp.com`

---

## Option 2: Deploy via Amplify CLI

### Step 1: Install Amplify CLI

```bash
npm install -g @aws-amplify/cli
```

### Step 2: Initialize Amplify

```bash
# From project root
amplify init

# Follow prompts:
# - Enter a name for the project: zapier-triggers-frontend
# - Initialize the project with the above settings? Yes
# - Select authentication method: AWS profile
# - Choose your default profile: default
# - Select the type of app: javascript
# - What javascript framework: react
# - Source directory path: ./
# - Distribution directory path: .next
# - Build command: pnpm build
# - Start command: pnpm start
# - Do you want to use an AWS profile? Yes
```

### Step 3: Add Hosting

```bash
amplify add hosting

# Select: Hosting with Amplify Console
# Select: Manual deployment
```

### Step 4: Configure Environment Variables

```bash
# Add environment variable
amplify env add

# Or edit amplify/team-provider-info.json and add:
# "NEXT_PUBLIC_API_URL": "https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod"
```

### Step 5: Build and Deploy

```bash
# Build the app
pnpm build

# Publish to Amplify
amplify publish
```

---

## Option 3: Manual Deployment Script

I'll create an automated script for you.

---

## Post-Deployment Configuration

### 1. Update CORS in API Gateway

Ensure your Amplify domain is allowed:

```bash
# Get your Amplify app URL (from Amplify Console)
AMPLIFY_URL="https://main.xxxxx.amplifyapp.com"

# Update Lambda environment variable
aws lambda update-function-configuration \
  --function-name zapier-triggers-api \
  --environment "Variables={
    DYNAMODB_TABLE_NAME=zapier-triggers-events,
    DEBUG=false,
    CORS_ORIGINS=$AMPLIFY_URL
  }" \
  --region us-east-1
```

### 2. Test Frontend

1. Open your Amplify app URL
2. Navigate to Event Inbox
3. Create a test event
4. Verify it appears
5. Acknowledge the event

---

## Custom Domain (Optional)

### Add Custom Domain in Amplify

1. Go to **Amplify Console** → Your app → **Domain management**
2. Click **"Add domain"**
3. Enter your domain (e.g., `api.yourdomain.com`)
4. Follow DNS configuration instructions
5. Wait for SSL certificate provisioning (10-20 minutes)

---

## Environment Variables

### Production Environment

**Required Environment Variable:**
```bash
NEXT_PUBLIC_API_URL=https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod
```

**How to Set in Amplify:**
1. Go to **Amplify Console** → Your App → **Environment variables**
2. Add/Update: `NEXT_PUBLIC_API_URL`
3. Value: `https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod`
4. Save and **Redeploy**

### Development Environment (Local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Note**: The frontend code already uses this environment variable in `lib/api.ts`:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
```

### New Features After Deployment

Once deployed to Amplify, the enhanced dashboard will include:
- ✅ Event Trends Chart (24-hour timeline)
- ✅ Event Sources Breakdown (pie chart)
- ✅ Performance Metrics (response time, success rate)
- ✅ Rate Limiting Indicators (API usage monitoring)
- ✅ Recent Activity Feed (live event stream)
- ✅ API Key Management (Settings page)

**Note**: Local development won't show real data unless connected to deployed backend or local backend is running.

---

## Build Configuration

### Amplify Build Settings (amplify.yml)

Create `amplify.yml` in project root:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - corepack enable
        - corepack prepare pnpm@latest --activate
        - pnpm install
    build:
      commands:
        - pnpm build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

---

## Troubleshooting

### Build Fails

1. **Check build logs** in Amplify Console
2. **Verify Node.js version** (should be 18+)
3. **Check package.json** scripts
4. **Verify environment variables** are set

### CORS Errors

1. **Check API Gateway CORS** is enabled
2. **Verify Lambda CORS_ORIGINS** includes your Amplify URL
3. **Check browser console** for specific error

### API Not Connecting

1. **Verify environment variable** `NEXT_PUBLIC_API_URL` is set
2. **Check API endpoint** is correct
3. **Test API directly** with curl
4. **Check browser network tab** for failed requests

### 404 Errors

1. **Verify Next.js routing** is configured correctly
2. **Check `next.config.mjs`** for rewrites/redirects
3. **Verify build output** in Amplify Console

---

## Quick Reference

### Get Amplify App URL

```bash
# List apps
aws amplify list-apps --region us-east-1

# Get app details
aws amplify get-app --app-id YOUR_APP_ID --region us-east-1
```

### View Build Logs

1. Go to **Amplify Console** → Your app → **Build history**
2. Click on a build to see logs

### Redeploy

```bash
# Via CLI
amplify publish

# Via Console
# Go to app → Deployments → Redeploy this version
```

---

## Next Steps After Deployment

1. ✅ Test all frontend features
2. ✅ Set up custom domain (optional)
3. ✅ Configure monitoring and alerts
4. ✅ Set up CI/CD (automatic deployments on git push)
5. ✅ Enable analytics (optional)

---

---

## 🧪 Test Your Deployment

1. **Open your Amplify URL**
2. **Test the frontend**:
   - Navigate to Event Inbox
   - Create a test event
   - Verify it appears
   - Acknowledge the event
   - Verify it disappears

---

## 🔄 Automatic Deployments

After first deployment:
- ✅ **Every `git push`** will trigger a new build
- ✅ **Build automatically** in Amplify
- ✅ **Deploy automatically** when build succeeds

---

## ✅ Success Checklist

- [ ] Repository connected to Amplify
- [ ] Environment variable `NEXT_PUBLIC_API_URL` set
- [ ] Build completed successfully
- [ ] App URL accessible
- [ ] Frontend connects to API
- [ ] Events can be created and acknowledged
- [ ] CORS updated with Amplify URL

---

**Ready to deploy!** 🚀

Go to https://console.aws.amazon.com/amplify and follow the quick steps above, or use the detailed options below for more control.

