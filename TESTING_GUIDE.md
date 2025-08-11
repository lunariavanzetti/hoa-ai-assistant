# 🧪 Kateriss App Complete Testing Guide

## 🎯 Testing Overview

This guide provides comprehensive testing for your HOA AI Assistant SaaS platform, covering subscription flows, usage limits, and all features.

---

## 🔧 Pre-Testing Setup

### 1. Create Test Pricing in Paddle
For safe testing, create minimal price products in Paddle:

**In Paddle Dashboard → Catalog → Products:**
- **Test Pro Monthly**: $0.01 USD
- **Test Pro Yearly**: $0.12 USD  
- **Test Agency Monthly**: $0.01 USD
- **Test Agency Yearly**: $0.12 USD

*Note: Paddle's minimum price is $0.01, perfect for testing*

### 2. Update Environment Variables (Temporarily)
```bash
# Add these TEST price IDs to your .env file:
VITE_PADDLE_PRODUCTION_TEST_PRO_MONTHLY_PRICE_ID=pri_test_123
VITE_PADDLE_PRODUCTION_TEST_PRO_YEARLY_PRICE_ID=pri_test_456
```

### 3. Testing Tools Needed
- **2 email accounts** (one for main account, one for testing)
- **Test credit card**: Use Paddle test cards or real card for $0.01 charges
- **Browser devtools** open during tests
- **Notepad** for recording results

---

## 📋 Test Plan Overview

### Phase 1: Free Plan Testing ✅
### Phase 2: Subscription Flow Testing 💳
### Phase 3: Usage Limits Testing 🔄
### Phase 4: Paddle Retain Testing 📧
### Phase 5: Full Feature Testing 🚀

---

## 🆓 PHASE 1: Free Plan Testing

### Test 1.1: New User Registration
**Steps:**
1. Go to `https://kateriss.space`
2. Click "Get Started Free"
3. Register with new email
4. Verify email confirmation
5. Complete onboarding

**Expected Results:**
- ✅ Account created successfully
- ✅ Lands on dashboard
- ✅ Shows free plan limits in UI
- ✅ No payment required

### Test 1.2: Free Plan Usage Limits
**Steps:**
1. Navigate to "Create Violation Letter"
2. Generate 5 violation letters (free limit)
3. Try to generate 6th violation letter
4. Check complaint responses (10 limit)
5. Check meeting summaries (2 limit)
6. Check reports (1 limit)

**Expected Results:**
- ✅ First 5 letters generate successfully
- ✅ 6th letter shows upgrade modal
- ✅ Usage counters display correctly
- ✅ Upgrade modal shows Pro plan benefits

### Test 1.3: Usage Reset Monthly
**Steps:**
1. Check current usage in dashboard
2. Manually test monthly reset logic
3. Verify counters reset properly

**Expected Results:**
- ✅ Usage resets on month boundary
- ✅ Can generate content again after reset

---

## 💳 PHASE 2: Subscription Flow Testing

### Test 2.1: Upgrade Flow from Free
**Steps:**
1. On free account, trigger upgrade modal
2. Click "Upgrade to Pro"
3. Select Monthly billing
4. Complete Paddle checkout with $0.01 test price
5. Return to app after successful payment

**Expected Results:**
- ✅ Redirected to Paddle checkout
- ✅ Shows correct price ($0.01)
- ✅ Payment processes successfully
- ✅ Redirected back to dashboard
- ✅ Account shows Pro status
- ✅ Usage limits removed/increased

**Browser Console Checks:**
```
Console should show:
✅ "Paddle initialized successfully for production"
✅ "Paddle Retain initialized with customer data"
✅ No JavaScript errors
✅ Subscription status updated
```

### Test 2.2: Direct Pricing Page Purchase
**Steps:**
1. Log out and create new account
2. Go to `/pricing` page
3. Click "Choose Pro" button
4. Complete sign-up if needed
5. Complete Paddle checkout

**Expected Results:**
- ✅ Pricing page loads correctly
- ✅ Plan features display properly
- ✅ Checkout flow works from pricing page
- ✅ New account gets Pro status immediately

### Test 2.3: Billing Cycle Selection
**Steps:**
1. Test Monthly → Yearly toggle on pricing page
2. Verify prices update correctly
3. Test checkout with both cycles

**Expected Results:**
- ✅ Prices update when toggling Monthly/Yearly
- ✅ Paddle receives correct price ID
- ✅ Different billing cycles create correct subscriptions

---

## 🔄 PHASE 3: Usage Limits Testing

### Test 3.1: Pro Plan Limits
**Steps:**
1. With active Pro subscription
2. Generate 50 violation letters (Pro limit)
3. Generate 200 complaint responses
4. Try to exceed limits or verify unlimited access

**Expected Results:**
- ✅ Pro limits are much higher than Free
- ✅ No upgrade prompts until limits reached
- ✅ Usage tracking works correctly

### Test 3.2: Subscription Status Integration
**Steps:**
1. Check `user.subscription_status` in browser devtools
2. Verify `paddle_subscription_id` exists
3. Test that `hasPaidPlan` logic works

**Console Commands:**
```javascript
// In browser console:
console.log('User object:', user)
console.log('Subscription status:', user?.subscription_status)
console.log('Paddle subscription ID:', user?.paddle_subscription_id)
```

**Expected Results:**
- ✅ User object contains subscription data
- ✅ `hasPaidPlan` returns `true` for paid users
- ✅ Unlimited access granted for paid plans

### Test 3.3: Subscription Cancellation
**Steps:**
1. Cancel subscription in Paddle dashboard
2. Wait for webhook to process
3. Check app behavior after cancellation

**Expected Results:**
- ✅ App reverts to free plan limits
- ✅ Usage tracking resumes
- ✅ Upgrade prompts appear again

---

## 📧 PHASE 4: Paddle Retain Testing

### Test 4.1: Payment Recovery Setup
**Steps:**
1. Verify Paddle Retain is configured
2. Check DKIM/email settings
3. Simulate failed payment scenario

**Expected Results:**
- ✅ Retain emails configured with your branding
- ✅ Payment recovery emails sent
- ✅ Recovery forms work on homepage

### Test 4.2: In-App Notifications
**Steps:**
1. With subscription, check dashboard
2. Look for payment-related notifications
3. Verify Paddle.js loaded with customer data

**Console Check:**
```javascript
// Should show customer email passed to Paddle
console.log('Paddle customer initialized')
```

---

## 🚀 PHASE 5: Full Feature Testing

### Test 5.1: All AI Features
**Steps:**
1. **Violation Letters**: Create different types
2. **Complaint Response**: Test AI responses
3. **Meeting Summaries**: Upload/process meetings
4. **Reports**: Generate monthly reports

**Expected Results:**
- ✅ All AI features work properly
- ✅ Content quality is high
- ✅ Export features work
- ✅ Usage properly tracked

### Test 5.2: User Experience Flow
**Steps:**
1. Complete entire user journey:
   - Sign up → Use free features → Hit limits → Upgrade → Use paid features
2. Test onboarding flow
3. Test settings and profile management

**Expected Results:**
- ✅ Smooth user experience
- ✅ No broken links or errors
- ✅ Professional appearance
- ✅ Mobile responsiveness

---

## 🔍 Debug & Monitoring

### Console Commands for Testing
```javascript
// Check subscription status
console.log('User:', useAuthStore.getState().user)

// Check usage limits
console.log('Usage:', useUsageStore.getState().usage)
console.log('Can use letters:', useUsageStore.getState().canUseFeature('violation_letters'))

// Check Paddle
console.log('Paddle:', window.Paddle)
console.log('Environment:', import.meta.env.VITE_PADDLE_ENVIRONMENT)
```

### Important Log Messages to Watch For
```
✅ "Paddle initialized successfully for production"
✅ "Paddle Retain initialized with customer data"  
✅ "Usage limit check passed"
✅ "Subscription status: active"
❌ Any error messages
❌ "Missing price ID"
❌ "Subscription check failed"
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Checkout Fails
**Symptoms:** Paddle checkout doesn't open
**Solutions:**
- Check price IDs are correct in .env
- Verify Paddle client token
- Check browser console for errors

### Issue 2: Subscription Status Not Updated
**Symptoms:** Still shows free limits after payment
**Solutions:**
- Check Paddle webhook configuration
- Verify user object in database
- Force refresh browser

### Issue 3: Usage Limits Not Working
**Symptoms:** Unlimited access on free plan
**Solutions:**
- Check `FREE_PLAN_LIMITS` values
- Verify `hasPaidPlan` logic
- Clear browser storage and restart

---

## ✅ Success Criteria

### Free Plan ✅
- [x] Registration works
- [x] Usage limits enforced  
- [x] Upgrade prompts appear
- [x] Monthly reset functions

### Paid Plans ✅
- [x] Checkout completes successfully
- [x] Subscription status updates
- [x] Higher/unlimited limits granted
- [x] Features unlock properly

### Overall UX ✅
- [x] Professional appearance
- [x] No JavaScript errors
- [x] Fast loading times
- [x] Mobile friendly
- [x] Email notifications work

---

## 📊 Testing Checklist

Print this checklist and check off each item:

**Free Plan Testing:**
- [ ] New user registration
- [ ] Usage limit enforcement
- [ ] Upgrade modal triggers
- [ ] Monthly reset works

**Subscription Testing:**
- [ ] Paddle checkout opens
- [ ] Payment processes ($0.01)
- [ ] Returns to dashboard
- [ ] Subscription status updates
- [ ] Usage limits increase

**Feature Testing:**
- [ ] Violation letters generate
- [ ] Complaint responses work
- [ ] Meeting summaries process
- [ ] Reports create properly
- [ ] All exports function

**Technical Testing:**
- [ ] No console errors
- [ ] Paddle.js loads correctly
- [ ] Database updates properly
- [ ] Email notifications sent

**Business Testing:**
- [ ] Revenue tracked in Paddle
- [ ] Customer support ready
- [ ] Refund process works
- [ ] Analytics functioning

---

## 🎯 Final Testing Notes

**Budget for Testing:** ~$5-10 (for multiple $0.01 transactions)

**Time Required:** 3-4 hours for complete testing

**Team Members:** Test with 2-3 different people for UX feedback

**Success Metric:** 100% of test scenarios pass without issues

---

**Ready to start testing? Begin with Phase 1 and work through each section systematically!** 🚀