# Git Repository Setup Guide

**Quick guide to set up your git repository and deploy to AWS Amplify**

---

## Step 1: Create Git Repository

### Option A: GitHub

1. Go to https://github.com/new
2. Repository name: `zapier-triggers-api` (or your preferred name)
3. Description: "Zapier Triggers API - Fullstack app with FastAPI backend and Next.js frontend"
4. Choose: **Public** or **Private**
5. **Don't** initialize with README, .gitignore, or license (we already have these)
6. Click **"Create repository"**

### Option B: GitLab

1. Go to https://gitlab.com/projects/new
2. Create blank project
3. Follow similar steps as GitHub

### Option C: Bitbucket

1. Go to https://bitbucket.org/repo/create
2. Create repository
3. Follow similar steps

---

## Step 2: Prepare Local Repository

```bash
# Make sure you're in the project directory
cd "/Users/davaakhatanzorigtbaatar/Downloads/Private/2024/2025/CLassboxes/Gauntlet AI/Projects/Silver/Zapier"

# Rename branch to main (if needed)
git branch -M main

# Add all files
git add .

# Commit
git commit -m "Initial commit - Zapier Triggers API

- FastAPI backend with Lambda deployment
- Next.js frontend
- AWS infrastructure (DynamoDB, API Gateway, Lambda)
- Complete documentation and deployment scripts"
```

---

## Step 3: Connect to Remote Repository

```bash
# Add remote (replace with your actual repo URL)
git remote add origin https://github.com/YOUR_USERNAME/zapier-triggers-api.git

# Or if using SSH:
# git remote add origin git@github.com:YOUR_USERNAME/zapier-triggers-api.git

# Verify remote
git remote -v

# Push to remote
git push -u origin main
```

---

## Step 4: Deploy to AWS Amplify

### Via AWS Console (Recommended)

1. **Go to AWS Amplify Console**
   - Open https://console.aws.amazon.com/amplify
   - Click **"New app"** → **"Host web app"**

2. **Connect Repository**
   - Choose your Git provider (GitHub/GitLab/Bitbucket)
   - Click **"Authorize"** if first time
   - Select your repository: `zapier-triggers-api`
   - Select branch: `main`
   - Click **"Next"**

3. **Configure Build Settings**
   - **App name**: `zapier-triggers-frontend`
   - **Build settings**: Amplify will auto-detect `amplify.yml`
   - **Environment variables**: Click **"Add environment variable"**
     - Key: `NEXT_PUBLIC_API_URL`
     - Value: `https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod`
   - Click **"Next"**

4. **Review and Deploy**
   - Review all settings
   - Click **"Save and deploy"**

5. **Wait for Build**
   - Build takes 5-10 minutes
   - Watch progress in real-time
   - Once complete, you'll get a URL like: `https://main.xxxxx.amplifyapp.com`

---

## Step 5: Test Deployment

1. **Open your Amplify URL**
2. **Test the frontend**:
   - Navigate to Event Inbox
   - Create a test event
   - Verify it appears
   - Acknowledge the event
   - Verify it disappears

---

## Important Notes

### Environment Variables

- ✅ **Set in Amplify Console** (not in `.env.production` file)
- ✅ `.env.production` is in `.gitignore` (won't be committed)
- ✅ Use `.env.production.example` as reference

### Files Not Committed

These are correctly ignored:
- `.env.production` (set in Amplify Console)
- `node_modules/` (installed during build)
- `backend/venv/` (Python virtual environment)
- `backend/lambda-deployment.zip` (build artifacts)
- `*.zip` files

### After First Deployment

- ✅ Automatic deployments on every `git push`
- ✅ Build logs available in Amplify Console
- ✅ Custom domain can be added later
- ✅ Environment variables can be updated anytime

---

## Quick Commands Reference

```bash
# Check status
git status

# Add files
git add .

# Commit
git commit -m "Your commit message"

# Push
git push origin main

# View Amplify apps
aws amplify list-apps --region us-east-1
```

---

## Troubleshooting

### Build Fails in Amplify

1. **Check build logs** in Amplify Console
2. **Verify Node.js version** (should be 18+)
3. **Check `amplify.yml`** syntax
4. **Verify environment variables** are set

### CORS Errors

1. **Update Lambda CORS_ORIGINS** with your Amplify URL:
   ```bash
   AMPLIFY_URL="https://main.xxxxx.amplifyapp.com"
   aws lambda update-function-configuration \
     --function-name zapier-triggers-api \
     --environment "Variables={
       DYNAMODB_TABLE_NAME=zapier-triggers-events,
       DEBUG=false,
       CORS_ORIGINS=$AMPLIFY_URL
     }" \
     --region us-east-1
   ```

### API Not Connecting

1. **Verify environment variable** in Amplify Console
2. **Check API endpoint** is correct
3. **Test API directly** with curl
4. **Check browser console** for errors

---

**Ready to deploy!** 🚀

Follow the steps above to create your git repo and deploy to Amplify.

