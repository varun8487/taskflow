# TaskFlow Deployment Guide

This guide walks you through deploying TaskFlow to production using Vercel, Convex, Clerk, and Stripe.

## Prerequisites

- GitHub account
- Vercel account
- Convex account
- Clerk account  
- Stripe account
- AWS account (for S3 file storage)

## 1. Convex Setup

1. **Install Convex CLI**:
   ```bash
   npm install -g convex
   ```

2. **Initialize Convex**:
   ```bash
   npx convex deploy --once --configure=new
   ```

3. **Get your Convex URL**:
   - Copy the deployment URL shown after deployment
   - Save for environment variables

## 2. Clerk Setup

1. **Create Clerk Application**:
   - Go to [Clerk Dashboard](https://dashboard.clerk.dev/)
   - Create new application
   - Choose authentication methods (Email, Google, GitHub, etc.)

2. **Configure Domains**:
   - Add your production domain to allowed origins
   - Configure redirect URLs

3. **Get API Keys**:
   - Copy publishable key and secret key
   - Save for environment variables

## 3. Stripe Setup

1. **Create Stripe Account**:
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/)
   - Complete account setup

2. **Create Products and Prices**:
   ```bash
   # Create products for each subscription tier
   # Starter - $12/month
   # Pro - $29/month  
   # Enterprise - $99/month
   ```

3. **Configure Webhooks**:
   - Add webhook endpoint: `https://your-domain.com/api/stripe/webhook`
   - Enable events:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

4. **Get API Keys**:
   - Copy publishable key, secret key, and webhook secret

## 4. AWS S3 Setup

1. **Create S3 Bucket**:
   ```bash
   aws s3 mb s3://taskflow-production-uploads
   ```

2. **Configure CORS**:
   ```json
   {
     "CORSRules": [
       {
         "AllowedOrigins": ["https://your-domain.com"],
         "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
         "AllowedHeaders": ["*"]
       }
     ]
   }
   ```

3. **Create IAM User**:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject"
         ],
         "Resource": "arn:aws:s3:::taskflow-production-uploads/*"
       }
     ]
   }
   ```

## 5. Vercel Deployment

1. **Connect GitHub Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import your GitHub repository

2. **Configure Environment Variables**:
   ```bash
   # Convex
   NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
   CONVEX_DEPLOY_KEY=your_convex_deploy_key

   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
   CLERK_SECRET_KEY=sk_live_xxx

   # Stripe  
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
   STRIPE_SECRET_KEY=sk_live_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx

   # AWS S3
   AWS_ACCESS_KEY_ID=XXX
   AWS_SECRET_ACCESS_KEY=XXX+ENvyp
   AWS_REGION=us-east-1
   AWS_S3_BUCKET_NAME=taskflow-production-uploads

   # App Configuration
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   NODE_ENV=production
   ```

3. **Deploy**:
   - Push to main branch
   - Vercel will automatically deploy

## 6. Post-Deployment Configuration

1. **Update Stripe Webhook URL**:
   - Update webhook URL in Stripe dashboard to your production domain

2. **Update Clerk Domains**:
   - Add production domain to Clerk allowed origins

3. **Test Payment Flow**:
   - Test subscription creation and cancellation
   - Verify webhooks are working

4. **Monitor Logs**:
   - Check Vercel function logs
   - Monitor Convex dashboard
   - Check Stripe webhook delivery

## 7. Custom Domain (Optional)

1. **Add Custom Domain in Vercel**:
   - Go to project settings → Domains
   - Add your custom domain

2. **Configure DNS**:
   - Add CNAME record pointing to Vercel

3. **Update Environment Variables**:
   - Update `NEXT_PUBLIC_APP_URL` to your custom domain
   - Update Clerk and Stripe configurations

## 8. Security Checklist

- [ ] Environment variables are set correctly
- [ ] Webhook secrets are configured
- [ ] CORS is properly configured for S3
- [ ] Clerk domains are whitelisted
- [ ] Stripe is in live mode
- [ ] Rate limiting is enabled (if needed)

## 9. Monitoring & Maintenance

1. **Set up monitoring**:
   - Vercel Analytics
   - Stripe Dashboard monitoring
   - Convex Dashboard monitoring

2. **Regular backups**:
   - Convex automatically backs up data
   - Monitor storage usage

3. **Updates**:
   - Keep dependencies updated
   - Monitor security advisories

## Troubleshooting

### Common Issues

1. **Convex Connection Failed**:
   - Check `NEXT_PUBLIC_CONVEX_URL` is correct
   - Verify Convex deployment is active

2. **Clerk Authentication Not Working**:
   - Verify publishable key is correct
   - Check domain is added to allowed origins

3. **Stripe Webhooks Failing**:
   - Check webhook secret is correct
   - Verify endpoint URL is accessible
   - Check webhook delivery in Stripe dashboard

4. **File Upload Issues**:
   - Verify S3 bucket permissions
   - Check CORS configuration
   - Verify AWS credentials

### Support

- Convex: [docs.convex.dev](https://docs.convex.dev)
- Clerk: [clerk.com/docs](https://clerk.com/docs)
- Stripe: [stripe.com/docs](https://stripe.com/docs)
- Vercel: [vercel.com/docs](https://vercel.com/docs)

---

**🎉 Congratulations!** Your TaskFlow application is now deployed and ready for production use.
