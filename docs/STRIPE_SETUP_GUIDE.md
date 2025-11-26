# 🚀 Stripe Integration Setup Guide - Tangibel

## ✅ Phases 2 & 3 Complete!

All core Stripe integration code is now implemented. Follow these steps to complete the setup.

---

## 📋 Step-by-Step Setup

### **Step 1: Run Supabase Migration** 🗄️

Add Stripe columns to your `profiles` table:

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your Tangibel project
   - Click on **SQL Editor** in the left sidebar

2. **Run the migration**
   - Copy the contents of `/supabase/migrations/add_stripe_subscription_columns.sql`
   - Paste into SQL Editor
   - Click **Run**
   
3. **Verify columns added**
   - Go to **Table Editor** → `profiles`
   - Confirm these new columns exist:
     - `stripe_customer_id`
     - `stripe_subscription_id`
     - `subscription_tier`
     - `subscription_status`
     - `current_period_start`
     - `current_period_end`

---

### **Step 2: Get Stripe API Keys** 🔑

1. **Create/Login to Stripe Account**
   - Go to: https://dashboard.stripe.com/register
   - Create account (if needed) or sign in

2. **Get Test Mode Keys** (for development)
   - In Stripe Dashboard, ensure you're in **Test Mode** (toggle in top right)
   - Go to: **Developers** → **API keys**
   - Copy these keys:
     - **Publishable key** (starts with `pk_test_`)
     - **Secret key** (starts with `sk_test_`)

3. **Add to `.env.development`**
   ```bash
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   STRIPE_SECRET_KEY=sk_test_your_key_here
   ```

---

### **Step 3: Create Products & Prices in Stripe** 💰

#### **Create Product 1: Garage Parking**

1. Go to: **Products** → **Add Product**
2. Fill in:
   - **Name**: `Garage Parking`
   - **Description**: `CPU-based generations for hobbyists`
   - **Pricing model**: `Recurring`
   - **Price**: `$9.00`
   - **Billing period**: `Monthly`
3. Click **Add Product**
4. **Copy the Price ID** (starts with `price_`)
5. **Add yearly price**:
   - Click **Add another price**
   - Price: `$87.00` (20% discount from $108)
   - Billing period: `Yearly`
   - **Copy the Price ID**

6. **Update `.env.local`**:
   ```bash
   STRIPE_GARAGE_MONTHLY_PRICE_ID=price_xxx_monthly
   STRIPE_GARAGE_YEARLY_PRICE_ID=price_xxx_yearly
   ```

#### **Create Product 2: Showroom Floor**

1. **Add Product**
   - Name: `Showroom Floor`
   - Description: `GPU-based generations for serious creators`
   - Price: `$29.00` monthly
2. **Copy Price ID**
3. **Add yearly price**: `$278.00`
4. **Update `.env.development`**:
   ```bash
   STRIPE_SHOWROOM_MONTHLY_PRICE_ID=price_xxx_monthly
   STRIPE_SHOWROOM_YEARLY_PRICE_ID=price_xxx_yearly
   ```

#### **Create Product 3: Dealership**

1. **Add Product**
   - Name: `Dealership`
   - Description: `GPU-based generations for commercial teams`
   - Price: `$49.00` monthly
2. **Copy Price ID**
3. **Add yearly price**: `$470.00`
4. **Update `.env.development`**:
   ```bash
   STRIPE_DEALERSHIP_MONTHLY_PRICE_ID=price_xxx_monthly
   STRIPE_DEALERSHIP_YEARLY_PRICE_ID=price_xxx_yearly
   ```

---

### **Step 4: Set Up Webhook for Local Testing** 🎣

#### **Option A: Stripe CLI (Recommended for Local Dev)**

1. **Install Stripe CLI**
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe**
   ```bash
   stripe login
   ```

3. **Start webhook forwarding**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. **Copy the webhook signing secret** (starts with `whsec_`)
   ```bash
   # It will output something like:
   # > Ready! Your webhook signing secret is whsec_xxxxx
   ```

5. **Add to `.env.development`**
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

6. **Keep this terminal running** while testing!

#### **Option B: ngrok (Alternative)**

1. **Install ngrok**: https://ngrok.com/download
2. **Start ngrok**:
   ```bash
   ngrok http 3000
   ```
3. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)
4. **Add webhook in Stripe Dashboard**:
   - Go to: **Developers** → **Webhooks**
   - Click **Add endpoint**
   - URL: `https://abc123.ngrok.io/api/webhooks/stripe`
   - Events: Select all `invoice.*`, `customer.subscription.*`, `checkout.session.*`
   - Copy the **Signing secret**
5. **Add to `.env.development`**:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

---

### **Step 5: Test the Integration** 🧪

#### **A. Start Development Server**

```bash
# Terminal 1: Start Next.js
npm run dev

# Terminal 2: Start Stripe webhook listener (if using CLI)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

#### **B. Test Subscription Flow**

1. **Go to pricing page**
   ```
   http://localhost:3000/pricing
   ```

2. **Click "Start Creating" or "Go Pro"**
   - Should redirect you to sign-in if not logged in
   - After login, redirects to Stripe checkout

3. **Use Stripe test card**
   - Card number: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

4. **Complete checkout**
   - Click **Subscribe**
   - Should redirect back to dashboard

5. **Verify subscription created**
   - Check Supabase → `profiles` table
   - User should have:
     - `subscription_tier`: `garage` or `showroom`
     - `subscription_status`: `active`
     - `credits_remaining`: Updated based on tier

#### **C. Test Webhook Events**

Watch the terminal running `stripe listen` - you should see:
- ✅ `checkout.session.completed`
- ✅ `invoice.payment_succeeded`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`

#### **D. Test Billing Portal**

1. **Go to profile page**
   ```
   http://localhost:3000/profile
   ```

2. **Click "Subscription & Billing" tab**

3. **Click "Manage Billing & Payment Methods"**
   - Should redirect to Stripe billing portal
   - User can update card, cancel subscription, view invoices

#### **E. Test Webhook Events Manually**

In Stripe Dashboard:
1. **Go to customer** → **Subscriptions**
2. Try:
   - Cancel subscription → Check status updates to `canceled`
   - Update subscription → Check tier/status updates
   - Invoice payment fails → Check status updates to `past_due`

---

### **Step 6: Verify Database Updates** ✅

After testing, check your Supabase `profiles` table:

**Expected data for subscribed user:**
```
stripe_customer_id: "cus_xxxxx"
stripe_subscription_id: "sub_xxxxx"
subscription_tier: "garage" | "showroom" | "dealership"
subscription_status: "active"
current_period_start: "2024-01-01T00:00:00Z"
current_period_end: "2024-02-01T00:00:00Z"
credits_remaining: 50 | 200 | 500
```

---

## 🔒 Security Checklist

✅ **All implemented securely:**
- ✅ No hardcoded API keys
- ✅ Secret keys only in server routes
- ✅ Public keys only in client components
- ✅ Webhook signature verification
- ✅ User authentication required
- ✅ Supabase RLS enabled
- ✅ No sensitive data exposed to client

---

## 🐛 Troubleshooting

### **Issue: "Webhook signature verification failed"**
**Solution**: 
- Make sure Stripe CLI is running with correct endpoint
- Check `STRIPE_WEBHOOK_SECRET` matches CLI output
- Restart dev server after adding webhook secret

### **Issue: "User already has an active subscription"**
**Solution**: 
- This is expected behavior (prevents duplicate subscriptions)
- User should use billing portal to change plan
- Or cancel existing subscription first

### **Issue: Credits not updating after payment**
**Solution**:
- Check webhook events arrived (Stripe CLI terminal)
- Verify `invoice.payment_succeeded` was processed
- Check Supabase logs for errors
- Verify `subscription_tier` is set correctly

### **Issue: Redirect to Stripe fails**
**Solution**:
- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Check browser console for errors
- Ensure you're using the correct (test) key

---

## 🚀 Going to Production

When ready to accept real payments:

### **1. Switch to Live Mode**

1. **Get live keys** from Stripe Dashboard (toggle to Live Mode)
   - Publishable key (starts with `pk_live_`)
   - Secret key (starts with `sk_live_`)

2. **Update `.env.production`** (or Vercel env variables):
   ```bash
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here
   STRIPE_SECRET_KEY=sk_live_your_key_here
   ```

3. **Create live products** (repeat Step 3 in Live Mode)

4. **Update live price IDs** in production environment

### **2. Set Up Production Webhook**

1. **In Stripe Dashboard (Live Mode)**:
   - Go to: **Developers** → **Webhooks**
   - Click **Add endpoint**
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events to select:
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

2. **Copy webhook signing secret**
3. **Add to production environment**:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_production_secret
   ```

### **3. Update App URL**

```bash
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### **4. Test in Production**

- Use real card for one test subscription
- Verify webhooks working (check Stripe Dashboard → Webhooks → Events)
- Test complete flow: signup → subscribe → verify credits

---

## 📊 Monitoring

### **Stripe Dashboard**

Monitor these regularly:
- **Payments** → View successful/failed payments
- **Customers** → See all subscribers
- **Subscriptions** → Active/canceled subscriptions
- **Webhooks** → Webhook delivery status

### **Supabase Dashboard**

Check:
- **Table Editor** → `profiles` → Verify subscription data
- **Logs** → API logs for errors
- **Auth** → User signups and logins

---

## 📞 Support

If you encounter issues:

1. **Check Stripe Logs**: Dashboard → Developers → Logs
2. **Check Webhook Events**: Dashboard → Developers → Webhooks → Events
3. **Check Browser Console**: F12 → Console tab
4. **Check Server Logs**: Terminal running `npm run dev`
5. **Test with Stripe CLI**: Use `stripe logs tail` to see real-time events

---

## 🎉 You're Done!

Your Stripe integration is complete and secure. You can now:
- ✅ Accept subscriptions
- ✅ Manage billing via portal
- ✅ Auto-refresh credits on payment
- ✅ Handle subscription lifecycle events
- ✅ Upgrade/downgrade plans

**Happy coding! 🚀**
