#!/bin/bash
# scripts/setup-local.sh - Local development setup script

set -e

echo "🛠️  Setting up Framium Backend for Local Development..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 2. Copy environment file
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from template..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your actual API keys and database URL"
else
    echo "✅ .env.local already exists"
fi

# 3. Check if DATABASE_URL is set
if ! grep -q "^DATABASE_URL=" .env.local || grep -q "^DATABASE_URL=postgres://username:password" .env.local; then
    echo ""
    echo "🗄️  Database Setup Required:"
    echo "1. Create a Vercel Postgres database at: https://vercel.com/storage/postgres"
    echo "2. Copy the DATABASE_URL to your .env.local file"
    echo "3. Run: npm run db:setup"
    echo ""
fi

# 4. Check for required API keys
echo "🔑 Checking API key configuration..."
missing_keys=()

if ! grep -q "^OPENAI_API_KEY=sk-" .env.local; then
    missing_keys+=("OPENAI_API_KEY")
fi

if ! grep -q "^ANTHROPIC_API_KEY=sk-ant-" .env.local; then
    missing_keys+=("ANTHROPIC_API_KEY")
fi

if ! grep -q "^STRIPE_SECRET_KEY=sk_" .env.local; then
    missing_keys+=("STRIPE_SECRET_KEY")
fi

if [ ${#missing_keys[@]} -gt 0 ]; then
    echo "⚠️  Missing API keys in .env.local:"
    for key in "${missing_keys[@]}"; do
        echo "   - $key"
    done
    echo ""
    echo "📚 Get your API keys from:"
    echo "   - OpenAI: https://platform.openai.com/api-keys"
    echo "   - Anthropic: https://console.anthropic.com/account/keys"
    echo "   - Stripe: https://dashboard.stripe.com/apikeys"
    echo "   - Google AI: https://aistudio.google.com/app/apikey"
else
    echo "✅ All API keys configured"
fi

# 5. Generate JWT secret if missing
if ! grep -q "^JWT_SECRET=" .env.local || grep -q "^JWT_SECRET=your-super-secret" .env.local; then
    echo "🔐 Generating JWT secret..."
    jwt_secret=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    sed -i.bak "s/^JWT_SECRET=.*/JWT_SECRET=$jwt_secret/" .env.local
    rm .env.local.bak
    echo "✅ JWT secret generated"
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo "1. Update .env.local with your API keys and database URL"
echo "2. Run 'npm run db:setup' to initialize the database"
echo "3. Run 'npm run dev' to start the development server"
echo "4. Test the API at http://localhost:3000/api/health"
