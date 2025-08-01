# 🏗️ Paddle Price Setup Guide for Kateriss HOA AI Assistant

## 📋 Overview
You need to create **6 different prices** in Paddle - 2 for each plan (monthly + yearly). Each price should be linked to its corresponding product.

---

## 🎯 Price Configuration Template

### **1. PRO PLAN - Monthly Price**
```
Base price: 19.00 USD
Tax: Account default (Inc. tax)
Type: Recurring
Billing period: Monthly
Trial period: [Leave empty]
Price name: "Pro Plan - Monthly Subscription"
Internal description: "HOA AI Assistant Pro Plan - Monthly billing for small to medium HOAs (50-300 units)"

Product quantity limit:
Min: 1
Max: 1
```
**Save this and copy the Price ID → `VITE_PADDLE_PRO_MONTHLY_PRICE_ID`**

---

### **2. PRO PLAN - Yearly Price**
```
Base price: 190.00 USD
Tax: Account default (Inc. tax)
Type: Recurring
Billing period: Yearly
Trial period: [Leave empty]
Price name: "Pro Plan - Annual Subscription"
Internal description: "HOA AI Assistant Pro Plan - Annual billing for small to medium HOAs (50-300 units) - 2 months free"

Product quantity limit:
Min: 1
Max: 1
```
**Save this and copy the Price ID → `VITE_PADDLE_PRO_YEARLY_PRICE_ID`**

---

### **3. AGENCY PLAN - Monthly Price**
```
Base price: 29.00 USD
Tax: Account default (Inc. tax)
Type: Recurring
Billing period: Monthly
Trial period: [Leave empty]
Price name: "Agency Plan - Monthly Subscription"
Internal description: "HOA AI Assistant Agency Plan - Monthly billing for large HOAs and property management companies (300+ units)"

Product quantity limit:
Min: 1
Max: 1
```
**Save this and copy the Price ID → `VITE_PADDLE_AGENCY_MONTHLY_PRICE_ID`**

---

### **4. AGENCY PLAN - Yearly Price**
```
Base price: 290.00 USD
Tax: Account default (Inc. tax)
Type: Recurring
Billing period: Yearly
Trial period: [Leave empty]
Price name: "Agency Plan - Annual Subscription"
Internal description: "HOA AI Assistant Agency Plan - Annual billing for large HOAs and property management companies (300+ units) - 2 months free"

Product quantity limit:
Min: 1
Max: 1
```
**Save this and copy the Price ID → `VITE_PADDLE_AGENCY_YEARLY_PRICE_ID`**

---

### **5. ENTERPRISE PLAN - Monthly Price**
```
Base price: 49.00 USD
Tax: Account default (Inc. tax)
Type: Recurring
Billing period: Monthly
Trial period: [Leave empty]
Price name: "Enterprise Plan - Monthly Subscription"
Internal description: "HOA AI Assistant Enterprise Plan - Monthly billing with dedicated support and custom integrations"

Product quantity limit:
Min: 1
Max: 1
```
**Save this and copy the Price ID → `VITE_PADDLE_ENTERPRISE_MONTHLY_PRICE_ID`**

---

### **6. ENTERPRISE PLAN - Yearly Price**
```
Base price: 490.00 USD
Tax: Account default (Inc. tax)
Type: Recurring
Billing period: Yearly
Trial period: [Leave empty]
Price name: "Enterprise Plan - Annual Subscription"
Internal description: "HOA AI Assistant Enterprise Plan - Annual billing with dedicated support and custom integrations - 2 months free"

Product quantity limit:
Min: 1
Max: 1
```
**Save this and copy the Price ID → `VITE_PADDLE_ENTERPRISE_YEARLY_PRICE_ID`**

---

## 🔧 Environment Variables Setup

After creating all 6 prices, update your `.env` file:

```bash
# Paddle Configuration
VITE_PADDLE_CLIENT_TOKEN=your_paddle_client_token
VITE_PADDLE_ENVIRONMENT=sandbox  # or 'production'

# Pro Plan Price IDs
VITE_PADDLE_PRO_MONTHLY_PRICE_ID=pri_01xxxxxxxxx
VITE_PADDLE_PRO_YEARLY_PRICE_ID=pri_01xxxxxxxxx

# Agency Plan Price IDs
VITE_PADDLE_AGENCY_MONTHLY_PRICE_ID=pri_01xxxxxxxxx
VITE_PADDLE_AGENCY_YEARLY_PRICE_ID=pri_01xxxxxxxxx

# Enterprise Plan Price IDs
VITE_PADDLE_ENTERPRISE_MONTHLY_PRICE_ID=pri_01xxxxxxxxx
VITE_PADDLE_ENTERPRISE_YEARLY_PRICE_ID=pri_01xxxxxxxxx
```

## 🚀 Vercel Environment Variables

Add the same variables to your Vercel project:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all 8 variables above
3. Redeploy your application

---

## ✅ Verification Checklist

- [ ] Created 6 prices in Paddle dashboard
- [ ] All prices have correct amounts (19/190, 29/290, 49/490)
- [ ] All prices are set to "Recurring" type
- [ ] Monthly prices have "Monthly" billing period
- [ ] Yearly prices have "Yearly" billing period
- [ ] Copied all 6 Price IDs to .env file
- [ ] Added all environment variables to Vercel
- [ ] Redeployed application
- [ ] SQL table created in Supabase (✅ Done - "Success. No rows returned")

---

## 🔍 Testing

After setup:
1. Go to https://hoa-ai-assistant.vercel.app/pricing
2. Click "Get Started" on any paid plan
3. Should open Paddle checkout without 403 error
4. Complete a test transaction in sandbox mode

---

## 📞 Support

If you encounter issues:
- Check Paddle dashboard for price status
- Verify all environment variables are exactly as shown
- Ensure you're using Price IDs (pri_01...) not Product IDs
- Check browser console for detailed error messages

---

**🎯 Key Points:**
- Use the **exact pricing** shown above (matches your current pricing page)
- Each price needs to be linked to the correct product in Paddle
- Price IDs start with `pri_01...` 
- Make sure billing periods match (Monthly/Yearly)
- Set quantity limits to prevent multiple subscriptions per user