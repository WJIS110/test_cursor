# K6 Load Testing for https://constr.caia.tech/

This repository contains comprehensive load testing scripts for the https://constr.caia.tech/ website using [K6](https://k6.io/). The tests are based on the Playwright test scenarios and simulate real user interactions including login, question navigation, answer submissions, and admin functionality.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Test Scenarios](#test-scenarios)
- [Usage](#usage)
- [Test Configuration](#test-configuration)
- [Results Analysis](#results-analysis)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

- [K6](https://k6.io/) installed on your system
- Basic understanding of load testing concepts
- Access to the target website

## 📦 Installation

1. **Install K6:**

   **On macOS:**
   ```bash
   brew install k6
   ```

   **On Ubuntu/Debian:**
   ```bash
   sudo gpg -k
   sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
   echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
   sudo apt-get update
   sudo apt-get install k6
   ```

   **On Windows:**
   ```bash
   winget install k6
   ```

2. **Clone or download the test files:**
   ```bash
   # Download the test files to your local directory
   ```

3. **Make the runner script executable:**
   ```bash
   chmod +x run-tests.sh
   ```

## 🎯 Test Scenarios

### Main User Flows

The tests simulate the following user journeys based on the Playwright tests:

1. **Login Flow** (`main_not_record`)
   - Navigate to login page
   - Fill in credentials (phone: 97861222, password: 123456aA$)
   - Toggle password visibility
   - Perform login
   - Navigate questions and submit text answers

2. **Recording Flow** (`main_has_record`)
   - Login with admin credentials (phone: 52767697, password: 123456aD$)
   - Navigate to questions
   - Simulate audio recording (mocked in load tests)
   - Submit answers and verify transcription

3. **Admin Flow** (`admin_page`)
   - Login with admin credentials
   - Access admin dashboard
   - Manage answers (view, edit, delete)
   - View system overview and logs

### Load Test Types

1. **Basic Load Test** (`load-test.js`)
   - Simple HTTP requests to test basic functionality
   - Gradual ramp-up from 10 to 30 concurrent users
   - 14-minute duration

2. **Realistic Load Test** (`realistic-load-test.js`)
   - Complete user session management
   - Simulates actual user behavior patterns
   - Cookie and authentication handling
   - Multiple user workflows

## 🚀 Usage

### Quick Start

Run the test runner with different scenarios:

```bash
# Basic load test
./run-tests.sh basic

# Realistic load test with session management
./run-tests.sh realistic

# Stress test (high concurrent users)
./run-tests.sh stress

# Spike test (sudden load increases)
./run-tests.sh spike

# Soak test (extended duration - ~40 minutes)
./run-tests.sh soak

# View recent test results
./run-tests.sh results

# Clean up old results
./run-tests.sh cleanup
```

### Manual K6 Commands

You can also run tests directly with K6:

```bash
# Run basic load test
k6 run load-test.js

# Run with custom options
k6 run --vus 50 --duration 5m realistic-load-test.js

# Run with results output
k6 run --out json=results.json realistic-load-test.js
```

## ⚙️ Test Configuration

### Load Test Profiles

| Test Type | Users | Duration | Purpose |
|-----------|-------|----------|---------|
| Light | 5 | 5 min | Development testing |
| Normal | 10-30 | 14 min | Regular load testing |
| Stress | 50-150 | 15 min | Stress testing |
| Spike | 10-200 | 7 min | Spike testing |
| Soak | 20 | 40 min | Endurance testing |

### Performance Thresholds

- **Response Time**: 95% of requests < 2 seconds
- **Error Rate**: < 10% failed requests
- **Login Success Rate**: > 90%
- **Answer Submission Success Rate**: > 90%
- **Navigation Success Rate**: > 90%

### Test Data

The tests use the following credentials:
- Regular User: Phone `97861222`, Password `123456aA$`
- Admin User: Phone `52767697`, Password `123456aD$`

## 📊 Results Analysis

### Metrics Collected

1. **HTTP Metrics**
   - Request duration (avg, min, max, p95)
   - Request rate
   - Failure rate
   - Data transfer rates

2. **Custom Metrics**
   - Login success rate
   - Question navigation success rate
   - Answer submission success rate
   - Settings access success rate
   - Admin access success rate

3. **Performance Metrics**
   - Login duration
   - Question load duration
   - Answer submission duration
   - Navigation duration

### Output Formats

Test results are saved in multiple formats:
- **JSON**: Machine-readable detailed metrics
- **CSV**: Spreadsheet-compatible time-series data
- **Summary JSON**: High-level test summary

### Reading Results

```bash
# View results with the runner script
./run-tests.sh results

# Manual analysis with jq (if installed)
jq '.metrics.http_req_duration' results/realistic_20231201_143022_summary.json

# View CSV data
cat results/realistic_20231201_143022.csv | head -20
```

## 🔍 Key Test Features

### Session Management
- Proper cookie handling
- Authentication state persistence
- CSRF token extraction

### User Behavior Simulation
- 40% Answer questions workflow
- 30% Navigation and browsing
- 20% Settings and preferences
- 10% Admin workflow (for admin users)

### Error Handling
- Graceful failure handling
- Error counting and reporting
- Connection timeout management

## 🚨 Troubleshooting

### Common Issues

1. **K6 Not Found**
   ```
   Error: k6 command not found
   ```
   Solution: Install K6 following the installation instructions above.

2. **Permission Denied**
   ```
   Error: Permission denied: ./run-tests.sh
   ```
   Solution: Make the script executable with `chmod +x run-tests.sh`

3. **High Error Rates**
   - Check if the target website is accessible
   - Verify credentials are correct
   - Reduce the number of concurrent users
   - Check network connectivity

4. **Timeouts**
   - Increase timeout values in the test scripts
   - Check server capacity
   - Reduce load intensity

### Performance Considerations

- Start with light load tests before running stress tests
- Monitor server resources during testing
- Be respectful of the target server capacity
- Use appropriate test data that won't interfere with production

## 📝 Customization

### Modifying Test Parameters

Edit `load-test-config.js` to adjust:
- User counts and ramp-up patterns
- Performance thresholds
- Test duration
- Target endpoints

### Adding New Test Scenarios

1. Create new functions in the test scripts
2. Add them to the main test execution flow
3. Update the configuration as needed

### Environment Variables

You can use environment variables to customize tests:

```bash
# Set custom target URL
K6_TARGET_URL=https://your-site.com k6 run realistic-load-test.js

# Set custom test type
TEST_TYPE=stress k6 run realistic-load-test.js
```

## 🤝 Contributing

When adding new tests or modifications:
1. Follow the existing code structure
2. Add proper error handling
3. Update documentation
4. Test with light load before committing

## ⚠️ Important Notes

- **Be Responsible**: Only run load tests against systems you own or have permission to test
- **Start Small**: Begin with light loads and gradually increase
- **Monitor Impact**: Watch server resources and user impact during testing
- **Data Privacy**: Ensure test data doesn't include sensitive information
- **Rate Limiting**: Respect any rate limiting implemented by the target system

## 📄 License

This load testing suite is provided as-is for educational and testing purposes.
