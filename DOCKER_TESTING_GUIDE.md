# 🐳 TaskFlow Docker Testing Guide

Complete guide to test all TaskFlow features locally using Docker containers.

## 📋 Prerequisites

1. **Docker & Docker Compose** installed
2. **Git** for cloning the repository
3. **Node.js** (for Convex setup)
4. **Account Setup** (for full feature testing):
   - [Convex](https://dashboard.convex.dev) account
   - [Clerk](https://dashboard.clerk.dev) account  
   - [Stripe](https://dashboard.stripe.com) account (test mode)

## 🚀 Quick Start

### 1. Clone and Navigate
```bash
git clone <your-repo-url>
cd taskflow
```

### 2. Setup Environment
```bash
# Copy environment template
cp env.docker.template .env.docker

# Edit with your API keys
nano .env.docker  # or vim/code
```

### 3. Run Setup Script
```bash
./docker-setup.sh
```

The script will:
- ✅ Check Docker installation
- ✅ Setup environment variables
- ✅ Build and start all containers
- ✅ Test service connectivity
- ✅ Provide testing instructions

## 🏗️ Architecture Overview

The Docker setup includes:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   TaskFlow App  │    │     MinIO       │    │   Stripe CLI    │
│   (Next.js)     │    │   (S3 Local)    │    │  (Webhooks)     │
│   Port: 3000    │    │   Port: 9000/1  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │    Network      │
                    │  taskflow-dev   │
                    └─────────────────┘
```

## 🧪 Feature Testing Guide

### 1. 🌐 Application Access
```bash
# Main application
curl http://localhost:3000/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "services": {...}
}
```

**Web Interface**: http://localhost:3000

### 2. 🔐 Authentication Testing

#### Clerk Setup Required:
1. Create Clerk application
2. Configure redirect URLs:
   - `http://localhost:3000/dashboard`
   - `http://localhost:3000`
3. Add to `.env.docker`:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_[REDACTED]...
   ```

#### Test Steps:
1. **Sign Up**: Create new account
2. **Sign In**: Login with credentials
3. **Profile**: Access user settings
4. **Dashboard**: Verify protected route access

### 3. 💾 Database (Convex) Testing

#### Setup:
```bash
# Login to Convex
npx convex login

# Initialize project
npx convex init

# Deploy schema
npx convex deploy
```

#### Test Steps:
1. **User Creation**: Automatic on first sign-in
2. **Real-time Updates**: Open app in multiple browsers
3. **Data Persistence**: Create/edit data, refresh browser

### 4. 👥 Team Management Testing

#### Test Scenarios:
1. **Create Team**:
   ```
   Navigate to: /teams/new
   - Fill team name
   - Add description
   - Submit form
   ```

2. **Invite Members**:
   ```
   - Copy invite code
   - Share with team members
   - Test join functionality
   ```

3. **Team Limits**:
   ```
   Starter: Max 1 team
   Pro: Unlimited teams
   ```

### 5. 📊 Project & Task Testing

#### Test Project Creation:
1. Navigate to `/projects/new`
2. Create project with:
   - Name and description
   - Priority levels
   - Due dates

#### Test Task Management:
1. Create tasks within projects
2. Assign to team members
3. Update task status
4. Add comments
5. Test real-time sync

### 6. 💳 Stripe Payment Testing

#### Setup Stripe CLI:
The Docker setup automatically configures Stripe webhooks.

#### Test Payment Flow:
1. **Upgrade to Pro**:
   ```
   Navigate to: /billing
   Click "Upgrade to Pro"
   ```

2. **Test Cards**:
   ```bash
   # Success
   Card: 4242 4242 4242 4242
   Expiry: Any future date
   CVC: Any 3 digits

   # Declined
   Card: 4000 0000 0000 0002
   ```

3. **Webhook Testing**:
   ```bash
   # View Stripe CLI logs
   docker-compose logs stripe-cli

   # Should show webhook events
   ```

4. **Feature Gating**:
   - Test Pro-only features
   - Analytics access
   - File upload capability

### 7. 📁 File Upload Testing (S3/MinIO)

#### MinIO Console:
- **URL**: http://localhost:9001
- **Username**: `minioadmin`
- **Password**: `minioadmin`

#### Test File Uploads:
1. **Upgrade to Pro** (file uploads are Pro-only)
2. **Upload Files**:
   ```
   Navigate to project/task
   Drag & drop files
   Verify upload progress
   ```

3. **Verify in MinIO**:
   ```
   Check MinIO console
   Navigate to 'taskflow-files' bucket
   Verify files are stored
   ```

4. **Download Files**:
   ```
   Click download in app
   Verify presigned URL generation
   ```

### 8. 📈 Analytics Testing (Pro Feature)

#### Prerequisites:
- Pro subscription active
- Some team activity generated

#### Test Steps:
1. **Access Analytics**: `/analytics`
2. **View Metrics**:
   - Task completion rates
   - Team productivity
   - Project progress
3. **Generate Activity**:
   - Create/complete tasks
   - Refresh analytics
   - Verify real-time updates

## 🛠️ Development Commands

### Docker Management:
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Restart specific service
docker-compose restart taskflow-app

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

### Development Mode:
```bash
# Use development compose file
docker-compose -f docker-compose.dev.yml up -d

# View app logs with hot reload
docker-compose -f docker-compose.dev.yml logs -f taskflow-dev
```

### Database Operations:
```bash
# Deploy Convex schema
npx convex deploy

# View Convex dashboard
npx convex dashboard

# Clear database (development)
npx convex deploy --clear
```

## 🔍 Debugging & Troubleshooting

### Common Issues:

#### 1. **Port Conflicts**
```bash
# Check ports in use
netstat -tulpn | grep :3000

# Modify docker-compose.yml ports if needed
```

#### 2. **Environment Variables**
```bash
# Check if variables are loaded
docker-compose config

# Verify service environment
docker exec -it taskflow_taskflow-app_1 env
```

#### 3. **Service Health**
```bash
# Check all containers
docker-compose ps

# Check specific service logs
docker-compose logs stripe-cli
docker-compose logs minio
```

#### 4. **Network Issues**
```bash
# Inspect network
docker network inspect taskflow_taskflow-network

# Test connectivity between services
docker exec -it taskflow_taskflow-app_1 ping minio
```

### Health Checks:

#### Application Health:
```bash
curl -s http://localhost:3000/api/health | jq
```

#### MinIO Health:
```bash
curl -s http://localhost:9000/minio/health/live
```

#### Service Status:
```bash
docker-compose ps
```

## 📊 Testing Checklist

### ✅ Authentication & Users
- [ ] User registration
- [ ] User login/logout
- [ ] Profile management
- [ ] Route protection

### ✅ Teams & Collaboration
- [ ] Team creation
- [ ] Member invitations
- [ ] Role management
- [ ] Real-time updates

### ✅ Projects & Tasks
- [ ] Project creation/editing
- [ ] Task management
- [ ] Comments system
- [ ] Status updates

### ✅ Subscription & Billing
- [ ] Stripe checkout
- [ ] Webhook processing
- [ ] Feature gating
- [ ] Plan upgrades/downgrades

### ✅ File Management
- [ ] File uploads (Pro)
- [ ] Download functionality
- [ ] Access permissions
- [ ] Storage limits

### ✅ Analytics & Reporting
- [ ] Dashboard access (Pro)
- [ ] Metrics calculation
- [ ] Real-time updates
- [ ] Export functionality

### ✅ Performance & Security
- [ ] Load testing
- [ ] Authentication security
- [ ] API rate limiting
- [ ] Error handling

## 🚀 Production Deployment Testing

### Pre-Production Checklist:
```bash
# Build production image
docker build -t taskflow:prod .

# Test production build
docker run -p 3000:3000 taskflow:prod

# Run security scan
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  -v $(pwd):/root/.cache/ aquasec/trivy taskflow:prod
```

### Performance Testing:
```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Load test
ab -n 1000 -c 10 http://localhost:3000/

# Monitor during test
docker stats
```

## 📞 Support

If you encounter issues:

1. **Check Logs**: `docker-compose logs -f`
2. **Verify Environment**: Check `.env.docker` values
3. **Service Status**: `docker-compose ps`
4. **Network Connectivity**: Test service communication
5. **External Services**: Verify Clerk/Stripe/Convex configuration

---

🎉 **Happy Testing!** Your TaskFlow application should now be fully functional in Docker with all features testable locally.
