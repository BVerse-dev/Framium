// lib/db.ts - Database helper functions for Framium
// Vercel Postgres integration

import { sql } from '@vercel/postgres'

// Note: Install dependencies with: npm install @vercel/postgres

export interface User {
  id: string
  email: string
  name: string
  plan: 'BASIC' | 'MAX' | 'BEAST'
  avatar_url?: string
  stripe_customer_id?: string
  created_at: Date
  updated_at: Date
}

export interface UserPreferences {
  id: string
  user_id: string
  default_model: string
  default_mode: 'ask' | 'agent'
  theme: 'dark' | 'light' | 'auto'
  notifications_enabled: boolean
  auto_save_enabled: boolean
  code_style: string
}

export interface TokenUsage {
  id: string
  user_id: string
  model: string
  tokens_used: number
  cost_usd: number
  request_type: string
  created_at: Date
}

export interface AITask {
  id: string
  user_id: string
  title: string
  description?: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused'
  progress: number
  model: string
  steps: any[]
  result?: any
  tokens_used: number
  created_at: Date
  completed_at?: Date
}

// =============================================
// USER MANAGEMENT
// =============================================

export async function createUser(email: string, name: string, plan: 'BASIC' | 'MAX' | 'BEAST' = 'BASIC'): Promise<User> {
  const { rows } = await sql`
    INSERT INTO users (email, name, plan)
    VALUES (${email}, ${name}, ${plan})
    RETURNING *
  `
  
  // Create default preferences
  await sql`
    INSERT INTO user_preferences (user_id, default_model, default_mode)
    VALUES (${rows[0].id}, 'claude-3.7-sonnet', 'ask')
  `
  
  return rows[0]
}

export async function getUserById(userId: string): Promise<User | null> {
  const { rows } = await sql`
    SELECT * FROM users WHERE id = ${userId}
  `
  return rows[0] || null
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { rows } = await sql`
    SELECT * FROM users WHERE email = ${email}
  `
  return rows[0] || null
}

export async function updateUserPlan(userId: string, plan: 'BASIC' | 'MAX' | 'BEAST'): Promise<void> {
  await sql`
    UPDATE users 
    SET plan = ${plan}, updated_at = NOW()
    WHERE id = ${userId}
  `
}

export async function updateUserStripeCustomer(userId: string, stripeCustomerId: string): Promise<void> {
  await sql`
    UPDATE users 
    SET stripe_customer_id = ${stripeCustomerId}, updated_at = NOW()
    WHERE id = ${userId}
  `
}

// =============================================
// USER PREFERENCES
// =============================================

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  const { rows } = await sql`
    SELECT * FROM user_preferences WHERE user_id = ${userId}
  `
  return rows[0] || null
}

export async function updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
  const updates: string[] = []
  
  // Build dynamic update query with direct SQL template
  if (preferences.default_model !== undefined) {
    await sql`UPDATE user_preferences SET default_model = ${preferences.default_model}, updated_at = NOW() WHERE user_id = ${userId}`
  }
  if (preferences.default_mode !== undefined) {
    await sql`UPDATE user_preferences SET default_mode = ${preferences.default_mode}, updated_at = NOW() WHERE user_id = ${userId}`
  }
  if (preferences.theme !== undefined) {
    await sql`UPDATE user_preferences SET theme = ${preferences.theme}, updated_at = NOW() WHERE user_id = ${userId}`
  }
  if (preferences.notifications_enabled !== undefined) {
    await sql`UPDATE user_preferences SET notifications_enabled = ${preferences.notifications_enabled}, updated_at = NOW() WHERE user_id = ${userId}`
  }
  if (preferences.auto_save_enabled !== undefined) {
    await sql`UPDATE user_preferences SET auto_save_enabled = ${preferences.auto_save_enabled}, updated_at = NOW() WHERE user_id = ${userId}`
  }
  if (preferences.code_style !== undefined) {
    await sql`UPDATE user_preferences SET code_style = ${preferences.code_style}, updated_at = NOW() WHERE user_id = ${userId}`
  }
}

// =============================================
// TOKEN USAGE TRACKING
// =============================================

export async function logTokenUsage(
  userId: string, 
  model: string, 
  tokensUsed: number, 
  costUsd: number, 
  requestType: string = 'chat'
): Promise<void> {
  await sql`
    INSERT INTO token_usage (user_id, model, tokens_used, cost_usd, request_type)
    VALUES (${userId}, ${model}, ${tokensUsed}, ${costUsd}, ${requestType})
  `
}

export async function getMonthlyTokenUsage(userId: string): Promise<{ total_tokens: number; total_cost: number }> {
  const { rows } = await sql`
    SELECT 
      COALESCE(SUM(tokens_used), 0) as total_tokens,
      COALESCE(SUM(cost_usd), 0) as total_cost
    FROM token_usage 
    WHERE user_id = ${userId} 
    AND created_at >= date_trunc('month', NOW())
  `
  return rows[0]
}

export async function getUserPlan(userId: string): Promise<string> {
  const { rows } = await sql`
    SELECT plan FROM users WHERE id = ${userId}
  `
  return rows[0]?.plan || 'BASIC'
}

export async function canUserMakeRequest(userId: string, tokensNeeded: number): Promise<boolean> {
  const user = await getUserById(userId)
  if (!user) return false
  
  const usage = await getMonthlyTokenUsage(userId)
  
  // Define token limits per plan
  const limits = {
    BASIC: 50000,
    MAX: 250000,
    BEAST: 1000000
  }
  
  const limit = limits[user.plan]
  return (usage.total_tokens + tokensNeeded) <= limit
}

// =============================================
// AI TASKS MANAGEMENT
// =============================================

export async function createAITask(
  userId: string,
  title: string,
  description: string,
  model: string,
  steps: any[] = []
): Promise<AITask> {
  const { rows } = await sql`
    INSERT INTO ai_tasks (user_id, title, description, model, steps)
    VALUES (${userId}, ${title}, ${description}, ${model}, ${JSON.stringify(steps)})
    RETURNING *
  `
  return rows[0]
}

export async function updateAITaskStatus(
  taskId: string,
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused',
  progress: number = 0,
  result?: any
): Promise<void> {
  const completedAt = status === 'completed' ? new Date() : null
  
  await sql`
    UPDATE ai_tasks 
    SET status = ${status}, 
        progress = ${progress}, 
        result = ${result ? JSON.stringify(result) : null},
        completed_at = ${completedAt}
    WHERE id = ${taskId}
  `
}

export async function getUserTasks(userId: string, limit: number = 50): Promise<AITask[]> {
  const { rows } = await sql`
    SELECT * FROM ai_tasks 
    WHERE user_id = ${userId} 
    ORDER BY created_at DESC 
    LIMIT ${limit}
  `
  return rows
}

export async function updateAITaskTokens(taskId: string, tokensUsed: number): Promise<void> {
  await sql`
    UPDATE ai_tasks 
    SET tokens_used = tokens_used + ${tokensUsed}
    WHERE id = ${taskId}
  `
}

// =============================================
// SAVED PROMPTS
// =============================================

export async function savePrompt(
  userId: string,
  title: string,
  content: string,
  category: string = 'general',
  isPublic: boolean = false
): Promise<void> {
  await sql`
    INSERT INTO saved_prompts (user_id, title, content, category, is_public)
    VALUES (${userId}, ${title}, ${content}, ${category}, ${isPublic})
  `
}

export async function getUserPrompts(userId: string): Promise<any[]> {
  const { rows } = await sql`
    SELECT * FROM saved_prompts 
    WHERE user_id = ${userId} 
    ORDER BY created_at DESC
  `
  return rows
}

export async function deletePrompt(promptId: string, userId: string): Promise<void> {
  await sql`
    DELETE FROM saved_prompts 
    WHERE id = ${promptId} AND user_id = ${userId}
  `
}

// =============================================
// USER STATS & ANALYTICS
// =============================================

export async function getUserStats(userId: string): Promise<any> {
  const { rows } = await sql`
    SELECT * FROM user_stats WHERE id = ${userId}
  `
  return rows[0]
}

// =============================================
// SUBSCRIPTION MANAGEMENT
// =============================================

export async function createSubscription(
  userId: string,
  stripeSubscriptionId: string,
  plan: 'BASIC' | 'MAX' | 'BEAST',
  status: string = 'active',
  currentPeriodStart: Date,
  currentPeriodEnd: Date
): Promise<void> {
  await sql`
    INSERT INTO subscriptions (
      user_id, stripe_subscription_id, plan, status, 
      current_period_start, current_period_end
    )
    VALUES (
      ${userId}, ${stripeSubscriptionId}, ${plan}, ${status},
      ${currentPeriodStart.toISOString()}, ${currentPeriodEnd.toISOString()}
    )
  `
  
  // Update user plan
  await updateUserPlan(userId, plan)
}

export async function updateSubscriptionStatus(
  stripeSubscriptionId: string,
  status: string,
  plan?: 'BASIC' | 'MAX' | 'BEAST'
): Promise<void> {
  await sql`
    UPDATE subscriptions 
    SET status = ${status}, updated_at = NOW()
    WHERE stripe_subscription_id = ${stripeSubscriptionId}
  `
  
  if (plan) {
    // Also update user plan
    const { rows } = await sql`
      SELECT user_id FROM subscriptions 
      WHERE stripe_subscription_id = ${stripeSubscriptionId}
    `
    if (rows[0]) {
      await updateUserPlan(rows[0].user_id, plan)
    }
  }
}

export async function getUserSubscription(userId: string): Promise<any> {
  const { rows } = await sql`
    SELECT * FROM subscriptions 
    WHERE user_id = ${userId} AND status = 'active'
    ORDER BY created_at DESC 
    LIMIT 1
  `
  return rows[0] || null
}
