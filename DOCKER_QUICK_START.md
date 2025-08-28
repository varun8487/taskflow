# 🐳 TaskFlow Docker Quick Start

Get TaskFlow running locally with all features in 5 minutes!

## ⚡ Super Quick Setup

```bash
# 1. Clone and navigate
git clone <your-repo>
cd taskflow

# 2. Setup environment
cp env.docker.template .env.docker
# Edit .env.docker with your API keys (see below)

# 3. Run everything
./docker-setup.sh

# 4. Test features
./test-features.sh
```

**Access at**: http://localhost:3000

## 🔑 Required API Keys

### 1. Convex (Database)
```bash
# Get from: https://dashboard.convex.dev
npx convex login
npx convex init
# Copy URL to .env.docker
```

### 2. Clerk (Authentication)
```bash
# Get from: https://dashboard.clerk.dev
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_[REDACTED]...
```

### 3. Stripe (Payments)
```bash
# Get from: https://dashboard.stripe.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_[REDACTED]...
```

## 🧪 Test All Features

| Feature | Test URL | Test Data |
|---------|----------|-----------|
| **App** | http://localhost:3000 | Sign up with any email |
| **Files** | http://localhost:9001 | MinIO: `minioadmin/minioadmin` |
| **Payments** | /billing | Card: `4242 4242 4242 4242` |
| **Analytics** | /analytics | Upgrade to Pro first |

## 🛠️ Quick Commands

```bash
# Start development mode
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f

# Test specific features
./test-features.sh health    # Test app health
./test-features.sh services  # Test external services
./test-features.sh all       # Test everything

# Stop everything
docker-compose down
```

## 🎯 What's Included

- ✅ **Next.js App** with hot reload
- ✅ **MinIO** (local S3) for file uploads
- ✅ **Stripe CLI** for webhook testing
- ✅ **Redis** for caching (optional)
- ✅ **MailHog** for email testing (optional)

## 🔍 Verify Everything Works

```bash
# 1. Check containers
docker-compose ps

# 2. Test application
curl http://localhost:3000/api/health

# 3. Run feature tests
./test-features.sh

# 4. Check MinIO
open http://localhost:9001
```

## 🚨 Troubleshooting

### Common Issues:

**Port already in use:**
```bash
# Check what's using port 3000
lsof -i :3000
# Change port in docker-compose.yml if needed
```

**Environment variables not loaded:**
```bash
# Verify .env.docker exists and has values
cat .env.docker
# Restart containers
docker-compose restart
```

**Stripe webhooks not working:**
```bash
# Check Stripe CLI logs
docker-compose logs stripe-cli
# Ensure STRIPE_SECRET_KEY is set
```

**File uploads failing:**
```bash
# Check MinIO is running
docker-compose logs minio
# Verify bucket exists in MinIO console
```

## 📚 Detailed Guides

- **Full Testing Guide**: [DOCKER_TESTING_GUIDE.md](DOCKER_TESTING_GUIDE.md)
- **Development Setup**: [README.md](README.md)
- **Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)

---

🎉 **You're all set!** Your TaskFlow instance is running with all features testable locally.
