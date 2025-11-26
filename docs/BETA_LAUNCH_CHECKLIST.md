# 🚀 V1 Beta Launch Checklist - Tangibel (Model Car Platform)

**Last Updated**: 2025-11-24  
**Status**: Pre-Launch Preparation

---

## 📊 Current State Assessment

### ✅ **COMPLETED**
- ✅ Core authentication flow (Supabase Auth)
- ✅ User profiles and credits system
- ✅ AI image generation (Gemini API)
- ✅ Image-to-3D pipeline (Meshy API)
- ✅ 3D model viewer (Babylon.js)
- ✅ Stripe payment integration (code complete)
- ✅ Security audit (all critical issues fixed)
- ✅ Database schema and RLS policies
- ✅ Protected routes with middleware
- ✅ User garage/library page
- ✅ Dashboard with stats
- ✅ Responsive UI design

---

## 🔴 CRITICAL - Must Complete Before Launch

### 1. **Stripe Payment Setup** ⏳
**Status**: Code ready, configuration needed  
**Time**: 1-2 hours

- [ ] **Run Supabase migration** for Stripe columns
  ```bash
  # Location: /supabase/migrations/add_stripe_subscription_columns.sql
  ```
- [ ] **Create Stripe account** (if not exists)
- [ ] **Get test API keys** from Stripe Dashboard
- [ ] **Add keys to `.env.production`**:
  ```bash
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
  STRIPE_SECRET_KEY=sk_test_xxx
  ```
- [ ] **Create 3 products in Stripe**:
  - Garage Parking ($9/month, $87/year)
  - Showroom Floor ($29/month, $278/year)
  - Dealership ($49/month, $470/year)
- [ ] **Copy price IDs** to `.env.production`
- [ ] **Set up webhook endpoint**:
  - For testing: Use Stripe CLI (`stripe listen --forward-to localhost:3000/api/webhooks/stripe`)
  - For production: Add webhook in Stripe Dashboard → `https://yourdomain.com/api/webhooks/stripe`
- [ ] **Test complete subscription flow**:
  - Sign up → Subscribe → Verify credits → Cancel

**Reference**: `/docs/STRIPE_SETUP_GUIDE.md`

---

### 2. **Environment Variables Validation** ⏳
**Time**: 30 minutes

- [ ] **Verify `.env.production` has all required keys**:
  ```bash
  # Backend
  NEXT_PUBLIC_BACKEND_URL=https://atelier-backend-362062855771.us-central1.run.app
  
  # Supabase (PRODUCTION keys)
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  
  # Stripe (TEST mode for beta)
  STRIPE_SECRET_KEY=sk_test_xxx
  STRIPE_WEBHOOK_SECRET=whsec_xxx
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
  STRIPE_GARAGE_MONTHLY_PRICE_ID=price_xxx
  STRIPE_GARAGE_YEARLY_PRICE_ID=price_xxx
  STRIPE_SHOWROOM_MONTHLY_PRICE_ID=price_xxx
  STRIPE_SHOWROOM_YEARLY_PRICE_ID=price_xxx
  STRIPE_DEALERSHIP_MONTHLY_PRICE_ID=price_xxx
  STRIPE_DEALERSHIP_YEARLY_PRICE_ID=price_xxx
  
  # AI APIs
  GEMINI_API_KEY=
  MESHY_API_KEY=
  
  # App Config
  NEXT_PUBLIC_SITE_URL=https://yourdomain.com
  NEXT_PUBLIC_APP_URL=https://yourdomain.com
  NODE_ENV=production
  ```

- [ ] **Remove placeholder values** (all `your-xxx-here` strings)
- [ ] **Verify no keys are exposed** in client-side code
- [ ] **Test build with production env**: `npm run build`

---

### 3. **Backend API Configuration** ⏳
**Time**: 1 hour

- [ ] **Verify backend URL** is accessible:
  ```bash
  NEXT_PUBLIC_BACKEND_URL=https://atelier-backend-362062855771.us-central1.run.app
  ```
- [ ] **Test all API endpoints**:
  - [ ] `/api/generate-image` (Gemini integration)
  - [ ] `/api/segment` (SAM segmentation)
  - [ ] `/api/generate-3d` (Meshy integration)
  - [ ] `/api/segment-3d` (3D segmentation)
  - [ ] `/api/sketch-to-render` (Sketch conversion)
  - [ ] `/api/create-checkout` (Stripe checkout)
  - [ ] `/api/webhooks/stripe` (Stripe webhooks)

- [ ] **Implement missing features**:
  - [ ] 3D segmentation API (currently has TODO placeholder)
  - [ ] File size tracking for models
  - [ ] Polygon count for 3D models

**Current TODOs in code**:
```typescript
// /app/api/segment-3d/route.ts:24
// TODO: Replace with actual AI model integration

// /app/garage/page.tsx:70
file_size: '-', // TODO: Add file size to assets

// /app/garage/page.tsx:72
polygons: '-', // TODO: Add polygon count
```

---

### 4. **Testing & Quality Assurance** ⏳
**Time**: 3-4 hours

#### **A. User Flow Testing**
- [ ] **New user onboarding**:
  - [ ] Sign up with email/password
  - [ ] Email verification (if enabled)
  - [ ] Initial credits granted (10 free)
  - [ ] Redirected to dashboard
  
- [ ] **Image generation flow**:
  - [ ] Text-to-image via Gemini
  - [ ] Image saves to user_assets
  - [ ] Credits deducted correctly
  - [ ] Thumbnail generated
  
- [ ] **3D conversion flow**:
  - [ ] Image-to-3D via Meshy
  - [ ] 3D model viewable in Babylon.js
  - [ ] Model saves to garage
  - [ ] Download works (GLB, FBX, OBJ formats)
  
- [ ] **Subscription flow**:
  - [ ] User can view pricing page
  - [ ] Subscribe button redirects to Stripe
  - [ ] Payment processes successfully
  - [ ] Credits update after payment
  - [ ] Subscription shows in profile
  - [ ] Billing portal accessible
  
- [ ] **Garage/Library**:
  - [ ] All user models display
  - [ ] Grid/list view toggle works
  - [ ] Delete model works
  - [ ] Download model works
  - [ ] Preview model works

#### **B. Error Handling**
- [ ] **Test edge cases**:
  - [ ] Insufficient credits → Show upgrade modal
  - [ ] API failure → Show error toast, don't deduct credits
  - [ ] Invalid image upload → Clear error message
  - [ ] Network timeout → Retry mechanism or clear message
  - [ ] Concurrent generations → Queue or limit

#### **C. Performance Testing**
- [ ] **Page load times**:
  - [ ] Homepage < 2s
  - [ ] Dashboard < 3s
  - [ ] Studio < 4s (3D assets are heavy)
  - [ ] Garage < 2s
  
- [ ] **3D Model Loading**:
  - [ ] Large models (>10MB) load without crashing
  - [ ] Viewer controls responsive
  - [ ] Memory doesn't leak on repeated loads

#### **D. Mobile Responsiveness**
- [ ] Test on mobile devices (iOS/Android)
- [ ] Test on tablets
- [ ] Navigation works on touch devices
- [ ] 3D viewer works on mobile (may need optimization)

---

## 🟡 HIGH PRIORITY - Should Complete Before Launch

### 5. **Production Deployment** ⏳
**Time**: 2-3 hours

- [ ] **Choose hosting platform**:
  - Recommended: Vercel (native Next.js support)
  - Alternative: Railway, Render, AWS

- [ ] **Deploy to production**:
  - [ ] Connect GitHub repository
  - [ ] Set environment variables in platform dashboard
  - [ ] Configure custom domain (if ready)
  - [ ] Enable automatic deployments
  
- [ ] **Verify deployment**:
  - [ ] All pages load correctly
  - [ ] API routes work
  - [ ] Supabase connection successful
  - [ ] Stripe webhooks receive events

- [ ] **Set up monitoring**:
  - [ ] Vercel Analytics (included)
  - [ ] PostHog analytics (already integrated)
  - [ ] Sentry or similar for error tracking
  - [ ] Supabase Dashboard → Logs

---

### 6. **Security Hardening** ⏳
**Time**: 1 hour

- [ ] **Verify security audit compliance**:
  - ✅ No API keys exposed client-side
  - ✅ No console.logs with user data
  - ✅ All API routes use server-side keys
  - ✅ RLS enabled on all Supabase tables
  - [ ] Rate limiting on API routes (add if needed)
  - [ ] CORS properly configured
  
- [ ] **Add security headers** in `next.config.js`:
  ```javascript
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
      ],
    }]
  }
  ```

- [ ] **Test authentication edge cases**:
  - [ ] Expired session redirects to sign-in
  - [ ] Invalid tokens handled gracefully
  - [ ] Protected routes block unauthenticated users

---

### 7. **User Experience Polish** ⏳
**Time**: 2-3 hours

- [ ] **Loading states**:
  - [ ] All buttons show loading spinner when processing
  - [ ] Image generation shows progress indicator
  - [ ] 3D conversion shows status updates
  
- [ ] **Error messages**:
  - [ ] User-friendly (not technical)
  - [ ] Actionable (tell user what to do)
  - [ ] Consistent toast notifications
  
- [ ] **Empty states**:
  - [ ] Dashboard when no models: "Generate your first model"
  - [ ] Garage when empty: "Your garage is empty"
  - [ ] No credits left: Clear CTA to upgrade
  
- [ ] **Onboarding**:
  - [ ] Welcome message on first login
  - [ ] Quick tour of features (optional)
  - [ ] Sample prompt suggestions
  
- [ ] **Tooltips & Help**:
  - [ ] Explain what each feature does
  - [ ] Link to documentation/FAQ
  - [ ] Keyboard shortcuts documented

---

### 8. **Content & Copy** ⏳
**Time**: 1 hour

- [ ] **Homepage**:
  - [ ] Clear value proposition
  - [ ] Feature highlights
  - [ ] CTA to sign up
  
- [ ] **Pricing page**:
  - [ ] Tier benefits clearly listed
  - [ ] Pricing accurate and current
  - [ ] FAQ section
  
- [ ] **Legal pages**:
  - [ ] Terms of Service
  - [ ] Privacy Policy
  - [ ] Cookie Policy (if using cookies for analytics)
  
- [ ] **Email templates**:
  - [ ] Welcome email
  - [ ] Email verification
  - [ ] Password reset
  - [ ] Subscription confirmation
  - [ ] Payment receipt

---

## 🟢 NICE TO HAVE - Can Wait Until After Launch

### 9. **Advanced Features** 📌
- [ ] **Model versioning** (save iterations)
- [ ] **Favorites/Collections** (organize models)
- [ ] **Share models** (public links)
- [ ] **Collaboration** (team workspaces)
- [ ] **Advanced export options** (more formats)
- [ ] **Model editing** (colors, materials)
- [ ] **Batch processing** (generate multiple)
- [ ] **API access** (for developers)

### 10. **Analytics & Insights** 📌
- [ ] **User dashboard analytics**:
  - [ ] Total generations
  - [ ] Most popular prompts
  - [ ] Credits usage over time
  
- [ ] **Admin dashboard**:
  - [ ] Total users
  - [ ] Active subscriptions
  - [ ] Revenue metrics
  - [ ] Popular features
  - [ ] Error rates

### 11. **Marketing Prep** 📌
- [ ] **Landing page optimization** (A/B test headlines)
- [ ] **SEO setup** (meta tags, sitemap, robots.txt)
- [ ] **Social media assets** (screenshots, demo video)
- [ ] **Beta tester outreach** (Product Hunt, Reddit, Twitter)
- [ ] **Feedback collection** (in-app survey, email)

---

## 📝 Pre-Launch Checklist Summary

### **Critical Path (Must Do)**
1. ⏳ Stripe setup & testing (2 hours)
2. ⏳ Environment variables validation (30 min)
3. ⏳ Backend API verification (1 hour)
4. ⏳ End-to-end testing (3 hours)
5. ⏳ Production deployment (2 hours)

**Total Time**: ~8-9 hours

### **High Priority (Should Do)**
6. ⏳ Security hardening (1 hour)
7. ⏳ UX polish (2 hours)
8. ⏳ Content & copy (1 hour)

**Total Time**: ~4 hours

---

## 🎯 Beta Launch Strategy

### **Phase 1: Soft Launch** (Week 1)
- Launch to small group (10-20 beta testers)
- Collect feedback intensively
- Fix critical bugs immediately
- Iterate on UX pain points

### **Phase 2: Controlled Beta** (Week 2-3)
- Invite 50-100 users
- Monitor performance and costs
- Add features based on feedback
- Optimize conversion funnel

### **Phase 3: Public Beta** (Week 4+)
- Open to anyone with sign-up
- Marketing push (Product Hunt, social media)
- Press outreach
- Referral program

---

## 🚨 Launch Day Checklist

**Morning of Launch**:
- [ ] Run final production build test
- [ ] Verify all environment variables set
- [ ] Test sign-up flow end-to-end
- [ ] Check Stripe webhooks working
- [ ] Verify email sending works
- [ ] Monitor Supabase dashboard
- [ ] Monitor Stripe dashboard
- [ ] Set up error alerts (Sentry/email)

**During Launch**:
- [ ] Monitor server logs in real-time
- [ ] Watch for error spikes
- [ ] Respond to user feedback quickly
- [ ] Fix critical bugs immediately
- [ ] Celebrate! 🎉

**First 24 Hours**:
- [ ] Review analytics
- [ ] Collect initial user feedback
- [ ] Identify top 3 issues
- [ ] Plan immediate fixes
- [ ] Send thank you to beta testers

---

## 📞 Support & Monitoring

### **Tools to Monitor**
1. **Vercel Dashboard** → Deployments, analytics, logs
2. **Supabase Dashboard** → Database queries, auth, storage
3. **Stripe Dashboard** → Payments, subscriptions, webhooks
4. **PostHog** → User analytics, funnels
5. **Email** → User support requests

### **Key Metrics to Track**
- Sign-ups per day
- Conversion rate (sign-up → paid)
- Credits usage patterns
- Average models per user
- Churn rate
- Error rates by endpoint
- Page load times

---

## ✅ Definition of "Beta Ready"

Your platform is ready for beta users when:

1. ✅ A new user can sign up, generate an image, convert to 3D, and download
2. ✅ Payment flow works end-to-end (subscribe → credits update → can generate)
3. ✅ No critical security vulnerabilities
4. ✅ Error handling prevents crashes
5. ✅ Mobile experience is usable (even if not perfect)
6. ✅ You can monitor and respond to issues quickly

---

## 🎉 You're Almost There!

**Current Status**: ~80% complete

**To reach beta launch**:
- Complete Stripe setup (~2 hours)
- Run comprehensive tests (~3 hours)
- Deploy to production (~2 hours)
- **Total**: ~7 hours of focused work

**Recommendation**: 
Block out 1 full day (8 hours) to complete critical items 1-5, then launch to 10 beta testers. Get feedback, iterate for a week, then expand to 100 users.

---

**Questions? Issues? Check**:
- `/docs/STRIPE_SETUP_GUIDE.md` - Payment setup
- `/docs/SUPABASE_SETUP.md` - Database config
- `/SECURITY_AUDIT.md` - Security checklist
- `/docs/ARCHITECTURE.md` - System overview

**Good luck with your launch! 🚀**
