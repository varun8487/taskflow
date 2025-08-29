## TaskFlow

A modern, elegant project management app with authentication, teams, projects, billing, and analytics.

### Features
- Authentication (Clerk) with protected routes
- Teams, projects, and task management
- Stripe subscriptions (free, starter, pro, enterprise)
- Usage limits and feature gating per tier
- Responsive, professional UI with animations
- Optional S3 file uploads

### Tech Stack
- Next.js 15 (App Router) · React 19 · TypeScript
- Tailwind CSS v4 · shadcn/ui · Framer Motion · next-themes
- Convex (backend) · Clerk (auth) · Stripe (billing)

### Quick Start
1) Install
```bash
npm install
```

2) Environment (.env.local)
```env
# Convex
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional: AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=taskflow-uploads
```

3) Run
```bash
npm run dev
# http://localhost:3000
```

### Scripts
```bash
npm run dev        # start dev server
npm run build      # production build
npm run start      # start production server
npm run lint       # run eslint
npm run test       # unit tests (jest)
npm run test:e2e   # e2e tests (playwright)
npm run docker:dev   # docker dev compose
npm run docker:prod  # docker prod compose
npm run docker:test  # run feature tests (test-features.sh)
npm run docker:setup # one-time docker setup (docker-setup.sh)
```

### Deployment
- Recommended: Vercel (set env vars, connect repo, deploy on push)
- Manual: `npm run build && npm run start`

### License
MIT