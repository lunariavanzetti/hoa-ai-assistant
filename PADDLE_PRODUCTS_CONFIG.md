# 🏷️ Paddle Product Configurations

## Complete Paddle product setup for all subscription tiers

---

## 💼 **PRO PLAN**

### **Product Configuration:**
```
Product name: HOA AI Assistant Pro
Tax category: Standard digital goods
Description: Professional HOA management with AI automation. Perfect for medium-sized communities managing 50-300 units. Includes 50 violation letters, 200 complaint responses, and 10 meeting summaries per month.

Product icon URL: https://your-domain.com/icons/pro-plan.png
```

### **Custom Data:**
```json
{
  "tier": "pro",
  "features": [
    "50 AI violation letters per month",
    "200 complaint responses per month", 
    "10 meeting summaries per month",
    "5 monthly reports per month",
    "Priority email support",
    "Advanced photo management",
    "Custom letter templates",
    "Usage analytics dashboard",
    "PDF export functionality"
  ],
  "target_audience": "Medium-sized HOAs (50-300 units)",
  "upgrade_from": "free",
  "upgrade_to": "agency",
  "monthly_price": 29,
  "billing_cycle": "monthly",
  "limits": {
    "letters_per_month": 50,
    "complaints_per_month": 200,
    "meetings_per_month": 10,
    "reports_per_month": 5
  }
}
```

---

## 🏢 **AGENCY PLAN**

### **Product Configuration:**
```
Product name: HOA AI Assistant Agency
Tax category: Standard digital goods
Description: Unlimited HOA management solution for large communities and property management companies. Includes unlimited usage, multi-property management, and advanced features. Most popular choice for growing HOAs.

Product icon URL: https://your-domain.com/icons/agency-plan.png
```

### **Custom Data:**
```json
{
  "tier": "agency",
  "features": [
    "UNLIMITED violation letters",
    "UNLIMITED complaint responses",
    "UNLIMITED meeting summaries", 
    "UNLIMITED monthly reports",
    "Multi-property management",
    "Priority phone & email support",
    "Advanced analytics & insights",
    "Custom templates & branding",
    "Bulk operations",
    "API access for integrations",
    "White-label options",
    "Advanced user permissions"
  ],
  "target_audience": "Large HOAs (300+ units) and property management companies",
  "upgrade_from": "pro",
  "upgrade_to": "enterprise",
  "monthly_price": 99,
  "billing_cycle": "monthly",
  "limits": {
    "letters_per_month": 999999,
    "complaints_per_month": 999999,
    "meetings_per_month": 999999,
    "reports_per_month": 999999
  },
  "badge": "Most Popular"
}
```

---

## 🌟 **ENTERPRISE PLAN**

### **Product Configuration:**
```
Product name: HOA AI Assistant Enterprise
Tax category: Standard digital goods
Description: Premium HOA management solution with dedicated support and custom integrations. Perfect for large property management companies requiring white-label solutions, custom development, and 24/7 support with SLA guarantees.

Product icon URL: https://your-domain.com/icons/enterprise-plan.png
```

### **Custom Data:**
```json
{
  "tier": "enterprise",
  "features": [
    "Everything in Agency Plan",
    "Dedicated account manager",
    "Custom integrations & API development",
    "24/7 priority support with SLA",
    "Custom AI model training",
    "Advanced security & compliance",
    "Custom reporting & analytics",
    "White-label with full branding",
    "Single Sign-On (SSO)",
    "Advanced user management",
    "Custom workflows",
    "Data migration assistance",
    "Training & onboarding sessions",
    "Custom contract terms"
  ],
  "target_audience": "Large property management companies and corporate HOA portfolios",
  "upgrade_from": "agency",
  "monthly_price": 299,
  "billing_cycle": "monthly",
  "limits": {
    "letters_per_month": 999999,
    "complaints_per_month": 999999,
    "meetings_per_month": 999999,
    "reports_per_month": 999999
  },
  "includes_custom_development": true,
  "sla_guarantee": "99.9% uptime",
  "response_time": "1 hour"
}
```

---

## 🎨 **Product Icons Design Specs**

### **Icon Requirements:**
- **Size**: 256x256px minimum
- **Format**: PNG with transparent background
- **Style**: Match brutalist design system
- **Colors**: Use brutal-electric (#00ff00) accents

### **Pro Plan Icon:**
- **Primary Element**: Shield with "PRO" text
- **Color**: Electric green on black background
- **Style**: Geometric, sharp edges

### **Agency Plan Icon:**
- **Primary Element**: Building blocks or Crown
- **Color**: Electric green with "Agency" badge
- **Style**: Stacked geometric shapes

### **Enterprise Plan Icon:**
- **Primary Element**: Crown or diamond shape
- **Color**: Electric green with premium accent
- **Style**: Angular, premium appearance

---

## 📝 **Paddle Dashboard Setup Steps**

### **Step 1: Create Products**
1. Go to **Paddle Dashboard** → **Catalog** → **Products**
2. Click **"Add Product"**
3. Fill in the configuration above for each plan
4. Upload the product icons
5. Add custom data in JSON format

### **Step 2: Set Prices**
1. For each product, click **"Add Price"**
2. Set billing cycle to **"Monthly"**
3. Set currency to **"USD"**
4. Enter amounts: $29, $99, $299

### **Step 3: Configure Tax**
1. Select **"Standard digital goods"** for all products
2. Enable tax calculation
3. Set up tax rules for your regions

### **Step 4: Save Product IDs**
After creating each product, save the IDs:
```bash
# Add these to your environment variables
VITE_PADDLE_PRO_PRODUCT_ID=pri_abc123...
VITE_PADDLE_AGENCY_PRODUCT_ID=pri_def456...
VITE_PADDLE_ENTERPRISE_PRODUCT_ID=pri_ghi789...
```

---

## 🔧 **Integration Code Updates**

### **Update Environment Variables:**
```bash
# Add to .env and Vercel
VITE_PADDLE_PRO_PRODUCT_ID=pri_abc123...
VITE_PADDLE_AGENCY_PRODUCT_ID=pri_def456...  
VITE_PADDLE_ENTERPRISE_PRODUCT_ID=pri_ghi789...
```

### **Update Product Mapping:**
```typescript
// In your webhook handler (api/webhooks/paddle.ts)
function getPlanNameFromPriceId(priceId: string): string {
  const plans: Record<string, string> = {
    [process.env.VITE_PADDLE_PRO_PRODUCT_ID!]: 'Pro',
    [process.env.VITE_PADDLE_AGENCY_PRODUCT_ID!]: 'Agency',  
    [process.env.VITE_PADDLE_ENTERPRISE_PRODUCT_ID!]: 'Enterprise'
  }
  return plans[priceId] || 'Pro'
}
```

---

## 📊 **Product Analytics Tracking**

### **Custom Data Usage:**
The custom data fields enable:
- **Feature tracking** per plan
- **Usage limit enforcement**
- **Upgrade path recommendations**
- **Analytics and reporting**
- **A/B testing different features**

### **Analytics Events:**
```typescript
// Track product interactions
analytics.track('Product Viewed', {
  product_name: 'HOA AI Assistant Pro',
  tier: 'pro',
  price: 29,
  features: customData.features
})

analytics.track('Upgrade Clicked', {
  from_tier: 'free',
  to_tier: 'pro',
  trigger: 'usage_limit_reached'
})
```

This configuration ensures your Paddle products are properly set up with all necessary metadata for billing, features, and analytics!