# 🧪 Paddle Test Pricing Setup Guide

## 🎯 Create Minimal Test Products in Paddle

To safely test your subscription flow without spending much money, create these test products:

---

## 📋 Products to Create in Paddle Dashboard

### 1. Go to Paddle Dashboard
- Navigate to **Catalog → Products**
- Click **"Create Product"**

### 2. Create Test Products

#### **Test Pro Monthly**
```
Name: Kateriss Pro Monthly (TEST)
Description: Professional HOA management - TEST VERSION
Type: Subscription
Price: $0.01 USD
Billing Interval: Monthly
Trial: No trial
Status: Active
```

#### **Test Pro Yearly**
```
Name: Kateriss Pro Yearly (TEST) 
Description: Professional HOA management - TEST VERSION
Type: Subscription
Price: $0.12 USD (12 months × $0.01)
Billing Interval: Yearly
Trial: No trial
Status: Active
```

#### **Test Agency Monthly**
```
Name: Kateriss Agency Monthly (TEST)
Description: Unlimited HOA solution - TEST VERSION  
Type: Subscription
Price: $0.01 USD
Billing Interval: Monthly
Trial: No trial
Status: Active
```

#### **Test Agency Yearly**
```
Name: Kateriss Agency Yearly (TEST)
Description: Unlimited HOA solution - TEST VERSION
Type: Subscription  
Price: $0.12 USD
Billing Interval: Yearly
Trial: No trial
Status: Active
```

---

## 🔑 Get Test Price IDs

After creating products, copy the Price IDs and add to your `.env` file:

```bash
# Add these TEST price IDs (temporary for testing)
VITE_PADDLE_PRODUCTION_TEST_PRO_MONTHLY_PRICE_ID=pri_01xxxxx
VITE_PADDLE_PRODUCTION_TEST_PRO_YEARLY_PRICE_ID=pri_01xxxxx  
VITE_PADDLE_PRODUCTION_TEST_AGENCY_MONTHLY_PRICE_ID=pri_01xxxxx
VITE_PADDLE_PRODUCTION_TEST_AGENCY_YEARLY_PRICE_ID=pri_01xxxxx
```

---

## 💳 Test Credit Cards

### Paddle Test Cards (if in sandbox):
```
Card: 4000 0000 0000 0002
Expiry: Any future date
CVC: Any 3 digits
```

### Real Cards (for $0.01 production testing):
- Use any real credit/debit card
- Charges will be $0.01 - $0.12 maximum
- Most banks don't charge fees for micro-transactions

---

## 🔄 Switch Between Test and Real Pricing

### Option 1: Environment Variable Toggle
Add this to your `.env`:
```bash
# Set to 'true' for $0.01 testing prices
VITE_ENABLE_TEST_PRICING=true
```

### Option 2: Manual Price ID Swap
Temporarily replace your production price IDs:
```bash
# Original production prices (save these)
VITE_PADDLE_PRODUCTION_PRO_MONTHLY_PRICE_ID=pri_01k1jmkp73zpywnccyq39vea1s

# Replace with test prices temporarily
VITE_PADDLE_PRODUCTION_PRO_MONTHLY_PRICE_ID=pri_01test_minimal_price
```

---

## 🧪 Testing Budget

**Total Testing Cost:** ~$5-10 maximum
- Test Pro Monthly: $0.01 × 5 tests = $0.05
- Test Pro Yearly: $0.12 × 2 tests = $0.24  
- Test Agency Monthly: $0.01 × 3 tests = $0.03
- Test cancellations, refunds, etc.

**Total: Under $1 for comprehensive testing!**

---

## ⚠️ Important Testing Notes

### 1. Mark Test Products Clearly
- Always include "(TEST)" in product names
- Use different descriptions to avoid confusion

### 2. Test in Production Environment
- Use your production Paddle account
- Real payment processing (but minimal amounts)
- Tests real webhooks and integrations

### 3. Clean Up After Testing
- Deactivate test products when done
- Remove test price IDs from .env
- Restore original production prices

### 4. Customer Communication
- If customers accidentally purchase test products
- Refund immediately and apologize
- Guide them to correct products

---

## 🚀 After Testing

### 1. Restore Production Pricing
```bash
# Remove test price IDs
# Restore original production price IDs
VITE_PADDLE_PRODUCTION_PRO_MONTHLY_PRICE_ID=pri_01k1jmkp73zpywnccyq39vea1s
VITE_PADDLE_PRODUCTION_PRO_YEARLY_PRICE_ID=pri_01k1jpbkg3j1sdzfpe7wxsw4sn
# etc...
```

### 2. Deactivate Test Products
- In Paddle Dashboard → Products
- Set test products to "Inactive"
- Keep for future testing reference

### 3. Document Results
- What worked perfectly ✅
- What needed fixes ❌  
- Performance observations 📊
- User experience notes 💭

---

## 🎯 Quick Start

1. **Create 4 test products** in Paddle ($0.01 each)
2. **Copy price IDs** to .env file  
3. **Deploy changes** to production
4. **Start testing** with TESTING_GUIDE.md
5. **Budget $5-10** for comprehensive testing
6. **Clean up** test products when done

**Ready to create your test products in Paddle Dashboard!** 🚀