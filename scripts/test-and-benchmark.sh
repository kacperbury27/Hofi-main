#!/bin/bash

# Comprehensive Testing & Benchmarking Script
# Usage: ./scripts/test-and-benchmark.sh

set -e

echo "════════════════════════════════════════════════════════"
echo "🧪 HouseFinance - Testing & Benchmarking Suite"
echo "════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test phases
run_phase() {
  echo -e "${BLUE}▶ $1${NC}"
}

success() {
  echo -e "${GREEN}✓ $1${NC}"
}

warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

error() {
  echo -e "${RED}✗ $1${NC}"
}

# Phase 1: Unit Tests
run_phase "Phase 1: Running Unit Tests"
echo ""
npm test -- --run
if [ $? -eq 0 ]; then
  success "All unit tests passed"
else
  error "Unit tests failed"
  exit 1
fi
echo ""

# Phase 2: Build
run_phase "Phase 2: Building Application"
echo ""
npm run build
if [ $? -eq 0 ]; then
  success "Build successful"
  # Show bundle size
  echo ""
  echo "📦 Bundle Size:"
  du -h dist/assets/*.js | head -5
else
  error "Build failed"
  exit 1
fi
echo ""

# Phase 3: Performance Checks
run_phase "Phase 3: Performance Benchmarks"
echo ""
npm test -- performance.test.js --run
if [ $? -eq 0 ]; then
  success "Performance benchmarks passed"
else
  warning "Some performance benchmarks may have failed"
fi
echo ""

# Phase 4: Summary
echo "════════════════════════════════════════════════════════"
echo -e "${GREEN}✓ Testing Complete!${NC}"
echo "════════════════════════════════════════════════════════"
echo ""

echo "📊 Next Steps:"
echo "  1. Review console output above for any warnings"
echo "  2. Open Chrome DevTools (F12) for detailed profiling"
echo "  3. Use npm run dev to test interactively"
echo "  4. Check OPTIMIZATION_GUIDE.md for detailed info"
echo ""

echo "🚀 Ready for development or deployment!"
echo ""
