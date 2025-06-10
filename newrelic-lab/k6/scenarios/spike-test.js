import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from '../utils/config.js';

export const options = {
  scenarios: {
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 5 },   // Normal load
        { duration: '10s', target: 100 }, // Spike!
        { duration: '30s', target: 100 }, // Maintain spike
        { duration: '10s', target: 5 },   // Recovery
        { duration: '30s', target: 5 },   // Normal again
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'], // Mais permissivo
    http_req_failed: ['rate<0.3'],     // 30% erro aceitável no spike
  },
};

export default function () {
  // Durante o spike, focar em endpoints mais leves
  const lightEndpoints = [
    config.endpoints.health,
    config.endpoints.users,
  ];
  
  const heavyEndpoints = [
    config.endpoints.analytics,
    config.endpoints.orders,
  ];
  
  // 70% requests leves, 30% pesadas
  const useLight = Math.random() < 0.7;
  const endpoints = useLight ? lightEndpoints : heavyEndpoints;
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  
  const response = http.get(`${config.baseUrl}${endpoint}`);
  
  check(response, {
    'spike request handled': (r) => r.status !== 0,
  });
  
  sleep(0.5); // Requests mais frequentes durante spike
}