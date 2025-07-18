import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom metrics
let loginSuccessRate = new Rate('login_success_rate');
let answerSubmissionSuccessRate = new Rate('answer_submission_success_rate');
let navigationSuccessRate = new Rate('navigation_success_rate');
let loginDuration = new Trend('login_duration');
let answerSubmissionDuration = new Trend('answer_submission_duration');

// Test configuration
export let options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp-up to 10 users over 2 minutes
    { duration: '5m', target: 20 }, // Stay at 20 users for 5 minutes
    { duration: '2m', target: 30 }, // Ramp-up to 30 users over 2 minutes
    { duration: '3m', target: 30 }, // Stay at 30 users for 3 minutes
    { duration: '2m', target: 0 },  // Ramp-down to 0 users over 2 minutes
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000'], // 95% of requests should be below 2s
    'http_req_failed': ['rate<0.1'],     // Error rate should be below 10%
    'login_success_rate': ['rate>0.9'],  // Login success rate should be above 90%
    'answer_submission_success_rate': ['rate>0.9'], // Answer submission success rate should be above 90%
    'navigation_success_rate': ['rate>0.9'], // Navigation success rate should be above 90%
  },
};

const BASE_URL = 'https://constr.caia.tech';

// Test data
const testUsers = [
  { phone: '97861222', password: '123456aA$' },
  { phone: '52767697', password: '123456aD$' },
];

// Helper function to extract CSRF token or session info if needed
function extractAuthToken(response) {
  // Look for common authentication patterns
  let token = '';
  
  // Check for meta tags with CSRF tokens
  const csrfMatch = response.body.match(/<meta name="csrf-token" content="([^"]+)"/);
  if (csrfMatch) {
    token = csrfMatch[1];
  }
  
  return token;
}

// Helper function to simulate form submission with proper headers
function submitForm(url, formData, headers = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
  };

  // Merge headers manually
  for (let key in headers) {
    defaultHeaders[key] = headers[key];
  }

  return http.post(url, formData, { headers: defaultHeaders });
}

// Main test scenario
export default function() {
  let user = testUsers[Math.floor(Math.random() * testUsers.length)];
  
  // Test 1: Load login page and perform login
  testLogin(user);
  
  // Test 2: Navigate questions and submit answers
  testQuestionNavigation();
  
  // Test 3: Test settings and admin functionality
  testSettings();
  
  sleep(1);
}

function testLogin(user) {
  let loginStart = Date.now();
  
  // Load login page
  let loginPageResponse = http.get(`${BASE_URL}/login`, {
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    }
  });

  let loginPageSuccess = check(loginPageResponse, {
    'login page loads successfully': (r) => r.status === 200,
    'login page contains form elements': (r) => r.body.includes('textbox') || r.body.includes('input'),
  });

  if (loginPageSuccess) {
    // Extract any necessary tokens
    let authToken = extractAuthToken(loginPageResponse);
    
    // Perform login
    let loginData = {
      phone: user.phone,
      password: user.password,
    };

    // Add auth token if found
    if (authToken) {
      loginData._token = authToken;
    }

    let loginHeaders = {};
    if (loginPageResponse.headers['Set-Cookie']) {
      loginHeaders['Cookie'] = loginPageResponse.headers['Set-Cookie'];
    }

    let loginResponse = submitForm(`${BASE_URL}/login`, loginData, loginHeaders);

    let loginSuccess = check(loginResponse, {
      'login request successful': (r) => r.status === 200 || r.status === 302,
      'login redirects or shows dashboard': (r) => 
        r.status === 302 || 
        r.body.includes('/20') || 
        r.body.includes('dashboard') ||
        r.body.includes('question'),
    });

    loginSuccessRate.add(loginSuccess);
    loginDuration.add(Date.now() - loginStart);
  }
}

function testQuestionNavigation() {
  let navigationStart = Date.now();
  
  // Test question page access
  let questionResponse = http.get(`${BASE_URL}/questions`, {
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    }
  });

  let navigationSuccess = check(questionResponse, {
    'question page loads': (r) => r.status === 200,
    'question content visible': (r) => 
      r.body.includes('/20') || 
      r.body.includes('question') ||
      r.body.includes('answer'),
  });

  if (navigationSuccess) {
    // Test answer submission
    testAnswerSubmission();
    
    // Test question navigation (next/previous)
    testQuestionPagination();
  }

  navigationSuccessRate.add(navigationSuccess);
}

function testAnswerSubmission() {
  let answerStart = Date.now();
  
  // Simulate text answer submission
  let answerData = {
    answer: `Test answer ${Math.random().toString(36).substring(7)}`,
    question_id: Math.floor(Math.random() * 20) + 1,
  };

  let answerResponse = submitForm(`${BASE_URL}/submit-answer`, answerData);

  let answerSuccess = check(answerResponse, {
    'answer submission accepted': (r) => r.status === 200 || r.status === 201,
    'answer response valid': (r) => 
      r.body.includes('success') || 
      r.body.includes('submitted') ||
      r.status < 400,
  });

  answerSubmissionSuccessRate.add(answerSuccess);
  answerSubmissionDuration.add(Date.now() - answerStart);
}

function testQuestionPagination() {
  // Test next question
  let nextResponse = http.get(`${BASE_URL}/next-question`, {
    headers: {
      'Accept': 'application/json, text/plain, */*',
    }
  });

  check(nextResponse, {
    'next question loads': (r) => r.status === 200,
  });

  sleep(0.5);

  // Test previous question
  let prevResponse = http.get(`${BASE_URL}/previous-question`, {
    headers: {
      'Accept': 'application/json, text/plain, */*',
    }
  });

  check(prevResponse, {
    'previous question loads': (r) => r.status === 200,
  });
}

function testSettings() {
  // Test settings page access
  let settingsResponse = http.get(`${BASE_URL}/settings`, {
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    }
  });

  check(settingsResponse, {
    'settings page loads': (r) => r.status === 200,
    'settings content visible': (r) => 
      r.body.includes('settings') || 
      r.body.includes('profile') ||
      r.body.includes('logout'),
  });

  // Test admin page access (if user has permission)
  let adminResponse = http.get(`${BASE_URL}/admin`, {
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    }
  });

  check(adminResponse, {
    'admin page accessible or properly restricted': (r) => 
      r.status === 200 || r.status === 403 || r.status === 401,
  });
}

// Scenario for testing high-load answer submissions
export function answerSubmissionStress() {
  let user = testUsers[Math.floor(Math.random() * testUsers.length)];
  
  // Quick login
  testLogin(user);
  
  // Rapid answer submissions
  for (let i = 0; i < 5; i++) {
    testAnswerSubmission();
    sleep(0.2);
  }
}

// Scenario for testing navigation under load
export function navigationStress() {
  let user = testUsers[Math.floor(Math.random() * testUsers.length)];
  
  // Quick login
  testLogin(user);
  
  // Rapid navigation
  for (let i = 0; i < 10; i++) {
    testQuestionPagination();
    sleep(0.1);
  }
}

// Alternative test configuration for stress testing
export let stressOptions = {
  executor: 'ramping-vus',
  startVUs: 0,
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 100 },
    { duration: '1m', target: 0 },
  ],
  gracefulRampDown: '30s',
};