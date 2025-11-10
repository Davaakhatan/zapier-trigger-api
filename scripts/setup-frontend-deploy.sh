#!/bin/bash
# Setup script for frontend deployment to AWS Amplify

set -e

echo "🚀 Setting up frontend for AWS Amplify deployment..."
echo ""

# API endpoint
API_ENDPOINT="https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod"

# Create .env.production
echo "📝 Creating .env.production..."
cat > .env.production <<EOF
NEXT_PUBLIC_API_URL=$API_ENDPOINT
EOF
echo "✅ Created .env.production with API endpoint: $API_ENDPOINT"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
    echo "✅ Git initialized"
    echo ""
    echo "⚠️  Next steps:"
    echo "   1. Add your files: git add ."
    echo "   2. Commit: git commit -m 'Initial commit'"
    echo "   3. Add remote: git remote add origin YOUR_REPO_URL"
    echo "   4. Push: git push -u origin main"
    echo ""
else
    echo "✅ Git repository already initialized"
    echo ""
fi

# Check if amplify.yml exists
if [ -f amplify.yml ]; then
    echo "✅ amplify.yml found"
else
    echo "⚠️  amplify.yml not found (should have been created)"
fi

echo ""
echo "✅ Frontend setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Push code to Git repository (GitHub/GitLab/Bitbucket)"
echo "   2. Go to AWS Amplify Console: https://console.aws.amazon.com/amplify"
echo "   3. Click 'New app' → 'Host web app'"
echo "   4. Connect your repository"
echo "   5. Add environment variable:"
echo "      Key: NEXT_PUBLIC_API_URL"
echo "      Value: $API_ENDPOINT"
echo "   6. Deploy!"
echo ""
echo "📖 See docs/FRONTEND_DEPLOYMENT.md for detailed instructions"

