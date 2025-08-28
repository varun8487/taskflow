# TaskFlow Deployment Guide 🚀

This guide walks you through deploying TaskFlow to production using Vercel and setting up all required services.

## Prerequisites

Before deploying, ensure you have accounts and access to:
- [Vercel](https://vercel.com) account
- [Convex](https://convex.dev) account  
- [Clerk](https://clerk.dev) account
- [Stripe](https://stripe.com) account
- [AWS](https://aws.amazon.com) account (for S3)

## Step 1: Convex Setup

1. **Create Convex Project**:
   ```bash
   npx convex login
   npx convex init
   ```

2. **Deploy Database Schema**:
   ```bash
   npx convex deploy
   ```

3. **Get Deployment URL**:
   - Copy the Convex deployment URL from the dashboard
   - Save for environment variables

## Step 2: Clerk Authentication Setup

1. **Create Clerk Application**:
   - Go to [Clerk Dashboard](https://dashboard.clerk.dev)
   - Create new application
   - Choose authentication methods (email, Google, GitHub, etc.)

2. **Configure Domains**:
   - Add your production domain to allowed origins
   - Configure redirect URLs for sign-in/sign-up

3. **Get API Keys**:
   - Copy Publishable Key and Secret Key
   - Save for environment variables

## Step 3: Stripe Payment Setup

1. **Create Stripe Account**:
   - Set up your Stripe account at [stripe.com](https://stripe.com)
   - Complete account verification

2. **Create Products**:
   ```bash
   # Using Stripe CLI (optional)
   stripe products create --name "TaskFlow Pro" --description "Pro subscription plan"
   stripe prices create --product prod_xxx --unit-amount 1900 --currency usd --recurring interval=month
   ```

3. **Set up Webhooks**:
   - Create webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
   - Copy webhook secret

4. **Get API Keys**:
   - Copy Publishable Key and Secret Key
   - Save webhook secret

## Step 4: AWS S3 Setup (Optional - Pro Features)

1. **Create S3 Bucket**:
   ```bash
   aws s3 mb s3://your-taskflow-bucket
   ```

2. **Configure CORS**:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["PUT", "POST", "DELETE", "GET"],
       "AllowedOrigins": ["https://yourdomain.com"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```

3. **Create IAM User**:
   - Create user with S3 permissions
   - Generate access keys
   - Save keys for environment variables

## Step 5: Vercel Deployment

1. **Connect Repository**:
   - Import your GitHub repository to Vercel
   - Select the root directory

2. **Configure Environment Variables**:
   ```env
   # Convex
   CONVEX_DEPLOYMENT=your-deployment-name
   NEXT_PUBLIC_CONVEX_URL=https://your-convex-url.convex.cloud

   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_SECRET_KEY=sk_live_...

   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...

   # AWS S3 (Optional)
   AWS_ACCESS_KEY_ID=AKIA...
   AWS_SECRET_ACCESS_KEY=...
   AWS_REGION=us-east-1
   AWS_S3_BUCKET_NAME=your-taskflow-bucket
   NEXT_PUBLIC_AWS_S3_BUCKET_NAME=your-taskflow-bucket
   NEXT_PUBLIC_AWS_REGION=us-east-1
   ```

3. **Deploy**:
   - Trigger deployment from Vercel dashboard
   - Monitor build logs for any issues

## Step 6: Post-Deployment Configuration

1. **Update Clerk Settings**:
   - Add production domain to Clerk settings
   - Update redirect URLs

2. **Test Stripe Integration**:
   - Create test subscription
   - Verify webhook delivery
   - Test customer portal

3. **Verify S3 Integration**:
   - Test file uploads (Pro users)
   - Verify access permissions

## Step 7: Domain Setup

1. **Custom Domain** (Optional):
   - Add custom domain in Vercel
   - Configure DNS records
   - Set up SSL certificate

2. **Update Service Configurations**:
   - Update Clerk with new domain
   - Update Stripe webhook URLs
   - Update S3 CORS settings

## Production Checklist ✅

### Pre-Launch
- [ ] All environment variables configured
- [ ] Database schema deployed
- [ ] Authentication working
- [ ] Payment processing tested
- [ ] File uploads tested (Pro)
- [ ] Error monitoring set up
- [ ] Analytics configured

### Launch
- [ ] DNS configured
- [ ] SSL certificate active  
- [ ] Performance monitoring enabled
- [ ] Backup strategies in place
- [ ] Team access configured

### Post-Launch
- [ ] Monitor error rates
- [ ] Check payment webhooks
- [ ] Verify user registrations
- [ ] Monitor performance metrics
- [ ] Set up alerting

## Monitoring & Maintenance

### Vercel Analytics
- Enable Vercel Analytics for performance monitoring
- Set up custom events for business metrics

### Error Tracking
```bash
npm install @sentry/nextjs
```

### Uptime Monitoring
- Set up uptime monitoring (Pingdom, UptimeRobot)
- Monitor `/api/health` endpoint

### Database Monitoring
- Monitor Convex dashboard for performance
- Set up alerts for query performance

## Scaling Considerations

### Performance Optimization
- Enable Vercel Edge Functions
- Implement image optimization
- Add Redis caching for sessions

### Cost Optimization
- Monitor Convex usage
- Optimize S3 lifecycle policies
- Review Stripe transaction fees

### Security
- Regular security audits
- Dependency updates via Dependabot
- Monitor for vulnerabilities

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check environment variables
   - Verify TypeScript compilation
   - Review dependency versions

2. **Authentication Issues**:
   - Verify Clerk domain configuration
   - Check redirect URLs
   - Validate API keys

3. **Payment Issues**:
   - Verify Stripe webhook configuration
   - Check webhook secret
   - Monitor Stripe dashboard

4. **File Upload Issues**:
   - Verify S3 bucket permissions
   - Check CORS configuration
   - Validate AWS credentials

### Support Resources
- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- Convex Documentation: [docs.convex.dev](https://docs.convex.dev)
- Clerk Documentation: [clerk.dev/docs](https://clerk.dev/docs)
- Stripe Documentation: [stripe.com/docs](https://stripe.com/docs)

---

🎉 **Congratulations!** Your TaskFlow application is now live and ready for users!
