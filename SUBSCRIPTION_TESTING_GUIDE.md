# 🧪 Comprehensive Subscription Testing Guide for Kateriss HOA AI Assistant

## 🎯 **Testing Environment Setup**

### **Current Configuration:**
- **Environment**: Sandbox
- **Purpose**: Safe testing without real charges
- **Test Cards**: Paddle provides test payment methods

---

## 📋 **Pre-Testing Checklist**

### **1. Verify Environment Variables** ✅
```bash
VITE_PADDLE_ENVIRONMENT=sandbox

# Sandbox Configuration (Required)
VITE_PADDLE_SANDBOX_CLIENT_TOKEN=test_xxxxxxxx
VITE_PADDLE_SANDBOX_PRO_MONTHLY_PRICE_ID=pri_01xxxxxxxx
VITE_PADDLE_SANDBOX_PRO_YEARLY_PRICE_ID=pri_01xxxxxxxx
VITE_PADDLE_SANDBOX_AGENCY_MONTHLY_PRICE_ID=pri_01xxxxxxxx
VITE_PADDLE_SANDBOX_AGENCY_YEARLY_PRICE_ID=pri_01xxxxxxxx
VITE_PADDLE_SANDBOX_ENTERPRISE_MONTHLY_PRICE_ID=pri_01xxxxxxxx
VITE_PADDLE_SANDBOX_ENTERPRISE_YEARLY_PRICE_ID=pri_01xxxxxxxx
```

### **2. Paddle Dashboard Setup** ✅
- [ ] Sandbox account created
- [ ] 6 products created (Pro, Agency, Enterprise × Monthly/Yearly)
- [ ] All prices are **ACTIVE** status
- [ ] Sandbox client token copied

---

## 🚀 **Testing Workflow**

### **Phase 1: Environment Verification**

1. **Go to**: https://hoa-ai-assistant.vercel.app/pricing
2. **Open**: Browser console (F12)
3. **Click**: "Get Started" on Pro plan
4. **Check**: Console shows:
   ```
   VITE_PADDLE_ENVIRONMENT: sandbox
   VITE_PADDLE_SANDBOX_CLIENT_TOKEN: true
   Sandbox Price IDs: [all 6 should be populated]
   ```

### **Phase 2: Checkout Flow Testing**

#### **Test Case 1: Monthly Pro Plan**
1. **Action**: Click "Get Started" on Pro Monthly ($9/month)
2. **Expected**: Paddle checkout overlay opens
3. **Verify**: 
   - Price shows $9.00
   - Plan shows "Pro Plan - Monthly"
   - Payment form appears

#### **Test Case 2: Yearly Discount**  
1. **Action**: Toggle to "Yearly" billing
2. **Action**: Click "Get Started" on Pro Yearly
3. **Expected**: 
   - Price shows $90.00 (10 months cost)
   - "Save 2 months" badge visible
   - Checkout shows yearly billing

#### **Test Case 3: All Plans**
Test each plan in both monthly and yearly:
- ✅ Pro: $9/$90
- ✅ Agency: $19/$190  
- ✅ Enterprise: $49/$490

### **Phase 3: Payment Testing**

#### **Sandbox Test Cards** (Use these for testing):

**✅ Successful Payment:**
```
Card: 4000 0000 0000 0002
Expiry: Any future date
CVC: Any 3 digits
```

**❌ Declined Payment:**
```
Card: 4000 0000 0000 0127
Expiry: Any future date  
CVC: Any 3 digits
```

**⏳ Requires 3D Secure:**
```
Card: 4000 0000 0000 3220
Expiry: Any future date
CVC: Any 3 digits
```

#### **Payment Flow Testing:**
1. **Complete**: Successful payment with test card
2. **Verify**: Redirected to success page
3. **Check**: User subscription updated in database
4. **Test**: Declined payment handling
5. **Test**: 3D Secure authentication

### **Phase 4: Subscription Management**

#### **Post-Purchase Testing:**
1. **Go to**: Settings page → Billing section
2. **Verify**: Current plan shows correctly
3. **Test**: "View Billing History" button
4. **Test**: "Upgrade" button functionality
5. **Check**: Usage limits updated

#### **Feature Access Testing:**
1. **Test**: Free plan limitations enforced
2. **Test**: Paid plan features unlocked
3. **Verify**: Violation letter limits updated
4. **Check**: Multi-property access (Agency+)

---

## 🔍 **Debugging & Troubleshooting**

### **Common Issues & Solutions:**

#### **Issue**: 403 JWT Error
**Cause**: Environment mismatch or wrong client token
**Solution**: Verify sandbox client token and environment match

#### **Issue**: Price ID not found
**Cause**: Price not created or inactive
**Solution**: Check Paddle dashboard, ensure prices are ACTIVE

#### **Issue**: Checkout doesn't open
**Cause**: Missing environment variables
**Solution**: Check console logs for missing variables

### **Console Debugging Checklist:**
```javascript
// Look for these in console:
✅ "Paddle initialized successfully for sandbox"
✅ "Opening checkout with config: {...}"  
✅ All 6 price IDs populated
❌ "Missing Paddle client token"
❌ "Price ID not found"
```

---

## 📊 **Test Scenarios Matrix**

| Plan | Billing | Price | Test Card | Expected Result |
|------|---------|-------|-----------|----------------|
| Pro | Monthly | $9 | 4000...0002 | ✅ Success |
| Pro | Yearly | $90 | 4000...0002 | ✅ Success |
| Agency | Monthly | $19 | 4000...0127 | ❌ Declined |
| Agency | Yearly | $190 | 4000...3220 | ⏳ 3D Secure |
| Enterprise | Monthly | $49 | 4000...0002 | ✅ Success |
| Enterprise | Yearly | $490 | 4000...0002 | ✅ Success |

---

## 🎯 **Success Criteria**

### **✅ Checkout Flow:**
- [ ] All 6 plan variations open checkout
- [ ] Correct prices displayed
- [ ] Payment forms load properly
- [ ] Test cards process correctly

### **✅ Post-Purchase:**
- [ ] Success page redirects work
- [ ] User subscription status updates
- [ ] Feature access changes appropriately
- [ ] Billing history accessible

### **✅ Error Handling:**
- [ ] Declined payments handled gracefully
- [ ] Network errors show user-friendly messages
- [ ] Console shows clear debugging info

---

## 🚀 **Production Deployment Checklist**

### **When Ready for Live Payments:**
1. **Switch Environment Variables:**
   ```bash
   VITE_PADDLE_ENVIRONMENT=production
   # Use VITE_PADDLE_PRODUCTION_* variables
   ```

2. **Create Production Prices:**
   - Copy all 6 prices to production environment
   - Update production price IDs in environment variables

3. **Test with Real Cards:**
   - Start with small amount
   - Verify webhooks work
   - Test subscription management

4. **Go Live:**
   - Deploy with production variables
   - Monitor for issues
   - Be ready to rollback if needed

---

## 📞 **Support & Resources**

### **Paddle Documentation:**
- [Sandbox Testing](https://developer.paddle.com/concepts/payment-methods/test-cards)
- [Checkout API](https://developer.paddle.com/paddlejs/methods/paddle-checkout-open)
- [Webhooks](https://developer.paddle.com/webhooks/overview)

### **Quick Debug Commands:**
```javascript
// In browser console:
console.log('Environment:', import.meta.env.VITE_PADDLE_ENVIRONMENT)
console.log('Client Token:', !!import.meta.env.VITE_PADDLE_SANDBOX_CLIENT_TOKEN)
```

---

**🎯 Start Testing**: Once you've filled in your sandbox price IDs, we can begin comprehensive testing of the subscription flow!