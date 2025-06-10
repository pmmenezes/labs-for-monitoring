import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from '../utils/config.js';

export const options = {
  scenarios: {
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },  // Ramp up
        { duration: '2m', target: 10 },   // Stay at 10 users
        { duration: '30s', target: 25 },  // Ramp up to 25
        { duration: '2m', target: 25 },   // Stay at 25
        { duration: '30s', target: 50 },  // Ramp up to 50
        { duration: '1m', target: 50 },   // Stay at 50
        { duration: '30s', target: 0 },   // Ramp down
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000'], // Mais permissivo no stress test
    http_req_failed: ['rate<0.2'],     // 20% de erro aceitável
  },
};

export default function () {
  // Misturar diferentes tipos de requests
  const endpoints = [
    config.endpoints.users,
    config.endpoints.orders,
    config.endpoints.products,
    config.endpoints.analytics,
  ];
  
  // Escolher endpoint aleatório
  const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  
  const response = http.get(`${config.baseUrl}${randomEndpoint}`);
  
  check(response, {
    'request completed': (r) => r.status !== 0,
    'response time under 2s': (r) => r.timings.duration < 2000,
  });
  
  // Variação no sleep para simular comportamento real
  sleep(Math.random() * 3 + 1); // 1-4 segundos
}