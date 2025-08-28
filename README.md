# TaskFlow - Modern Project Management Platform

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/varun8487/taskflow)

A beautiful, modern project management application built with Morta's core stack: **Next.js 15**, **React**, **Tailwind CSS + shadcn/ui**, **Convex**, **Clerk**, and **Stripe**.

## 🚀 Live Demo

- **Live Application**: [https://taskflow-demo.vercel.app](https://taskflow-demo.vercel.app) *(to be deployed)*
- **GitHub Repository**: [https://github.com/varun8487/taskflow](https://github.com/varun8487/taskflow)

## ✨ Features

### 🎨 **Modern UI/UX**
- **Dark/Light Mode**: Seamless theme switching with system preference detection
- **Glass Morphism**: Modern glass effects and backdrop blur
- **Smooth Animations**: Framer Motion powered interactions
- **Responsive Design**: Mobile-first approach with beautiful responsive layouts
- **Gradient Aesthetics**: Professional color schemes with gradient backgrounds

### 🔐 **Authentication & Authorization**
- **Clerk Integration**: Secure authentication with social logins (Google, GitHub)
- **Role-Based Access Control (RBAC)**: Team owner, admin, and member roles
- **Protected Routes**: Middleware-based route protection
- **Session Management**: Persistent authentication state

### 💳 **Subscription & Billing**
- **Stripe Integration**: Complete payment processing lifecycle
- **Tiered Subscriptions**: Free, Starter, Pro, and Enterprise plans
- **Feature Gating**: Dynamic feature access based on subscription tier
- **Usage Limits**: Real-time tracking of plan limits and usage warnings
- **Billing Portal**: Self-service subscription management

### 🏗️ **Project Management**
- **Team Collaboration**: Create and manage teams with role-based permissions
- **Project Organization**: Unlimited projects for Pro+ users
- **Task Management**: Create, assign, and track tasks with status updates
- **File Uploads**: AWS S3 integration for document management *(optional)*
- **Analytics Dashboard**: Performance metrics and team insights *(Pro feature)*

### 📊 **Advanced Analytics** *(Pro Feature)*
- **Performance Metrics**: Task completion rates and team velocity
- **Visual Dashboards**: Charts and progress tracking
- **Team Insights**: Individual member performance analytics
- **Trend Analysis**: Weekly and monthly performance trends

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 15** (App Router, TypeScript) - React framework with server-side rendering
- **React 18** - Component-based UI library
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **Framer Motion** - Smooth animations and transitions
- **next-themes** - Dark/light mode support

### **Backend & Database**
- **Convex** - Real-time backend with type-safe APIs
- **TypeScript** - End-to-end type safety

### **Authentication**
- **Clerk** - Complete authentication solution with RBAC

### **Payments**
- **Stripe** - Payment processing and subscription management

### **File Storage** *(Optional)*
- **AWS S3** - Scalable file storage and management

### **Development & Deployment**
- **ESLint & Prettier** - Code linting and formatting
- **GitHub Actions** - CI/CD pipeline
- **Vercel** - Production deployment platform

## 🏗️ Architecture Decisions

### **1. Frontend Architecture**
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── dashboard/         # Protected dashboard pages
│   └── api/              # API routes (Stripe webhooks)
├── components/           # Reusable React components
│   ├── ui/              # shadcn/ui components
│   └── providers/       # Context providers
├── lib/                 # Utility functions and configurations
└── convex/             # Backend functions and schema
```

### **2. State Management**
- **Convex Real-time Queries**: Server state management with real-time updates
- **React Context**: Client state for theme and UI preferences
- **URL State**: Route-based state management for navigation

### **3. Authentication Strategy**
- **Clerk Provider**: Wraps the entire application for authentication context
- **Middleware Protection**: Route-level protection using Next.js middleware
- **JWT Integration**: Secure communication between Clerk and Convex

### **4. Data Layer**
- **Convex Functions**: Type-safe backend functions for all data operations
- **Real-time Subscriptions**: Live updates across all connected clients
- **Optimistic Updates**: Immediate UI feedback with server reconciliation

### **5. Styling Architecture**
- **Design System**: Consistent color palette and spacing using CSS variables
- **Component Variants**: shadcn/ui component variations for different use cases
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Theme Support**: Dynamic CSS variables for dark/light mode switching

## 🚦 Getting Started

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Git

### **1. Clone the Repository**
```bash
git clone https://github.com/varun8487/taskflow.git
cd taskflow
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Environment Setup**
Create a `.env.local` file with the following variables:

```env
# Convex (Backend)
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url

# Clerk (Authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Stripe (Payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# AWS S3 (Optional - File Uploads)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=taskflow-uploads
```

### **4. Set Up Services**

#### **Convex Setup**
```bash
npx convex dev --once --configure=new
# Follow prompts to create/connect your Convex project
npx convex deploy
```

#### **Clerk Setup**
1. Create a [Clerk application](https://dashboard.clerk.dev/)
2. Configure social login providers (Google, GitHub)
3. Add your domain to allowed origins
4. Copy API keys to `.env.local`

#### **Stripe Setup**
1. Create a [Stripe account](https://dashboard.stripe.com/)
2. Copy API keys to `.env.local`
3. Set up webhook endpoint: `https://your-domain.com/api/stripe/webhook`
4. Configure webhook events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`

### **5. Run Development Server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### **6. Docker Setup** *(Optional)*
```bash
# Development environment
npm run docker:dev

# Production environment  
npm run docker:prod
```

## 🎯 Feature Gating Implementation

### **Subscription Tiers**
| Feature | Free | Starter ($12/mo) | Pro ($29/mo) | Enterprise ($99/mo) |
|---------|------|------------------|--------------|-------------------|
| Teams | 1 | 3 | 10 | Unlimited |
| Projects | 3 | 10 | 50 | Unlimited |
| Tasks per Project | 10 | 50 | 200 | Unlimited |
| File Upload Size | 5MB | 25MB | 100MB | 500MB |
| Storage | 1GB | 10GB | 100GB | 1TB |
| Analytics | ❌ | ✅ | ✅ | ✅ |
| Priority Support | ❌ | ❌ | ✅ | ✅ |
| API Access | ❌ | ❌ | ✅ | ✅ |

### **Implementation Pattern**
```typescript
// Feature gate component usage
<FeatureGate feature="analyticsAccess" requiredTier="starter">
  <AnalyticsDashboard />
</FeatureGate>

// Usage limit checking
<UsageLimit feature="maxTeams" currentUsage={teamCount}>
  <CreateTeamButton />
</UsageLimit>
```

## 🔒 Security & Compliance

### **Authentication Security**
- **JWT Tokens**: Secure token-based authentication
- **Session Management**: Automatic token refresh and secure logout
- **CSRF Protection**: Built-in Cross-Site Request Forgery protection

### **Data Security**
- **Input Validation**: Server-side validation for all user inputs
- **SQL Injection Prevention**: Convex's built-in query protection
- **XSS Protection**: React's built-in XSS prevention

### **Payment Security**
- **PCI Compliance**: Stripe handles all payment data securely
- **Webhook Verification**: Cryptographic verification of Stripe webhooks
- **Environment Variables**: Sensitive data stored securely

## 📈 Performance Optimizations

### **Frontend Performance**
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js built-in image optimization
- **Bundle Analysis**: Webpack bundle analyzer for optimization
- **Caching**: Aggressive caching of static assets

### **Backend Performance**
- **Real-time Updates**: Convex's efficient real-time subscriptions
- **Query Optimization**: Indexed database queries for fast lookups
- **CDN Delivery**: Static assets served via Vercel's global CDN

## 🧪 Testing Strategy

### **Testing Approach** *(To be implemented)*
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API endpoint and user flow testing
- **E2E Tests**: Complete user journey testing with Playwright
- **Performance Tests**: Load testing and performance monitoring

### **Quality Assurance**
- **TypeScript**: Compile-time type checking
- **ESLint**: Code quality and consistency enforcement
- **Prettier**: Automated code formatting
- **GitHub Actions**: Automated testing and deployment

## 🚀 Deployment

### **Vercel Deployment** *(Recommended)*
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on every push to main branch

### **Manual Deployment**
```bash
npm run build
npm run start
```

### **Docker Deployment**
```bash
docker build -t taskflow .
docker run -p 3000:3000 taskflow
```

## 🔄 CI/CD Pipeline

### **GitHub Actions Workflow**
- **Linting**: ESLint and TypeScript checking
- **Building**: Production build verification
- **Testing**: Automated test execution *(when implemented)*
- **Deployment**: Automatic deployment to Vercel

### **Deployment Strategy**
- **Preview Deployments**: Every pull request gets a preview deployment
- **Production Deployment**: Main branch automatically deploys to production
- **Rollback**: Easy rollback to previous deployments via Vercel

## 🏢 Team Development Strategy

### **For Small Teams (2-5 developers)**
1. **Feature Branching**: Each feature developed in separate branches
2. **Code Reviews**: All changes require peer review via pull requests
3. **Shared Components**: Maintain a shared component library
4. **Documentation**: Keep README and inline comments up to date

### **For Medium Teams (5-15 developers)**
1. **Domain-Driven Design**: Organize features by business domains
2. **Micro-frontends**: Consider splitting by functional areas
3. **Design System**: Formal design system with Storybook
4. **Testing Strategy**: Implement comprehensive testing pipeline

### **For Large Teams (15+ developers)**
1. **Monorepo Structure**: Use tools like Nx or Turborepo
2. **Module Federation**: Independent deployment of features
3. **Dedicated QA**: Separate quality assurance team
4. **Performance Monitoring**: Real-time performance tracking

## 🔮 Scaling to Production SaaS

### **Technical Scaling**
- **Database Optimization**: Query optimization and indexing strategies
- **Caching Layer**: Redis for session and data caching
- **CDN Strategy**: Global content delivery optimization
- **Monitoring**: Application performance monitoring with Datadog/NewRelic

### **Business Scaling**
- **Analytics**: User behavior tracking with Mixpanel/Amplitude
- **Customer Support**: Integration with Intercom/Zendesk
- **Onboarding**: User onboarding flows and tutorials
- **Documentation**: Comprehensive user and developer documentation

### **Infrastructure Scaling**
- **Multi-region Deployment**: Global application deployment
- **Disaster Recovery**: Backup and recovery strategies
- **Compliance**: SOC 2, GDPR, and other compliance requirements
- **Security Audits**: Regular security assessments and penetration testing

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Workflow**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [Convex](https://convex.dev/) - Real-time backend platform
- [Clerk](https://clerk.dev/) - Complete authentication solution
- [Stripe](https://stripe.com/) - Payment processing platform
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

---

**Built with ❤️ for modern teams who value beautiful, functional software.**

For questions or support, please reach out via [GitHub Issues](https://github.com/varun8487/taskflow/issues).