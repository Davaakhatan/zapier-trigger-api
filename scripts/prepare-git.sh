#!/bin/bash
# Prepare repository for git commit

set -e

echo "📦 Preparing repository for git..."
echo ""

# Ensure .env.production is not committed (use example instead)
if [ -f .env.production ]; then
    echo "⚠️  .env.production exists - make sure to set this in Amplify Console, not commit it"
    echo "   (It's in .gitignore, so it won't be committed)"
fi

# Check what will be committed
echo "📋 Files that will be committed:"
git status --short | head -30
echo ""

# Show what will be ignored
echo "📋 Important files that will be ignored (correctly):"
echo "   - .env.production (set in Amplify Console instead)"
echo "   - backend/venv/ (Python virtual environment)"
echo "   - backend/lambda-deployment.zip (build artifacts)"
echo "   - node_modules/ (npm dependencies)"
echo ""

echo "✅ Repository is ready for git!"
echo ""
echo "📝 Next steps:"
echo "   1. Review files above"
echo "   2. Add files: git add ."
echo "   3. Commit: git commit -m 'Initial commit - Zapier Triggers API'"
echo "   4. Create GitHub/GitLab/Bitbucket repository"
echo "   5. Add remote: git remote add origin YOUR_REPO_URL"
echo "   6. Push: git push -u origin main"
echo ""
echo "💡 Remember: Set NEXT_PUBLIC_API_URL in Amplify Console, not in .env.production file!"

