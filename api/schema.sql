-- Framium Backend Database Schema
-- Vercel Postgres Compatible
-- Created: August 6, 2025

-- Enable UUID extension for better IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    plan VARCHAR(20) DEFAULT 'BASIC' CHECK (plan IN ('BASIC', 'MAX', 'BEAST')),
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SUBSCRIPTIONS TABLE
-- =============================================
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    plan VARCHAR(20) NOT NULL CHECK (plan IN ('BASIC', 'MAX', 'BEAST')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TOKEN USAGE TRACKING
-- =============================================
CREATE TABLE token_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    model VARCHAR(100) NOT NULL,
    tokens_used INTEGER NOT NULL DEFAULT 0,
    cost_usd DECIMAL(10, 6) DEFAULT 0,
    request_type VARCHAR(50) DEFAULT 'chat', -- 'chat', 'generation', 'agent'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- USER PREFERENCES
-- =============================================
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    default_model VARCHAR(100) DEFAULT 'claude-3.7-sonnet',
    default_mode VARCHAR(20) DEFAULT 'ask' CHECK (default_mode IN ('ask', 'agent')),
    theme VARCHAR(20) DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'auto')),
    notifications_enabled BOOLEAN DEFAULT true,
    auto_save_enabled BOOLEAN DEFAULT true,
    code_style VARCHAR(20) DEFAULT 'typescript',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- =============================================
-- SAVED PROMPTS/SNIPPETS
-- =============================================
CREATE TABLE saved_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'general',
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- AI TASKS/WORKFLOWS
-- =============================================
CREATE TABLE ai_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'paused')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    model VARCHAR(100) NOT NULL,
    steps JSONB, -- Array of step objects
    result JSONB, -- Final result data
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- API KEYS MANAGEMENT (Optional - for advanced users)
-- =============================================
CREATE TABLE user_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'openai', 'anthropic', 'google'
    encrypted_key TEXT NOT NULL, -- Encrypted API key
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_token_usage_user_id ON token_usage(user_id);
CREATE INDEX idx_token_usage_created_at ON token_usage(created_at);
CREATE INDEX idx_token_usage_model ON token_usage(model);
CREATE INDEX idx_saved_prompts_user_id ON saved_prompts(user_id);
CREATE INDEX idx_saved_prompts_category ON saved_prompts(category);
CREATE INDEX idx_ai_tasks_user_id ON ai_tasks(user_id);
CREATE INDEX idx_ai_tasks_status ON ai_tasks(status);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_prompts_updated_at BEFORE UPDATE ON saved_prompts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- VIEW FOR USER STATS
-- =============================================
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.email,
    u.name,
    u.plan,
    COALESCE(SUM(tu.tokens_used), 0) as total_tokens_used,
    COALESCE(SUM(tu.cost_usd), 0) as total_cost,
    COUNT(DISTINCT sp.id) as saved_prompts_count,
    COUNT(DISTINCT at.id) as total_tasks,
    COUNT(DISTINCT CASE WHEN at.status = 'completed' THEN at.id END) as completed_tasks
FROM users u
LEFT JOIN token_usage tu ON u.id = tu.user_id AND tu.created_at >= date_trunc('month', NOW())
LEFT JOIN saved_prompts sp ON u.id = sp.user_id
LEFT JOIN ai_tasks at ON u.id = at.user_id
GROUP BY u.id, u.email, u.name, u.plan;

-- =============================================
-- SEED DATA FOR DEVELOPMENT
-- =============================================
INSERT INTO users (email, name, plan) VALUES 
('demo@framium.dev', 'Demo User', 'MAX'),
('test@framium.dev', 'Test User', 'BASIC'),
('premium@framium.dev', 'Premium User', 'BEAST');

-- Add default preferences for demo user
INSERT INTO user_preferences (user_id, default_model, default_mode) 
SELECT id, 'claude-3.7-sonnet', 'ask' FROM users WHERE email = 'demo@framium.dev';
