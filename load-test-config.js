// K6 Load Test Configuration for https://constr.caia.tech/

// Light load test configuration
export const lightLoad = {
  stages: [
    { duration: '1m', target: 5 },
    { duration: '3m', target: 5 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<1500'],
    'http_req_failed': ['rate<0.05'],
    'login_success_rate': ['rate>0.95'],
  },
};

// Normal load test configuration
export const normalLoad = {
  stages: [
    { duration: '2m', target: 10 },
    { duration: '5m', target: 20 },
    { duration: '2m', target: 30 },
    { duration: '3m', target: 30 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000'],
    'http_req_failed': ['rate<0.1'],
    'login_success_rate': ['rate>0.9'],
    'answer_submission_success_rate': ['rate>0.9'],
    'navigation_success_rate': ['rate>0.9'],
  },
};

// Stress test configuration
export const stressLoad = {
  stages: [
    { duration: '2m', target: 50 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 150 },
    { duration: '3m', target: 150 },
    { duration: '3m', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<3000'],
    'http_req_failed': ['rate<0.2'],
    'login_success_rate': ['rate>0.8'],
  },
};

// Spike test configuration
export const spikeLoad = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '30s', target: 100 }, // Spike
    { duration: '2m', target: 10 },
    { duration: '30s', target: 200 }, // Higher spike
    { duration: '2m', target: 10 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<4000'],
    'http_req_failed': ['rate<0.3'],
  },
};

// Soak test configuration (long duration)
export const soakLoad = {
  stages: [
    { duration: '5m', target: 20 },
    { duration: '30m', target: 20 }, // Long duration
    { duration: '5m', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000'],
    'http_req_failed': ['rate<0.1'],
  },
};

// Test data configurations
export const testData = {
  users: [
    { phone: '97861222', password: '123456aA$', type: 'regular' },
    { phone: '52767697', password: '123456aD$', type: 'admin' },
  ],
  
  endpoints: {
    login: '/login',
    questions: '/questions',
    submitAnswer: '/submit-answer',
    nextQuestion: '/next-question',
    previousQuestion: '/previous-question',
    settings: '/settings',
    admin: '/admin',
    logout: '/logout',
  },
  
  sampleAnswers: [
    'This is a test answer for load testing.',
    'Hello, this is my response to the question.',
    'Load testing answer submission.',
    'Testing the system under load.',
    'Sample answer for performance evaluation.',
  ],
};

// Response time targets
export const performanceTargets = {
  login: 2000,        // 2 seconds
  questionLoad: 1500, // 1.5 seconds
  answerSubmit: 3000, // 3 seconds
  navigation: 1000,   // 1 second
  settings: 2000,     // 2 seconds
};