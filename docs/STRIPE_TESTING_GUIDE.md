# 🧪 Stripe Testing Guide - Step by Step

**Quick Start**: Follow this exact sequence to test your Stripe integration

---

## ⚡ Quick Setup (5 minutes)

### 1. Run Supabase Migration

```bash
# Open Supabase Dashboard
open https://supabase.com/dashboard

# Go to your project → SQL Editor
# Paste the contents of: supabase/migrations/add_stripe_subscription_columns.sql
# Click "Run"
```

### 2. Get Stripe Keys

```bash
# Open Stripe Dashboard
open https://dashboard.stripe.com

# Make sure you're in TEST MODE (toggle top-right)
# Go to: Developers → API keys
# Copy these two keys:
```

- **Publishable key**: `pk_test_...`
- **Secret key**: `sk_test_...`

### 3. Create Test Environment File

Create `.env.local` (this file is already in `.gitignore`):

```bash
# Copy your existing .env.production
cp .env.production .env.local

# Then edit .env.local and add your Stripe test keys:
```

```bash
# Stripe Test Keys
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE

# You'll add these after creating products:
STRIPE_GARAGE_MONTHLY_PRICE_ID=price_xxx
STRIPE_GARAGE_YEARLY_PRICE_ID=price_xxx
STRIPE_SHOWROOM_MONTHLY_PRICE_ID=price_xxx
STRIPE_SHOWROOM_YEARLY_PRICE_ID=price_xxx
STRIPE_DEALERSHIP_MONTHLY_PRICE_ID=price_xxx
STRIPE_DEALERSHIP_YEARLY_PRICE_ID=price_xxx

# Webhook secret (you'll get this from Stripe CLI)
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Make sure these are set
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📦 Create Stripe Products (10 minutes)

### Product 1: Garage Parking

1. Go to Stripe Dashboard → **Products** → **Add Product**
2. Fill in:
   ```
   Name: Garage Parking
   Description: CPU-based generations for hobbyists
   Price: $9.00
   Billing: Recurring → Monthly
   ```
3. Click **Save product**
4. **Copy the Price ID** (starts with `price_`) 
5. Add to `.env.local`: `STRIPE_GARAGE_MONTHLY_PRICE_ID=price_xxx`

6. Add yearly price:
   - Click **Add another price**
   - Price: $87.00
   - Billing: Recurring → Yearly
   - Click **Save**
   - **Copy the Price ID**
   - Add to `.env.local`: `STRIPE_GARAGE_YEARLY_PRICE_ID=price_xxx`

### Product 2: Showroom Floor

Repeat above with:
```
Name: Showroom Floor
Description: GPU-based generations for creators
Monthly: $29.00 → Copy price ID
Yearly: $278.00 → Copy price ID
```

### Product 3: Dealership

Repeat above with:
```
Name: Dealership
Description: GPU-based generations for teams
Monthly: $49.00 → Copy price ID
Yearly: $470.00 → Copy price ID
```

**Your `.env.local` should now have all 6 price IDs filled in.**

---

## 🔧 Install Stripe CLI (5 minutes)

### macOS

```bash
brew install stripe/stripe-cli/stripe
```

### Windows

Download from: https://github.com/stripe/stripe-cli/releases

### Linux

```bash
curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update
sudo apt install stripe
```

### Login to Stripe

```bash
stripe login
# Follow the prompts - it will open browser
```

---

## 🚀 Start Testing (2 minutes)

### Terminal 1: Start Next.js

```bash
cd /Users/tomi/Documents/GitHub/Video_-Analyzer/model-car-website
npm run dev
```

Wait for: `✓ Ready on http://localhost:3000`

### Terminal 2: Start Stripe Webhook Listener

```bash
cd /Users/tomi/Documents/GitHub/Video_-Analyzer/model-car-website
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**IMPORTANT**: You'll see output like:

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

**Copy that `whsec_xxx` value** and add it to `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

Then **restart your Next.js server** (Terminal 1):
```bash
# Press Ctrl+C to stop
npm run dev
```

---

## ✅ Test Full Subscription Flow

### Step 1: Sign Up

1. Open: http://localhost:3000
2. Click **Sign Up** (or go to: http://localhost:3000/sign-up)
3. Create account with:
   - Email: test@example.com
   - Password: testpass123
4. Verify you're redirected to dashboard

### Step 2: Check Initial State

1. Go to: http://localhost:3000/profile
2. Click **Subscription & Billing** tab
3. Should see:
   - Current Plan: **Free Tier**
   - Credits: **10**
   - Message: "You're on the free plan"

### Step 3: Subscribe to Plan

1. Go to: http://localhost:3000/pricing
2. Click **Subscribe** on **Garage Parking** plan
3. You'll be redirected to Stripe checkout
4. Fill in test card:
   ```
   Card number: 4242 4242 4242 4242
   Expiry: 12/34
   CVC: 123
   Name: Test User
   ZIP: 12345
   ```
5. Click **Subscribe**

### Step 4: Verify Webhooks (Terminal 2)

You should see events appear in Terminal 2:

```
✓ checkout.session.completed
✓ customer.subscription.created
✓ invoice.payment_succeeded
```

### Step 5: Verify Database

1. Open Supabase Dashboard → **Table Editor** → `profiles`
2. Find your user row
3. Verify columns updated:
   ```
   stripe_customer_id: cus_xxxxx
   stripe_subscription_id: sub_xxxxx
   subscription_tier: garage
   subscription_status: active
   credits_remaining: 50
   current_period_start: 2025-11-24...
   current_period_end: 2025-12-24...
   ```

### Step 6: Verify Profile Page

1. Go to: http://localhost:3000/profile
2. Click **Subscription & Billing**
3. Should see:
   - Current Plan: **Garage Parking**
   - Status: **ACTIVE** (green badge)
   - Credits: **50/50** with full progress bar
   - Next billing date: (one month from now)
   - **Manage Billing** button visible

### Step 7: Test Billing Portal

1. Click **Manage Billing** or **Open Stripe Billing Portal**
2. Should redirect to Stripe billing portal
3. Test features:
   - Update payment method
   - View invoices
   - Cancel subscription (optional)

### Step 8: Test Cancellation (Optional)

1. In billing portal, click **Cancel plan**
2. Confirm cancellation
3. Return to profile page
4. Should see:
   - Status: **CANCELED** (red badge)
   - Notice: "Your subscription will end on [date]"
   - Credits remain until end of period

---

## 🎯 Test Scenarios

### Scenario 1: Subscribe → Use Credits → Renew

```bash
# 1. Subscribe to plan (50 credits)
# 2. Use some credits by generating images
# 3. Wait for renewal (or test with Stripe CLI)
stripe trigger invoice.payment_succeeded

# 4. Credits should refresh to 50
```

### Scenario 2: Upgrade Plan

```bash
# 1. Subscribe to Garage ($9/month, 50 credits)
# 2. Go to pricing page
# 3. Click "Subscribe" on Showroom ($29/month)
# 4. Stripe will handle the upgrade
# 5. Credits should update to 200
```

### Scenario 3: Payment Failure

```bash
# Test with failing card
Card: 4000 0000 0000 0341
# This card will decline after initial payment

# Subscription status should update to "past_due"
```

### Scenario 4: Free Trial

If you want to add a 7-day trial:

1. Edit: `app/api/create-checkout/route.ts`
2. Add to `subscription_data`:
   ```typescript
   subscription_data: {
     trial_period_days: 7,
     metadata: { ... }
   }
   ```

---

## 🐛 Troubleshooting

### Issue: Webhook signature verification failed

**Solution**:
```bash
# 1. Make sure Stripe CLI is running
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# 2. Copy the webhook secret from CLI output
# 3. Add to .env.local
STRIPE_WEBHOOK_SECRET=whsec_xxx

# 4. Restart Next.js server
```

### Issue: Price ID not configured

**Solution**:
```bash
# Make sure all 6 price IDs are in .env.local
# They should start with: price_
```

### Issue: Credits not updating

**Solution**:
```bash
# Check Terminal 2 for webhook events
# Should see: invoice.payment_succeeded

# Check Supabase logs:
# Dashboard → Logs → Filter by "profiles"
```

### Issue: Can't access billing portal

**Solution**:
```bash
# User needs a stripe_customer_id first
# Make sure they've subscribed at least once
```

### Issue: Stripe checkout redirects to localhost in production

**Solution**:
```bash
# Update in .env.production:
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## 📊 Verify Everything Works

Use this checklist:

- [ ] Supabase migration ran successfully
- [ ] All 6 Stripe price IDs in `.env.local`
- [ ] Stripe webhook secret in `.env.local`
- [ ] Next.js server running
- [ ] Stripe CLI running and forwarding webhooks
- [ ] Can sign up new user
- [ ] Free user has 10 credits
- [ ] Can click Subscribe button
- [ ] Stripe checkout opens
- [ ] Can complete payment with test card
- [ ] Webhooks appear in Terminal 2
- [ ] Database updated (check Supabase)
- [ ] Profile page shows active subscription
- [ ] Credits updated to 50 (or 200, 500)
- [ ] Can open billing portal
- [ ] Can cancel subscription
- [ ] Status updates to canceled

---

## 🎉 Success Criteria

Your Stripe integration is working when:

1. ✅ User can subscribe to any plan
2. ✅ Credits are granted immediately
3. ✅ Subscription status shows in profile
4. ✅ Billing portal is accessible
5. ✅ Webhooks process without errors
6. ✅ Database stays in sync with Stripe
7. ✅ Cancellations are handled gracefully

---

## 📝 Test Checklist for Beta Launch

Before launching to beta users:

- [ ] Test all 3 subscription tiers (Garage, Showroom, Dealership)
- [ ] Test monthly and yearly billing
- [ ] Test subscription cancellation
- [ ] Test payment failure handling
- [ ] Test upgrade/downgrade flow
- [ ] Test billing portal access
- [ ] Verify webhook events log correctly
- [ ] Test with multiple users simultaneously
- [ ] Verify credits deduct correctly when used
- [ ] Test credit refresh on renewal
- [ ] Verify email receipts sent by Stripe
- [ ] Test on mobile devices

---

## 🚀 Ready for Production?

When ready to go live:

1. **Switch to Stripe Live Mode**
   - Get live API keys
   - Create live products
   - Update production environment variables

2. **Set up production webhook**
   - Stripe Dashboard → Webhooks → Add endpoint
   - URL: `https://yourdomain.com/api/webhooks/stripe`

3. **Update app URL**
   - `NEXT_PUBLIC_APP_URL=https://yourdomain.com`

4. **Test with real card**
   - Do one test subscription
   - Verify everything works
   - Cancel the test subscription

---

**Need help?** Check `/STRIPE_COMPLETE_IMPLEMENTATION.md` for full documentation.
