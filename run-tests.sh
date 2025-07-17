#!/bin/bash

# K6 Load Test Runner for https://constr.caia.tech/
# Usage: ./run-tests.sh [test-type]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if k6 is installed
check_k6() {
    if ! command -v k6 &> /dev/null; then
        print_error "k6 is not installed. Please install k6 first."
        echo "Visit: https://k6.io/docs/getting-started/installation/"
        exit 1
    fi
    
    print_status "k6 is installed: $(k6 version --quiet)"
}

# Function to run load tests
run_test() {
    local test_type=$1
    local script_file=$2
    local output_dir="results"
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    
    # Create results directory
    mkdir -p $output_dir
    
    print_status "Starting $test_type load test..."
    print_status "Target: https://constr.caia.tech/"
    print_status "Script: $script_file"
    print_status "Results will be saved to: ${output_dir}/${test_type}_${timestamp}"
    
    # Run k6 test with various output formats
    k6 run \
        --out json="${output_dir}/${test_type}_${timestamp}.json" \
        --out csv="${output_dir}/${test_type}_${timestamp}.csv" \
        --summary-export="${output_dir}/${test_type}_${timestamp}_summary.json" \
        $script_file
    
    print_status "$test_type load test completed!"
    print_status "Results saved to ${output_dir}/"
}

# Function to run basic load test
run_basic_test() {
    print_status "Running basic load test..."
    run_test "basic" "load-test.js"
}

# Function to run realistic load test
run_realistic_test() {
    print_status "Running realistic load test with session management..."
    run_test "realistic" "realistic-load-test.js"
}

# Function to run stress test
run_stress_test() {
    print_warning "Running stress test - this will generate high load!"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Modify the realistic test to use stress configuration
        k6 run \
            --out json="results/stress_$(date +"%Y%m%d_%H%M%S").json" \
            --env TEST_TYPE=stress \
            realistic-load-test.js
    else
        print_status "Stress test cancelled."
    fi
}

# Function to run spike test
run_spike_test() {
    print_warning "Running spike test - this will generate sudden load spikes!"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        k6 run \
            --out json="results/spike_$(date +"%Y%m%d_%H%M%S").json" \
            --env TEST_TYPE=spike \
            realistic-load-test.js
    else
        print_status "Spike test cancelled."
    fi
}

# Function to run soak test
run_soak_test() {
    print_warning "Running soak test - this will run for an extended period!"
    read -p "This test will run for ~40 minutes. Continue? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        k6 run \
            --out json="results/soak_$(date +"%Y%m%d_%H%M%S").json" \
            --env TEST_TYPE=soak \
            realistic-load-test.js
    else
        print_status "Soak test cancelled."
    fi
}

# Function to display test results
show_results() {
    local results_dir="results"
    
    if [ ! -d "$results_dir" ]; then
        print_error "No results directory found. Run some tests first."
        return
    fi
    
    print_status "Recent test results:"
    echo
    
    # Show latest JSON summary files
    for file in $(ls -t $results_dir/*_summary.json 2>/dev/null | head -5); do
        echo "📊 $(basename $file)"
        if command -v jq &> /dev/null; then
            echo "   Duration: $(jq -r '.metrics.http_req_duration.avg' $file)ms avg"
            echo "   Success Rate: $(jq -r '.metrics.http_req_failed.rate' $file | awk '{print (1-$1)*100}')%"
            echo "   VUs: $(jq -r '.metrics.vus_max.value' $file)"
        fi
        echo
    done
}

# Function to clean up old results
cleanup_results() {
    read -p "Delete all test results? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf results/
        print_status "Results cleaned up."
    else
        print_status "Cleanup cancelled."
    fi
}

# Main menu
show_help() {
    echo "K6 Load Test Runner for https://constr.caia.tech/"
    echo
    echo "Usage: $0 [command]"
    echo
    echo "Commands:"
    echo "  basic     - Run basic load test (simple HTTP requests)"
    echo "  realistic - Run realistic load test (with session management)"
    echo "  stress    - Run stress test (high concurrent users)"
    echo "  spike     - Run spike test (sudden load increases)"
    echo "  soak      - Run soak test (extended duration)"
    echo "  results   - Show recent test results"
    echo "  cleanup   - Clean up old test results"
    echo "  help      - Show this help message"
    echo
    echo "Examples:"
    echo "  $0 basic"
    echo "  $0 realistic"
    echo "  $0 stress"
    echo
}

# Main script logic
main() {
    check_k6
    
    case "${1:-help}" in
        "basic")
            run_basic_test
            ;;
        "realistic")
            run_realistic_test
            ;;
        "stress")
            run_stress_test
            ;;
        "spike")
            run_spike_test
            ;;
        "soak")
            run_soak_test
            ;;
        "results")
            show_results
            ;;
        "cleanup")
            cleanup_results
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function with all arguments
main "$@"