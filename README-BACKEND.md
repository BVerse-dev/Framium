# Framium Backend Documentation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Vercel account
- Postgres database (Vercel Postgres recommended)
- API keys: OpenAI, Anthropic, Stripe

### Local Development Setup

1. **Clone and install dependencies:**
```bash
cd /Users/andromeda/Framium
npm install
chmod +x scripts/setup-local.sh
./scripts/setup-local.sh
```

2. **Configure environment variables:**
```bash
cp .env.example .env.local
# Edit .env.local with your actual API keys
```

3. **Setup database:**
```bash
# Create Vercel Postgres database first
npm run db:setup
```

4. **Start development server:**
```bash
npm run dev
```

5. **Test the API:**
```bash
curl http://localhost:3000/api/health
```

## 🗄️ Database Schema

### Core Tables
- **users** - User accounts and plans
- **subscriptions** - Stripe subscription tracking  
- **token_usage** - AI model usage monitoring
- **user_preferences** - User settings and preferences
- **saved_prompts** - User's saved prompt library
- **ai_tasks** - Multi-step AI workflows

### Key Relationships
```sql
users 1:1 user_preferences
users 1:many subscriptions  
users 1:many token_usage
users 1:many saved_prompts
users 1:many ai_tasks
```

## 🔌 API Endpoints

### Authentication
```
POST /api/auth/login
POST /api/auth/signup
GET  /api/auth/me
```

### AI Chat
```
POST /api/chat
- Body: { userId, model, prompt, mode, context }
- Returns: { result, tokenUsage, cost }
```

### User Management
```
GET    /api/user/profile
PUT    /api/user/profile
GET    /api/user/preferences  
PUT    /api/user/preferences
GET    /api/user/usage
```

### Task Management
```
POST   /api/tasks/create
GET    /api/tasks/list
PUT    /api/tasks/{id}/status
DELETE /api/tasks/{id}
```

### Stripe Integration
```
POST /api/stripe/webhook
POST /api/stripe/create-checkout
POST /api/stripe/customer-portal
```

## 🔐 Security

### Authentication
- JWT tokens with 30-day expiration
- Bearer token authentication for API calls
- Middleware validation on protected routes

### Rate Limiting
- 100 requests per minute per IP
- Enhanced limits for authenticated users
- Model-specific usage tracking

### Data Protection
- Environment variables for all secrets
- Encrypted API key storage (optional feature)
- CORS configuration for frontend domain

## 💳 Stripe Integration

### Subscription Plans
- **BASIC**: $9/month, 50K tokens, basic models
- **MAX**: $29/month, 250K tokens, advanced models  
- **BEAST**: $99/month, 1M tokens, all models + agent mode

### Webhook Events
- `checkout.session.completed` - New subscription
- `customer.subscription.updated` - Plan changes
- `customer.subscription.deleted` - Cancellations
- `invoice.payment_succeeded` - Successful payments
- `invoice.payment_failed` - Failed payments

### Setup Webhooks
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_*`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

## 🤖 AI Model Integration

### Supported Models

**OpenAI:**
- gpt-4.1 (BASIC)
- gpt-4o (MAX)
- gpt-4-turbo (MAX)

**Anthropic:**
- claude-3.7-sonnet (BASIC)
- claude-3.5-sonnet (MAX)
- claude-4.1-opus (BEAST)

**Google:**
- gemini-pro (MAX)
- gemini-2.5-pro (BEAST)

### Usage Tracking
- Real-time token counting
- Cost calculation per request
- Monthly usage limits per plan
- Automatic usage rollover

## 🚀 Deployment

### Vercel Deployment
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Environment Variables (Vercel)
```bash
vercel env add DATABASE_URL
vercel env add STRIPE_SECRET_KEY  
vercel env add OPENAI_API_KEY
vercel env add ANTHROPIC_API_KEY
vercel env add GEMINI_API_KEY
vercel env add JWT_SECRET
```

### Database Migration
```bash
# Production database setup
psql $DATABASE_URL < api/schema.sql
```

## 📊 Monitoring & Analytics

### Health Monitoring
- `/api/health` - Service status
- Database connectivity check
- API key validation
- Service availability

### Usage Analytics
- Token consumption per user
- Model popularity metrics
- Error rate monitoring
- Performance tracking

### Logging
- Structured JSON logs
- Error tracking with Sentry (optional)
- Request/response logging
- Webhook event logging

## 🛠️ Development

### Running Tests
```bash
npm test
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

### Database Migrations
```bash
npm run db:migrate
```

## 🔧 Troubleshooting

### Common Issues

**Database Connection Failed:**
- Check `DATABASE_URL` in environment variables
- Verify Vercel Postgres is running
- Test connection: `psql $DATABASE_URL -c "SELECT 1"`

**API Key Errors:**
- Verify all API keys are set correctly
- Check API key format (OpenAI: sk-..., Anthropic: sk-ant-...)
- Test keys with direct API calls

**Stripe Webhook Issues:**
- Verify webhook secret matches Stripe dashboard
- Check webhook URL is accessible
- Test with Stripe webhook test events

**Token Limit Exceeded:**
- Check user's monthly usage in database
- Verify plan limits are correct
- Review token calculation logic

## 📚 Additional Resources

- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Anthropic Claude API](https://docs.anthropic.com/claude/reference)
- [Framer Plugin API](https://www.framer.com/developers/plugins/api)
