export const config = {
  baseUrl: 'http://nginx',
  endpoints: {
    health: '/health',
    users: '/api/users',
    orders: '/api/orders',
    products: '/api/products',
    analytics: '/api/analytics',
    seed: '/api/seed'
  },
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% das requests < 500ms
    http_req_failed: ['rate<0.1'],    // Taxa de erro < 10%
  }
};

export const scenarios = {
  // Cenário básico - usuários constantes
  constant_load: {
    executor: 'constant-vus',
    vus: 10,
    duration: '5m',
  },
  
  // Cenário de pico - simula Black Friday
  spike_test: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '30s', target: 5 },   // Ramp up
      { duration: '1m', target: 50 },   // Pico
      { duration: '30s', target: 0 },   // Ramp down
    ],
  },
  
  // Cenário de stress - encontrar limites
  stress_test: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '2m', target: 10 },
      { duration: '5m', target: 10 },
      { duration: '2m', target: 20 },
      { duration: '5m', target: 20 },
      { duration: '2m', target: 0 },
    ],
  }
};