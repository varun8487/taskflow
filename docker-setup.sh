#!/bin/bash

# TaskFlow Docker Setup Script
set -e

echo "🚀 TaskFlow Docker Setup"
echo "========================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

print_success "Docker and Docker Compose are available"

# Check for environment file
if [ ! -f ".env.docker" ]; then
    print_warning ".env.docker file not found"
    if [ -f "env.docker.template" ]; then
        print_status "Copying template to .env.docker"
        cp env.docker.template .env.docker
        print_warning "Please edit .env.docker with your actual API keys before proceeding"
        echo
        echo "Required setup:"
        echo "1. Create a Convex project at https://dashboard.convex.dev"
        echo "2. Create a Clerk app at https://dashboard.clerk.dev"
        echo "3. Get Stripe test keys from https://dashboard.stripe.com"
        echo "4. Update .env.docker with your keys"
        echo
        read -p "Press Enter after updating .env.docker..."
    else
        print_error "env.docker.template not found. Please create .env.docker manually."
        exit 1
    fi
fi

# Source environment variables
if [ -f ".env.docker" ]; then
    export $(cat .env.docker | grep -v '^#' | xargs)
fi

# Function to setup services
setup_services() {
    local mode=$1
    
    print_status "Setting up TaskFlow in $mode mode..."
    
    if [ "$mode" = "development" ]; then
        # Development mode with hot reload
        print_status "Starting development environment..."
        docker-compose -f docker-compose.dev.yml up -d --build
    else
        # Production mode
        print_status "Starting production environment..."
        docker-compose up -d --build
    fi
    
    print_status "Waiting for services to start..."
    sleep 10
    
    # Check if services are running
    if [ "$mode" = "development" ]; then
        if docker-compose -f docker-compose.dev.yml ps | grep -q "Up"; then
            print_success "Services are running"
        else
            print_error "Some services failed to start"
            docker-compose -f docker-compose.dev.yml logs
            exit 1
        fi
    else
        if docker-compose ps | grep -q "Up"; then
            print_success "Services are running"
        else
            print_error "Some services failed to start"
            docker-compose logs
            exit 1
        fi
    fi
}

# Function to test features
test_features() {
    print_status "Testing TaskFlow features..."
    
    # Test if app is accessible
    print_status "Testing app accessibility..."
    if curl -s http://localhost:3000/api/health > /dev/null; then
        print_success "✅ App is accessible at http://localhost:3000"
    else
        print_error "❌ App is not accessible"
    fi
    
    # Test MinIO
    print_status "Testing MinIO (S3 alternative)..."
    if curl -s http://localhost:9001 > /dev/null; then
        print_success "✅ MinIO console accessible at http://localhost:9001"
        print_status "   Username: minioadmin, Password: minioadmin"
    else
        print_warning "❌ MinIO console not accessible"
    fi
    
    # Test if Stripe CLI is running (if configured)
    if [ -n "$STRIPE_SECRET_KEY" ]; then
        print_status "Testing Stripe webhook forwarding..."
        if docker-compose logs stripe-cli | grep -q "webhook endpoint"; then
            print_success "✅ Stripe webhook forwarding is active"
        else
            print_warning "⚠️  Stripe webhook forwarding may not be working"
        fi
    else
        print_warning "⚠️  Stripe not configured (STRIPE_SECRET_KEY missing)"
    fi
}

# Function to show testing instructions
show_testing_guide() {
    echo
    echo "🧪 TESTING GUIDE"
    echo "================"
    echo
    echo "1. 🌐 Open the application:"
    echo "   → http://localhost:3000"
    echo
    echo "2. 🔐 Test Authentication:"
    echo "   → Sign up with a test email"
    echo "   → Verify the auth flow works"
    echo
    echo "3. 👥 Test Team Features:"
    echo "   → Create a team"
    echo "   → Generate invite codes"
    echo "   → Test team collaboration"
    echo
    echo "4. 📊 Test Projects & Tasks:"
    echo "   → Create projects"
    echo "   → Add tasks with priorities"
    echo "   → Test real-time updates"
    echo
    echo "5. 💳 Test Subscription (Stripe):"
    echo "   → Try to upgrade to Pro"
    echo "   → Use test card: 4242 4242 4242 4242"
    echo "   → Check webhook processing"
    echo
    echo "6. 📁 Test File Uploads (Pro feature):"
    echo "   → Upload files after Pro upgrade"
    echo "   → Check MinIO console: http://localhost:9001"
    echo
    echo "7. 📈 Test Analytics (Pro feature):"
    echo "   → Access analytics dashboard"
    echo "   → Check productivity metrics"
    echo
    echo "🛠️  USEFUL COMMANDS"
    echo "==================="
    echo "• View logs: docker-compose logs -f"
    echo "• Restart services: docker-compose restart"
    echo "• Stop services: docker-compose down"
    echo "• View MinIO: http://localhost:9001 (minioadmin/minioadmin)"
    echo "• Test webhooks: Check Stripe CLI logs"
    echo
}

# Function to setup Convex
setup_convex() {
    print_status "Setting up Convex..."
    
    if [ -z "$CONVEX_DEPLOYMENT" ] || [ -z "$NEXT_PUBLIC_CONVEX_URL" ]; then
        print_warning "Convex not configured. Manual setup required:"
        echo "1. Run: npx convex login"
        echo "2. Run: npx convex init"
        echo "3. Run: npx convex deploy"
        echo "4. Update .env.docker with Convex URL"
        return
    fi
    
    print_status "Convex appears to be configured"
    
    # Check if convex directory exists
    if [ -d "convex" ]; then
        print_status "Convex schema found. Deploying..."
        if command -v npx &> /dev/null; then
            npx convex deploy || print_warning "Convex deploy failed. Please run manually."
        else
            print_warning "npx not found. Please deploy Convex manually."
        fi
    fi
}

# Main execution
main() {
    echo
    print_status "Choose setup mode:"
    echo "1. Development (with hot reload)"
    echo "2. Production (optimized build)"
    echo
    read -p "Enter choice (1 or 2): " choice
    
    case $choice in
        1)
            setup_convex
            setup_services "development"
            ;;
        2)
            setup_convex
            setup_services "production"
            ;;
        *)
            print_error "Invalid choice. Exiting."
            exit 1
            ;;
    esac
    
    test_features
    show_testing_guide
    
    print_success "🎉 TaskFlow setup complete!"
    print_status "Access your application at: http://localhost:3000"
}

# Run main function
main
