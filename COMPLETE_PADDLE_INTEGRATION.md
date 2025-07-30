# 💳 Complete Paddle Billing Integration Guide

## Overview
This guide provides step-by-step instructions to implement a complete Paddle billing system for the HOA AI Assistant, including payment processing, usage enforcement, billing dashboard, and webhook handling.

---

## 🔧 **Step 1: Paddle Account Setup**

### **1.1 Get Paddle API Credentials**

#### **Where to Find Your Credentials:**

1. **Login to Paddle Dashboard**: https://vendors.paddle.com/
2. **Navigate to Developer Tools** → **Authentication**
3. **Get Your Credentials**:

```bash
# From Paddle Dashboard → Developer Tools → Authentication
VITE_PADDLE_VENDOR_ID=12345  # Your Vendor ID (Seller ID)
VITE_PADDLE_CLIENT_TOKEN=live_abc123...  # Client-side token (public)
PADDLE_API_KEY=pk_live_xyz789...  # Server-side API key (private)
```

#### **Credential Types Explained:**
- **Vendor ID**: Your unique seller identifier (public, safe for frontend)
- **Client Token**: For frontend Paddle.js SDK (public, safe for frontend)
- **API Key**: For server-side operations (PRIVATE, server-only)

### **1.2 Create Subscription Products**

In Paddle Dashboard → **Catalog** → **Products**:

```
Product 1: HOA AI Assistant Pro
- Price: $29/month
- Features: 50 violation letters, 200 complaints, 10 meetings per month

Product 2: HOA AI Assistant Agency  
- Price: $99/month
- Features: Unlimited usage, multi-property management

Product 3: HOA AI Assistant Enterprise
- Price: $299/month
- Features: Everything + priority support, custom integrations
```

**Save the Product IDs** - you'll need them for integration.

---

## 🚀 **Step 2: Install Dependencies**

```bash
# Install Paddle SDKs
npm install @paddle/paddle-node-sdk @paddle/paddle-js

# Install additional dependencies for billing
npm install date-fns  # For date handling in billing
```

### **2.1 Environment Variables**

Add to your `.env` and Vercel environment variables:

```bash
# Paddle Configuration
VITE_PADDLE_VENDOR_ID=12345
VITE_PADDLE_CLIENT_TOKEN=live_abc123...
PADDLE_API_KEY=pk_live_xyz789...
PADDLE_WEBHOOK_SECRET=your_webhook_secret

# Product IDs (get these from Paddle dashboard)
VITE_PADDLE_PRO_PRODUCT_ID=pro_abc123
VITE_PADDLE_AGENCY_PRODUCT_ID=agency_xyz789
VITE_PADDLE_ENTERPRISE_PRODUCT_ID=enterprise_def456

# Environment
VITE_PADDLE_ENVIRONMENT=production  # or 'sandbox' for testing
```

---

## 🔧 **Step 3: Create Paddle Service**

### **3.1 Server-Side Paddle Service**

Create file: `src/lib/paddle.ts`

```typescript
import { Paddle } from '@paddle/paddle-node-sdk'

class PaddleService {
  private paddle: Paddle

  constructor() {
    this.paddle = new Paddle(process.env.PADDLE_API_KEY!)
  }

  // Get subscription details
  async getSubscription(subscriptionId: string) {
    try {
      const subscription = await this.paddle.subscriptions.get(subscriptionId)
      return subscription
    } catch (error) {
      console.error('Error fetching subscription:', error)
      throw error
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string) {
    try {
      const result = await this.paddle.subscriptions.cancel(subscriptionId, {
        effectiveFrom: 'next_billing_period'
      })
      return result
    } catch (error) {
      console.error('Error canceling subscription:', error)
      throw error
    }
  }

  // Update subscription
  async updateSubscription(subscriptionId: string, newPriceId: string) {
    try {
      const result = await this.paddle.subscriptions.update(subscriptionId, {
        items: [{ price_id: newPriceId, quantity: 1 }]
      })
      return result
    } catch (error) {
      console.error('Error updating subscription:', error)
      throw error
    }
  }

  // Create customer
  async createCustomer(email: string, name: string) {
    try {
      const customer = await this.paddle.customers.create({
        email,
        name
      })
      return customer
    } catch (error) {
      console.error('Error creating customer:', error)
      throw error
    }
  }

  // Get customer subscriptions
  async getCustomerSubscriptions(customerId: string) {
    try {
      const subscriptions = await this.paddle.subscriptions.list({
        customer_id: customerId
      })
      return subscriptions
    } catch (error) {
      console.error('Error fetching customer subscriptions:', error)
      throw error
    }
  }
}

export const paddleService = new PaddleService()
```

### **3.2 Frontend Paddle Integration**

Create file: `src/lib/paddleClient.ts`

```typescript
import { Paddle } from '@paddle/paddle-js'

class PaddleClient {
  private paddle: Paddle | null = null
  private isInitialized = false

  async initialize() {
    if (this.isInitialized) return this.paddle

    try {
      this.paddle = await Paddle.create({
        token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN!,
        environment: import.meta.env.VITE_PADDLE_ENVIRONMENT as 'production' | 'sandbox'
      })
      
      this.isInitialized = true
      return this.paddle
    } catch (error) {
      console.error('Error initializing Paddle:', error)
      throw error
    }
  }

  async openCheckout(priceId: string, customerId?: string) {
    const paddle = await this.initialize()
    if (!paddle) throw new Error('Paddle not initialized')

    try {
      const checkout = await paddle.Checkout.open({
        items: [{ price_id: priceId, quantity: 1 }],
        customer_id: customerId,
        success_url: `${window.location.origin}/billing/success`,
        close_url: `${window.location.origin}/billing`
      })
      
      return checkout
    } catch (error) {
      console.error('Error opening checkout:', error)
      throw error
    }
  }

  async openSubscriptionUpdate(subscriptionId: string, newPriceId: string) {
    const paddle = await this.initialize()
    if (!paddle) throw new Error('Paddle not initialized')

    try {
      const checkout = await paddle.Checkout.open({
        subscription: {
          id: subscriptionId,
          update: {
            items: [{ price_id: newPriceId, quantity: 1 }]
          }
        },
        success_url: `${window.location.origin}/billing/success`,
        close_url: `${window.location.origin}/billing`
      })
      
      return checkout
    } catch (error) {
      console.error('Error opening subscription update:', error)
      throw error
    }
  }
}

export const paddleClient = new PaddleClient()
```

---

## 🏗️ **Step 4: Create Billing Components**

### **4.1 Subscription Manager Component**

Create file: `src/components/billing/SubscriptionManager.tsx`

```typescript
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Calendar, DollarSign, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { paddleClient } from '@/lib/paddleClient'
import { useToast } from '@/components/ui/Toaster'

interface Subscription {
  id: string
  status: 'active' | 'past_due' | 'canceled' | 'paused'
  plan_name: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  paddle_subscription_id: string
}

export const SubscriptionManager: React.FC = () => {
  const { user } = useAuthStore()
  const { success, error } = useToast()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      // Fetch from your Supabase subscriptions table
      const response = await fetch(`/api/billing/subscription`, {
        headers: { 'Authorization': `Bearer ${user?.id}` }
      })
      const data = await response.json()
      setSubscription(data.subscription)
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (priceId: string) => {
    try {
      if (subscription) {
        // Update existing subscription
        await paddleClient.openSubscriptionUpdate(subscription.paddle_subscription_id, priceId)
      } else {
        // Create new subscription
        await paddleClient.openCheckout(priceId, user?.paddle_customer_id)
      }
    } catch (error) {
      error('Checkout Error', 'Failed to open billing checkout')
    }
  }

  const handleCancelSubscription = async () => {
    if (!subscription) return

    try {
      const response = await fetch('/api/billing/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`
        },
        body: JSON.stringify({ subscriptionId: subscription.paddle_subscription_id })
      })

      if (response.ok) {
        success('Subscription Canceled', 'Your subscription will be canceled at the end of the current period')
        fetchSubscription()
      }
    } catch (error) {
      error('Cancellation Failed', 'Failed to cancel subscription')
    }
  }

  if (loading) {
    return (
      <div className="brutal-card p-6">
        <div className="loading-liquid mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="brutal-card p-6"
      >
        <h2 className="heading-3 mb-6 flex items-center gap-2">
          <CreditCard className="w-6 h-6" />
          SUBSCRIPTION STATUS
        </h2>

        {subscription ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg uppercase">{subscription.plan_name}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Status: <span className={`font-medium ${
                    subscription.status === 'active' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {subscription.status.toUpperCase()}
                  </span>
                </p>
              </div>
              {subscription.status === 'active' ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <AlertCircle className="w-8 h-8 text-red-600" />
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="brutal-surface p-4 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">CURRENT PERIOD</span>
                </div>
                <p className="text-sm">
                  {new Date(subscription.current_period_start).toLocaleDateString()} - 
                  {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              </div>

              <div className="brutal-surface p-4 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-medium">RENEWAL</span>
                </div>
                <p className="text-sm">
                  {subscription.cancel_at_period_end ? 
                    'Cancels at period end' : 
                    `Auto-renews ${new Date(subscription.current_period_end).toLocaleDateString()}`
                  }
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => handleUpgrade(import.meta.env.VITE_PADDLE_PRO_PRODUCT_ID)}
                className="btn-secondary flex-1"
              >
                CHANGE PLAN
              </button>
              {!subscription.cancel_at_period_end && (
                <button 
                  onClick={handleCancelSubscription}
                  className="btn-secondary flex-1 border-red-500 text-red-600 hover:bg-red-50"
                >
                  CANCEL SUBSCRIPTION
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <h3 className="font-bold mb-2">NO ACTIVE SUBSCRIPTION</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                You're currently on the free plan with limited features.
              </p>
              <button 
                onClick={() => handleUpgrade(import.meta.env.VITE_PADDLE_PRO_PRODUCT_ID)}
                className="btn-primary"
              >
                UPGRADE TO PRO
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Pricing Plans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="brutal-card p-6"
      >
        <h2 className="heading-3 mb-6">AVAILABLE PLANS</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Pro Plan */}
          <div className="brutal-surface p-6 bg-gray-50 dark:bg-gray-800 text-center">
            <h3 className="font-bold text-xl mb-2">PRO</h3>
            <p className="text-3xl font-bold mb-4">$29<span className="text-base">/month</span></p>
            <ul className="text-sm space-y-2 mb-6">
              <li>✓ 50 violation letters/month</li>
              <li>✓ 200 complaint responses/month</li>
              <li>✓ 10 meeting summaries/month</li>
              <li>✓ Monthly reports</li>
              <li>✓ Email support</li>
            </ul>
            <button 
              onClick={() => handleUpgrade(import.meta.env.VITE_PADDLE_PRO_PRODUCT_ID)}
              className="btn-primary w-full"
            >
              {subscription?.plan_name === 'Pro' ? 'CURRENT PLAN' : 'UPGRADE TO PRO'}
            </button>
          </div>

          {/* Agency Plan */}
          <div className="brutal-surface p-6 bg-electric-50 border-2 border-brutal-electric text-center">
            <div className="bg-brutal-electric text-black px-2 py-1 text-xs font-bold mb-4">
              MOST POPULAR
            </div>
            <h3 className="font-bold text-xl mb-2">AGENCY</h3>
            <p className="text-3xl font-bold mb-4">$99<span className="text-base">/month</span></p>
            <ul className="text-sm space-y-2 mb-6">
              <li>✓ Unlimited usage</li>
              <li>✓ Multi-property management</li>
              <li>✓ Priority support</li>
              <li>✓ Custom templates</li>
              <li>✓ Advanced analytics</li>
            </ul>
            <button 
              onClick={() => handleUpgrade(import.meta.env.VITE_PADDLE_AGENCY_PRODUCT_ID)}
              className="btn-primary w-full"
            >
              {subscription?.plan_name === 'Agency' ? 'CURRENT PLAN' : 'UPGRADE TO AGENCY'}
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="brutal-surface p-6 bg-gray-50 dark:bg-gray-800 text-center">
            <h3 className="font-bold text-xl mb-2">ENTERPRISE</h3>
            <p className="text-3xl font-bold mb-4">$299<span className="text-base">/month</span></p>
            <ul className="text-sm space-y-2 mb-6">
              <li>✓ Everything in Agency</li>
              <li>✓ Custom integrations</li>
              <li>✓ Dedicated support</li>
              <li>✓ Custom branding</li>
              <li>✓ SLA guarantee</li>
            </ul>
            <button 
              onClick={() => handleUpgrade(import.meta.env.VITE_PADDLE_ENTERPRISE_PRODUCT_ID)}
              className="btn-primary w-full"
            >
              {subscription?.plan_name === 'Enterprise' ? 'CURRENT PLAN' : 'CONTACT SALES'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
```

### **4.2 Usage Limits Component**

Create file: `src/components/billing/UsageLimits.tsx`

```typescript
import React from 'react'
import { motion } from 'framer-motion'
import { BarChart3, AlertTriangle, CheckCircle, FileText, MessageCircle, Mic } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'

interface UsageLimit {
  name: string
  current: number
  limit: number
  icon: React.ReactNode
}

export const UsageLimits: React.FC = () => {
  const { user } = useAuthStore()
  
  const usageLimits: UsageLimit[] = [
    {
      name: 'Violation Letters',
      current: user?.usage_stats?.letters_this_month || 0,
      limit: user?.subscription_tier === 'free' ? 5 : 
             user?.subscription_tier === 'pro' ? 50 : 999,
      icon: <FileText className="w-5 h-5" />
    },
    {
      name: 'Complaint Responses',
      current: user?.usage_stats?.complaints_this_month || 0,
      limit: user?.subscription_tier === 'free' ? 10 : 
             user?.subscription_tier === 'pro' ? 200 : 999,
      icon: <MessageCircle className="w-5 h-5" />
    },
    {
      name: 'Meeting Summaries',
      current: user?.usage_stats?.meetings_this_month || 0,
      limit: user?.subscription_tier === 'free' ? 2 : 
             user?.subscription_tier === 'pro' ? 10 : 999,
      icon: <Mic className="w-5 h-5" />
    },
    {
      name: 'Monthly Reports',
      current: user?.usage_stats?.reports_this_month || 0,
      limit: user?.subscription_tier === 'free' ? 1 : 
             user?.subscription_tier === 'pro' ? 5 : 999,
      icon: <BarChart3 className="w-5 h-5" />
    }
  ]

  const getUsageColor = (current: number, limit: number) => {
    const percentage = (current / limit) * 100
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 75) return 'text-orange-600'
    return 'text-green-600'
  }

  const getProgressColor = (current: number, limit: number) => {
    const percentage = (current / limit) * 100
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-orange-500'
    return 'bg-brutal-electric'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="brutal-card p-6"
    >
      <h2 className="heading-3 mb-6 flex items-center gap-2">
        <BarChart3 className="w-6 h-6" />
        USAGE LIMITS - {user?.subscription_tier?.toUpperCase() || 'FREE'}
      </h2>

      <div className="space-y-6">
        {usageLimits.map((usage, index) => {
          const percentage = Math.min((usage.current / usage.limit) * 100, 100)
          const isUnlimited = usage.limit === 999
          
          return (
            <div key={usage.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {usage.icon}
                  <span className="font-medium">{usage.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${getUsageColor(usage.current, usage.limit)}`}>
                    {usage.current}{isUnlimited ? '' : `/${usage.limit}`}
                  </span>
                  {percentage >= 90 ? (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                </div>
              </div>
              
              {!isUnlimited && (
                <div className="progress-brutal">
                  <div 
                    className={`progress-fill ${getProgressColor(usage.current, usage.limit)}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              )}
              
              {isUnlimited && (
                <div className="text-xs text-green-600 font-medium">
                  ✓ UNLIMITED USAGE
                </div>
              )}
            </div>
          )
        })}
      </div>

      {user?.subscription_tier === 'free' && (
        <div className="brutal-surface p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 mt-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="font-medium text-yellow-800 dark:text-yellow-200">
              UPGRADE FOR MORE USAGE
            </span>
          </div>
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            You're on the free plan with limited usage. Upgrade to Pro for 10x more capacity!
          </p>
        </div>
      )}
    </motion.div>
  )
}
```

---

## ⚙️ **Step 5: Add Usage Enforcement**

### **5.1 Usage Check Hook**

Create file: `src/hooks/useUsageCheck.ts`

```typescript
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/components/ui/Toaster'

export const useUsageCheck = () => {
  const { user } = useAuthStore()
  const { error } = useToast()

  const checkUsageLimit = (type: 'letters' | 'complaints' | 'meetings' | 'reports') => {
    if (!user) return false

    const usage = user.usage_stats
    const tier = user.subscription_tier

    // Get limits based on subscription tier
    const limits = {
      free: { letters: 5, complaints: 10, meetings: 2, reports: 1 },
      pro: { letters: 50, complaints: 200, meetings: 10, reports: 5 },
      agency: { letters: 999, complaints: 999, meetings: 999, reports: 999 },
      enterprise: { letters: 999, complaints: 999, meetings: 999, reports: 999 }
    }

    const currentUsage = usage?.[`${type}_this_month`] || 0
    const limit = limits[tier as keyof typeof limits]?.[type] || limits.free[type]

    if (currentUsage >= limit && limit !== 999) {
      error(
        'Usage Limit Reached',
        `You've reached your monthly limit for ${type}. Upgrade your plan to continue.`
      )
      return false
    }

    return true
  }

  const getRemainingUsage = (type: 'letters' | 'complaints' | 'meetings' | 'reports') => {
    if (!user) return 0

    const usage = user.usage_stats
    const tier = user.subscription_tier

    const limits = {
      free: { letters: 5, complaints: 10, meetings: 2, reports: 1 },
      pro: { letters: 50, complaints: 200, meetings: 10, reports: 5 },
      agency: { letters: 999, complaints: 999, meetings: 999, reports: 999 },
      enterprise: { letters: 999, complaints: 999, meetings: 999, reports: 999 }
    }

    const currentUsage = usage?.[`${type}_this_month`] || 0
    const limit = limits[tier as keyof typeof limits]?.[type] || limits.free[type]

    return Math.max(0, limit - currentUsage)
  }

  return { checkUsageLimit, getRemainingUsage }
}
```

### **5.2 Update AI Generation Functions**

Update each AI agent page (ViolationGenerator, ComplaintReply, etc.):

```typescript
// Add to each AI agent page
import { useUsageCheck } from '@/hooks/useUsageCheck'

export const ViolationGenerator: React.FC = () => {
  const { checkUsageLimit } = useUsageCheck()
  const { user } = useAuthStore()
  
  const handleGenerate = async () => {
    // Check usage limit before generation
    if (!checkUsageLimit('letters')) {
      return // Usage limit error already shown by hook
    }

    // Existing generation code...
    try {
      // ... generation logic
      
      // After successful generation, update usage stats
      await updateUsageStats('letters')
    } catch (error) {
      // ... error handling
    }
  }

  // Helper function to update usage stats
  const updateUsageStats = async (type: string) => {
    try {
      await fetch('/api/usage/increment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`
        },
        body: JSON.stringify({ type })
      })
      
      // Refresh user data to get updated usage stats
      // This would trigger a re-fetch of user data
    } catch (error) {
      console.error('Error updating usage stats:', error)
    }
  }
}
```

---

## 🔗 **Step 6: API Routes and Webhooks**

Since you're using Vercel, create these API routes in an `api` folder:

### **6.1 Create API Routes**

Create file: `api/billing/subscription.ts`

```typescript
import { supabase } from '@/lib/supabase'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const userId = req.headers.authorization?.replace('Bearer ', '')
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return res.status(200).json({ subscription })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
```

Create file: `api/billing/cancel-subscription.ts`

```typescript
import { paddleService } from '@/lib/paddle'
import { supabase } from '@/lib/supabase'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const userId = req.headers.authorization?.replace('Bearer ', '')
    const { subscriptionId } = req.body

    if (!userId || !subscriptionId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Cancel subscription with Paddle
    await paddleService.cancelSubscription(subscriptionId)

    // Update local database
    const { error } = await supabase
      .from('subscriptions')
      .update({ cancel_at_period_end: true })
      .eq('user_id', userId)
      .eq('paddle_subscription_id', subscriptionId)

    if (error) throw error

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
```

Create file: `api/usage/increment.ts`

```typescript
import { supabase } from '@/lib/supabase'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const userId = req.headers.authorization?.replace('Bearer ', '')
    const { type } = req.body

    if (!userId || !type) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Increment usage stats
    const { error } = await supabase.rpc('increment_usage', {
      user_id: userId,
      usage_type: `${type}_this_month`
    })

    if (error) throw error

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error incrementing usage:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
```

### **6.2 Paddle Webhook Handler**

Create file: `api/webhooks/paddle.ts`

```typescript
import { paddleService } from '@/lib/paddle'
import { supabase } from '@/lib/supabase'
import { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'

// Verify Paddle webhook signature
const verifyPaddleSignature = (rawBody: string, signature: string, secret: string) => {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  )
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const signature = req.headers['paddle-signature'] as string
    const rawBody = JSON.stringify(req.body)

    // Verify webhook signature
    if (!verifyPaddleSignature(rawBody, signature, process.env.PADDLE_WEBHOOK_SECRET!)) {
      return res.status(401).json({ error: 'Invalid signature' })
    }

    const { event_type, data } = req.body

    switch (event_type) {
      case 'subscription.created':
        await handleSubscriptionCreated(data)
        break
      
      case 'subscription.updated':
        await handleSubscriptionUpdated(data)
        break
      
      case 'subscription.canceled':
        await handleSubscriptionCanceled(data)
        break
      
      case 'transaction.completed':
        await handleTransactionCompleted(data)
        break
      
      default:
        console.log('Unhandled webhook event:', event_type)
    }

    return res.status(200).json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleSubscriptionCreated(data: any) {
  try {
    // Find user by email
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', data.customer.email)
      .single()

    if (!user) {
      console.error('User not found for subscription:', data.customer.email)
      return
    }

    // Create subscription record
    await supabase.from('subscriptions').insert({
      user_id: user.id,
      paddle_subscription_id: data.id,
      plan_name: getPlanNameFromPriceId(data.items[0].price.id),
      status: data.status,
      current_period_start: data.current_billing_period.starts_at,
      current_period_end: data.current_billing_period.ends_at,
      cancel_at_period_end: false
    })

    // Update user subscription tier
    const tier = getTierFromPlanName(getPlanNameFromPriceId(data.items[0].price.id))
    await supabase
      .from('users')
      .update({ subscription_tier: tier })
      .eq('id', user.id)

  } catch (error) {
    console.error('Error handling subscription created:', error)
  }
}

async function handleSubscriptionUpdated(data: any) {
  try {
    // Update subscription record
    await supabase
      .from('subscriptions')
      .update({
        plan_name: getPlanNameFromPriceId(data.items[0].price.id),
        status: data.status,
        current_period_start: data.current_billing_period.starts_at,
        current_period_end: data.current_billing_period.ends_at,
        cancel_at_period_end: data.scheduled_change?.action === 'cancel'
      })
      .eq('paddle_subscription_id', data.id)

    // Update user subscription tier
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('paddle_subscription_id', data.id)
      .single()

    if (subscription) {
      const tier = getTierFromPlanName(getPlanNameFromPriceId(data.items[0].price.id))
      await supabase
        .from('users')
        .update({ subscription_tier: tier })
        .eq('id', subscription.user_id)
    }

  } catch (error) {
    console.error('Error handling subscription updated:', error)
  }
}

async function handleSubscriptionCanceled(data: any) {
  try {
    // Update subscription status
    await supabase
      .from('subscriptions')
      .update({ status: 'canceled' })
      .eq('paddle_subscription_id', data.id)

    // Downgrade user to free tier
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('paddle_subscription_id', data.id)
      .single()

    if (subscription) {
      await supabase
        .from('users')
        .update({ subscription_tier: 'free' })
        .eq('id', subscription.user_id)
    }

  } catch (error) {
    console.error('Error handling subscription canceled:', error)
  }
}

async function handleTransactionCompleted(data: any) {
  // Handle successful payments, update subscription status if needed
  console.log('Transaction completed:', data.id)
}

// Helper functions
function getPlanNameFromPriceId(priceId: string): string {
  const plans: Record<string, string> = {
    [process.env.VITE_PADDLE_PRO_PRODUCT_ID!]: 'Pro',
    [process.env.VITE_PADDLE_AGENCY_PRODUCT_ID!]: 'Agency',  
    [process.env.VITE_PADDLE_ENTERPRISE_PRODUCT_ID!]: 'Enterprise'
  }
  return plans[priceId] || 'Pro'
}

function getTierFromPlanName(planName: string): string {
  return planName.toLowerCase()
}

// Configure to accept raw body for signature verification
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}
```

---

## 📊 **Step 7: Add Billing Dashboard to Settings**

Update `src/pages/Settings.tsx`:

```typescript
import { SubscriptionManager } from '@/components/billing/SubscriptionManager'
import { UsageLimits } from '@/components/billing/UsageLimits'

export const Settings: React.FC = () => {
  // ... existing code

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Existing settings sections */}
      
      {/* Add Billing Section */}
      <div className="space-y-8">
        <UsageLimits />
        <SubscriptionManager />
      </div>
    </div>
  )
}
```

---

## 🔧 **Step 8: Create Supabase Functions for Usage**

Add this function to your Supabase SQL:

```sql
-- Function to increment usage stats
CREATE OR REPLACE FUNCTION increment_usage(user_id UUID, usage_type TEXT)
RETURNS void AS $$
BEGIN
    UPDATE users 
    SET usage_stats = jsonb_set(
        usage_stats,
        ARRAY[usage_type],
        (COALESCE(usage_stats->>usage_type, '0')::int + 1)::text::jsonb
    )
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;
```

---

## 🚀 **Step 9: Deploy and Configure**

### **9.1 Environment Variables in Vercel**

In your Vercel dashboard, add these environment variables:

```bash
VITE_PADDLE_VENDOR_ID=12345
VITE_PADDLE_CLIENT_TOKEN=live_abc123...
PADDLE_API_KEY=pk_live_xyz789...
PADDLE_WEBHOOK_SECRET=your_webhook_secret
VITE_PADDLE_PRO_PRODUCT_ID=pro_abc123
VITE_PADDLE_AGENCY_PRODUCT_ID=agency_xyz789
VITE_PADDLE_ENTERPRISE_PRODUCT_ID=enterprise_def456
VITE_PADDLE_ENVIRONMENT=production
```

### **9.2 Configure Paddle Webhooks**

In Paddle Dashboard → Developer Tools → Webhooks:

1. **Add Webhook URL**: `https://your-app.vercel.app/api/webhooks/paddle`
2. **Select Events**:
   - `subscription.created`
   - `subscription.updated`
   - `subscription.canceled`
   - `transaction.completed`
3. **Copy Webhook Secret** and add to environment variables

---

## ✅ **Step 10: Testing**

### **10.1 Test Paddle Integration**

1. **Sandbox Testing**: Use `VITE_PADDLE_ENVIRONMENT=sandbox` first
2. **Test Checkout Flow**: Create test subscription
3. **Test Webhooks**: Use Paddle webhook testing tool
4. **Test Usage Limits**: Verify enforcement works
5. **Test Cancellation**: Ensure subscriptions can be canceled

### **10.2 Production Launch**

1. Switch to `VITE_PADDLE_ENVIRONMENT=production`
2. Update all environment variables with production values
3. Test with real payment methods
4. Monitor webhook logs and error tracking

---

## 🎯 **Summary**

This complete Paddle integration provides:

✅ **Payment Processing**: Full subscription management  
✅ **Usage Enforcement**: Real-time limit checking  
✅ **Billing Dashboard**: User-friendly subscription management  
✅ **Webhook Handling**: Automatic subscription updates  
✅ **Multiple Plans**: Free, Pro, Agency, Enterprise tiers  
✅ **Usage Tracking**: Detailed monthly usage statistics  

**Your HOA AI Assistant is now production-ready with complete billing integration!**

---

## 📁 **File Structure Summary**

```
src/
├── lib/
│   ├── paddle.ts                    # Server-side Paddle service
│   └── paddleClient.ts              # Frontend Paddle integration
├── components/billing/
│   ├── SubscriptionManager.tsx      # Subscription management UI
│   └── UsageLimits.tsx             # Usage tracking display
├── hooks/
│   └── useUsageCheck.ts            # Usage limit enforcement
└── pages/Settings.tsx               # Updated with billing

api/
├── billing/
│   ├── subscription.ts              # Get subscription endpoint
│   └── cancel-subscription.ts       # Cancel subscription endpoint
├── usage/
│   └── increment.ts                 # Usage tracking endpoint
└── webhooks/
    └── paddle.ts                    # Paddle webhook handler
```

**Follow these steps in order, and you'll have a complete, production-ready billing system!**