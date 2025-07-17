import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { normalLoad } from './load-test-config.js';

// Custom metrics
const loginSuccessRate = new Rate('login_success_rate');
const questionNavigationRate = new Rate('question_navigation_success_rate');
const answerSubmissionRate = new Rate('answer_submission_success_rate');
const settingsAccessRate = new Rate('settings_access_success_rate');
const adminAccessRate = new Rate('admin_access_success_rate');

const loginDuration = new Trend('login_duration');
const questionLoadDuration = new Trend('question_load_duration');
const answerSubmissionDuration = new Trend('answer_submission_duration');
const navigationDuration = new Trend('navigation_duration');

const errorCounter = new Counter('errors');

// Use normal load configuration
export const options = normalLoad;

const BASE_URL = 'https://constr.caia.tech';

// Test users based on Playwright tests
const testUsers = [
  { phone: '97861222', password: '123456aA$', userType: 'regular' },
  { phone: '52767697', password: '123456aD$', userType: 'admin' },
];

// Session management
class UserSession {
  constructor() {
    this.cookies = {};
    this.headers = {
      'User-Agent': 'k6-load-test/1.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    };
    this.isLoggedIn = false;
    this.currentQuestion = 1;
  }

  updateCookies(response) {
    if (response.headers['Set-Cookie']) {
      const cookies = Array.isArray(response.headers['Set-Cookie']) 
        ? response.headers['Set-Cookie'] 
        : [response.headers['Set-Cookie']];
      
      cookies.forEach(cookie => {
        const [nameValue] = cookie.split(';');
        const [name, value] = nameValue.split('=');
        this.cookies[name] = value;
      });
      
      this.headers['Cookie'] = Object.entries(this.cookies)
        .map(([name, value]) => `${name}=${value}`)
        .join('; ');
    }
  }

  makeRequest(method, url, payload = null) {
    const options = { headers: this.headers };
    
    if (payload && method === 'POST') {
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    let response;
    if (method === 'GET') {
      response = http.get(url, options);
    } else if (method === 'POST') {
      response = http.post(url, payload, options);
    }

    this.updateCookies(response);
    return response;
  }
}

// Main test scenario
export default function() {
  const session = new UserSession();
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  
  try {
    // Test the complete user flow
    if (performLogin(session, user)) {
      // Simulate different user behaviors
      const behavior = Math.random();
      
      if (behavior < 0.4) {
        // 40% - Answer questions workflow
        performAnswerWorkflow(session);
      } else if (behavior < 0.7) {
        // 30% - Navigation and browsing
        performNavigationWorkflow(session);
      } else if (behavior < 0.9) {
        // 20% - Settings and preferences
        performSettingsWorkflow(session);
      } else {
        // 10% - Admin workflow (if admin user)
        if (user.userType === 'admin') {
          performAdminWorkflow(session);
        } else {
          performAnswerWorkflow(session);
        }
      }
      
      // Logout
      performLogout(session);
    }
  } catch (error) {
    errorCounter.add(1);
    console.error(`Test error: ${error.message}`);
  }
  
  sleep(1 + Math.random() * 2); // Random sleep between 1-3 seconds
}

function performLogin(session, user) {
  const loginStart = Date.now();
  
  // Load login page
  const loginPageResponse = session.makeRequest('GET', `${BASE_URL}/login`);
  
  const loginPageCheck = check(loginPageResponse, {
    'login page loads': (r) => r.status === 200,
    'login page has form': (r) => r.body.includes('textbox') || r.body.includes('password') || r.body.includes('登入'),
  });

  if (!loginPageCheck) {
    errorCounter.add(1);
    return false;
  }

  sleep(1); // User reading/filling form time

  // Extract CSRF token or other form data if needed
  let csrfToken = '';
  const csrfMatch = loginPageResponse.body.match(/name="csrf-token" content="([^"]+)"/);
  if (csrfMatch) {
    csrfToken = csrfMatch[1];
  }

  // Prepare login data
  let loginData = `phone=${user.phone}&password=${user.password}`;
  if (csrfToken) {
    loginData += `&_token=${csrfToken}`;
  }

  // Perform login
  const loginResponse = session.makeRequest('POST', `${BASE_URL}/login`, loginData);

  const loginSuccess = check(loginResponse, {
    'login successful': (r) => r.status === 200 || r.status === 302,
    'login redirects to dashboard': (r) => 
      r.status === 302 || 
      r.body.includes('/20') || 
      r.body.includes('question') || 
      r.url.includes('dashboard'),
  });

  loginSuccessRate.add(loginSuccess);
  loginDuration.add(Date.now() - loginStart);
  
  if (loginSuccess) {
    session.isLoggedIn = true;
  }

  return loginSuccess;
}

function performAnswerWorkflow(session) {
  // Navigate to first question
  const questionStart = Date.now();
  const questionResponse = session.makeRequest('GET', `${BASE_URL}/questions/1`);
  
  const questionCheck = check(questionResponse, {
    'question page loads': (r) => r.status === 200,
    'question content visible': (r) => 
      r.body.includes('/20') || 
      r.body.includes('question') || 
      r.body.includes('answer'),
  });

  questionNavigationRate.add(questionCheck);
  questionLoadDuration.add(Date.now() - questionStart);

  if (questionCheck) {
    sleep(2 + Math.random() * 3); // User reading question time

    // Submit text answer
    const answerStart = Date.now();
    const answer = `Test answer ${Math.random().toString(36).substring(7)}`;
    const answerData = `answer=${encodeURIComponent(answer)}&question_id=${session.currentQuestion}`;
    
    const answerResponse = session.makeRequest('POST', `${BASE_URL}/submit-answer`, answerData);
    
    const answerSuccess = check(answerResponse, {
      'answer submitted successfully': (r) => r.status === 200 || r.status === 201,
      'answer accepted': (r) => 
        r.body.includes('success') || 
        r.body.includes('submitted') || 
        r.status < 400,
    });

    answerSubmissionRate.add(answerSuccess);
    answerSubmissionDuration.add(Date.now() - answerStart);

    if (answerSuccess) {
      sleep(1); // Brief pause after submission
      
      // Navigate to next question
      const navStart = Date.now();
      const nextResponse = session.makeRequest('GET', `${BASE_URL}/questions/${session.currentQuestion + 1}`);
      
      check(nextResponse, {
        'next question navigation': (r) => r.status === 200,
      });
      
      navigationDuration.add(Date.now() - navStart);
      session.currentQuestion++;
    }
  }
}

function performNavigationWorkflow(session) {
  // Test question menu navigation
  const menuResponse = session.makeRequest('GET', `${BASE_URL}/menu`);
  
  check(menuResponse, {
    'menu accessible': (r) => r.status === 200,
  });

  // Navigate through several questions
  for (let i = 0; i < 5; i++) {
    const questionNum = Math.floor(Math.random() * 20) + 1;
    const navStart = Date.now();
    
    const questionResponse = session.makeRequest('GET', `${BASE_URL}/questions/${questionNum}`);
    
    const navSuccess = check(questionResponse, {
      'question navigation successful': (r) => r.status === 200,
    });
    
    questionNavigationRate.add(navSuccess);
    navigationDuration.add(Date.now() - navStart);
    
    sleep(0.5 + Math.random()); // Brief viewing time
  }
}

function performSettingsWorkflow(session) {
  const settingsStart = Date.now();
  const settingsResponse = session.makeRequest('GET', `${BASE_URL}/settings`);
  
  const settingsSuccess = check(settingsResponse, {
    'settings page accessible': (r) => r.status === 200,
    'settings content loaded': (r) => 
      r.body.includes('settings') || 
      r.body.includes('profile') || 
      r.body.includes('Display text'),
  });

  settingsAccessRate.add(settingsSuccess);

  if (settingsSuccess) {
    sleep(2); // User reviewing settings
    
    // Test autoplay toggle (common user action)
    const toggleResponse = session.makeRequest('POST', `${BASE_URL}/toggle-autoplay`, 'autoplay=true');
    
    check(toggleResponse, {
      'settings toggle successful': (r) => r.status === 200 || r.status === 204,
    });
  }
}

function performAdminWorkflow(session) {
  const adminStart = Date.now();
  const adminResponse = session.makeRequest('GET', `${BASE_URL}/admin`);
  
  const adminSuccess = check(adminResponse, {
    'admin page accessible': (r) => r.status === 200,
    'admin dashboard loaded': (r) => 
      r.body.includes('Dashboard') || 
      r.body.includes('admin') || 
      r.body.includes('Answers'),
  });

  adminAccessRate.add(adminSuccess);

  if (adminSuccess) {
    sleep(2);
    
    // Test answers page
    const answersResponse = session.makeRequest('GET', `${BASE_URL}/admin/answers`);
    
    check(answersResponse, {
      'admin answers page loaded': (r) => r.status === 200,
    });

    sleep(1);

    // Test overview page
    const overviewResponse = session.makeRequest('GET', `${BASE_URL}/admin/overview`);
    
    check(overviewResponse, {
      'admin overview page loaded': (r) => r.status === 200,
    });
  }
}

function performLogout(session) {
  if (session.isLoggedIn) {
    const logoutResponse = session.makeRequest('POST', `${BASE_URL}/logout`, '');
    
    const logoutSuccess = check(logoutResponse, {
      'logout successful': (r) => r.status === 200 || r.status === 302,
      'redirected to login': (r) => 
        r.status === 302 || 
        r.body.includes('login') || 
        r.body.includes('師傅數碼分身'),
    });

    if (logoutSuccess) {
      session.isLoggedIn = false;
    }
  }
}