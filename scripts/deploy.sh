#!/bin/bash
# scripts/deploy.sh - Deployment script for Framium Backend

set -e

echo "🚀 Starting Framium Backend Deployment..."

# Check if required environment variables are set
if [ -z "$DATABASE_URL" ] || [ -z "$STRIPE_SECRET_KEY" ] || [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ Missing required environment variables"
    echo "Please set: DATABASE_URL, STRIPE_SECRET_KEY, OPENAI_API_KEY"
    exit 1
fi

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 2. Type check
echo "🔍 Running type check..."
npm run type-check

# 3. Run linting
echo "🧹 Running linter..."
npm run lint

# 4. Build the application
echo "🏗️  Building application..."
npm run build

# 5. Run database migrations (if needed)
echo "🗄️  Setting up database..."
if [ "$SETUP_DB" = "true" ]; then
    npm run db:setup
fi

# 6. Deploy to Vercel
echo "🌐 Deploying to Vercel..."
npx vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Configure Stripe webhooks at: https://dashboard.stripe.com/webhooks"
echo "2. Add webhook endpoint: https://your-domain.vercel.app/api/stripe/webhook"
echo "3. Test the API endpoints"
echo "4. Monitor logs via Vercel dashboard"
