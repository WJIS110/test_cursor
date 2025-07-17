import http from 'k6/http';
import { check, sleep } from 'k6';

// Simple validation test to ensure the target site is accessible
export let options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    'http_req_duration': ['p(95)<5000'], // 95% of requests should be below 5s
    'http_req_failed': ['rate<0.5'],     // Error rate should be below 50%
  },
};

const BASE_URL = 'https://constr.caia.tech';

export default function() {
  console.log('🔍 Validating load test setup...');
  
  // Test 1: Basic connectivity
  let homeResponse = http.get(BASE_URL, {
    headers: {
      'User-Agent': 'k6-validation/1.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    }
  });

  let homePageCheck = check(homeResponse, {
    '✅ Site is accessible': (r) => r.status === 200 || r.status === 302,
    '✅ Response contains content': (r) => r.body.length > 0,
  });

  if (homePageCheck) {
    console.log('✅ Basic connectivity test passed');
  } else {
    console.log('❌ Basic connectivity test failed');
  }

  sleep(1);

  // Test 2: Login page accessibility
  let loginResponse = http.get(`${BASE_URL}/login`, {
    headers: {
      'User-Agent': 'k6-validation/1.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    }
  });

  let loginPageCheck = check(loginResponse, {
    '✅ Login page accessible': (r) => r.status === 200,
    '✅ Login page has form elements': (r) => 
      r.body.includes('password') || 
      r.body.includes('login') || 
      r.body.includes('textbox') ||
      r.body.includes('登入'),
  });

  if (loginPageCheck) {
    console.log('✅ Login page accessibility test passed');
  } else {
    console.log('❌ Login page accessibility test failed');
  }

  sleep(1);

  // Test 3: Basic response time check
  let perfTestStart = Date.now();
  let perfResponse = http.get(BASE_URL);
  let responseTime = Date.now() - perfTestStart;

  let performanceCheck = check(perfResponse, {
    '✅ Response time acceptable': () => responseTime < 3000, // Under 3 seconds
    '✅ Server responds correctly': (r) => r.status < 500,
  });

  if (performanceCheck) {
    console.log(`✅ Performance test passed (${responseTime}ms)`);
  } else {
    console.log(`❌ Performance test failed (${responseTime}ms)`);
  }

  console.log('🏁 Validation complete');
}

export function teardown() {
  console.log('📊 Validation Summary:');
  console.log('   - If all tests passed (✅), your load testing setup is ready');
  console.log('   - If any tests failed (❌), check your network connection and target URL');
  console.log('   - You can now run: ./run-tests.sh realistic');
}