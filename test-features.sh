#!/bin/bash

# TaskFlow Feature Testing Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${PURPLE}=== $1 ===${NC}"
}

print_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✅ PASS]${NC} $1"
}

print_fail() {
    echo -e "${RED}[❌ FAIL]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠️  WARN]${NC} $1"
}

# Base URL for testing
BASE_URL="http://localhost:3000"

# Test application health
test_app_health() {
    print_header "Application Health Check"
    
    print_test "Testing API health endpoint..."
    if response=$(curl -s "$BASE_URL/api/health"); then
        if echo "$response" | grep -q "healthy"; then
            print_success "Health endpoint responds correctly"
            echo "Response: $response"
        else
            print_fail "Health endpoint response invalid"
            echo "Response: $response"
        fi
    else
        print_fail "Health endpoint unreachable"
    fi
    echo
}

# Test external services
test_services() {
    print_header "External Services Check"
    
    # Test MinIO
    print_test "Testing MinIO (S3 local)..."
    if curl -s http://localhost:9001 > /dev/null; then
        print_success "MinIO console accessible at http://localhost:9001"
    else
        print_fail "MinIO console not accessible"
    fi
    
    # Test MinIO API
    print_test "Testing MinIO API..."
    if curl -s http://localhost:9000/minio/health/live > /dev/null; then
        print_success "MinIO API is healthy"
    else
        print_warning "MinIO API health check failed"
    fi
    
    # Check if bucket exists
    print_test "Checking taskflow-files bucket..."
    # This would require AWS CLI configured with MinIO, skipping for now
    print_warning "Bucket check requires manual verification in MinIO console"
    
    echo
}

# Test API endpoints
test_api_endpoints() {
    print_header "API Endpoints Test"
    
    # Test health endpoint
    print_test "GET /api/health"
    if curl -s "$BASE_URL/api/health" | grep -q "healthy"; then
        print_success "Health endpoint working"
    else
        print_fail "Health endpoint failed"
    fi
    
    # Test Stripe webhook endpoint (should require POST)
    print_test "POST /api/stripe/webhook (should reject GET)"
    if response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/stripe/webhook"); then
        if [ "$response" = "405" ] || [ "$response" = "400" ]; then
            print_success "Stripe webhook endpoint properly rejects GET requests"
        else
            print_warning "Stripe webhook endpoint response: $response"
        fi
    else
        print_fail "Stripe webhook endpoint unreachable"
    fi
    
    echo
}

# Test page accessibility
test_pages() {
    print_header "Page Accessibility Test"
    
    pages=(
        "/" 
        "/sign-in"
        "/sign-up"
        "/dashboard"
        "/teams"
        "/billing"
        "/settings"
        "/analytics"
    )
    
    for page in "${pages[@]}"; do
        print_test "Testing page: $page"
        response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$page")
        
        case $response in
            200)
                print_success "Page accessible: $page"
                ;;
            302|307)
                print_success "Page redirects (likely auth protected): $page"
                ;;
            404)
                print_fail "Page not found: $page"
                ;;
            500)
                print_fail "Server error on page: $page"
                ;;
            *)
                print_warning "Unexpected response ($response) for page: $page"
                ;;
        esac
    done
    echo
}

# Test Docker services
test_docker_services() {
    print_header "Docker Services Status"
    
    # Check if docker-compose is running
    if command -v docker-compose &> /dev/null; then
        compose_cmd="docker-compose"
    elif docker compose version &> /dev/null; then
        compose_cmd="docker compose"
    else
        print_fail "Docker Compose not available"
        return 1
    fi
    
    print_test "Checking running containers..."
    if containers=$($compose_cmd ps --format table); then
        echo "$containers"
        
        # Count running containers
        running_count=$(echo "$containers" | grep -c "Up" || true)
        total_count=$(echo "$containers" | tail -n +2 | wc -l)
        
        if [ "$running_count" -gt 0 ]; then
            print_success "$running_count/$total_count containers are running"
        else
            print_fail "No containers are running"
        fi
    else
        print_fail "Could not check container status"
    fi
    echo
}

# Test environment configuration
test_environment() {
    print_header "Environment Configuration"
    
    if [ -f ".env.docker" ]; then
        print_success ".env.docker file exists"
        
        # Check for required variables
        required_vars=(
            "NEXT_PUBLIC_CONVEX_URL"
            "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
            "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
        )
        
        for var in "${required_vars[@]}"; do
            if grep -q "^$var=" .env.docker && ! grep -q "^$var=your_" .env.docker; then
                print_success "$var is configured"
            else
                print_warning "$var needs to be configured in .env.docker"
            fi
        done
    else
        print_fail ".env.docker file not found"
        print_warning "Copy env.docker.template to .env.docker and configure it"
    fi
    echo
}

# Test file structure
test_file_structure() {
    print_header "Project Structure Check"
    
    critical_files=(
        "package.json"
        "next.config.ts"
        "tailwind.config.ts"
        "tsconfig.json"
        "Dockerfile"
        "docker-compose.yml"
        "src/app/layout.tsx"
        "src/app/page.tsx"
        "convex/_generated/api.d.ts"
    )
    
    for file in "${critical_files[@]}"; do
        if [ -f "$file" ]; then
            print_success "Found: $file"
        else
            print_warning "Missing: $file"
        fi
    done
    echo
}

# Generate test report
generate_report() {
    print_header "Test Summary Report"
    
    echo "🐳 Docker Status:"
    docker --version
    echo
    
    if command -v docker-compose &> /dev/null; then
        echo "🔧 Docker Compose:"
        docker-compose --version
    else
        echo "🔧 Docker Compose:"
        docker compose version
    fi
    echo
    
    echo "🌐 Access URLs:"
    echo "  • TaskFlow App: http://localhost:3000"
    echo "  • MinIO Console: http://localhost:9001 (minioadmin/minioadmin)"
    echo "  • Health Check: http://localhost:3000/api/health"
    echo
    
    echo "📋 Next Steps:"
    echo "  1. Configure .env.docker with your API keys"
    echo "  2. Set up Convex: npx convex login && npx convex deploy"
    echo "  3. Test authentication with Clerk"
    echo "  4. Test payments with Stripe test cards"
    echo "  5. Test file uploads with MinIO"
    echo
}

# Main execution
main() {
    echo "🧪 TaskFlow Feature Testing Suite"
    echo "=================================="
    echo
    
    test_file_structure
    test_environment
    test_docker_services
    test_app_health
    test_services
    test_api_endpoints
    test_pages
    generate_report
    
    echo "✨ Testing complete! Check results above."
    echo "For detailed testing guide, see: DOCKER_TESTING_GUIDE.md"
}

# Allow running specific tests
case "${1:-all}" in
    "health")
        test_app_health
        ;;
    "services")
        test_services
        ;;
    "api")
        test_api_endpoints
        ;;
    "pages")
        test_pages
        ;;
    "docker")
        test_docker_services
        ;;
    "env")
        test_environment
        ;;
    "structure")
        test_file_structure
        ;;
    "all"|*)
        main
        ;;
esac
