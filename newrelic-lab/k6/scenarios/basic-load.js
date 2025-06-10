import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from '../utils/config.js';

export const options = {
  scenarios: {
    basic_load: {
      executor: 'constant-vus',
      vus: 5,
      duration: '10m',
    },
  },
  thresholds: config.thresholds,
};

export default function () {
  // Simular jornada do usuário
  const responses = {};
  
  // 1. Health check
  responses.health = http.get(`${config.baseUrl}${config.endpoints.health}`);
  check(responses.health, {
    'health check status 200': (r) => r.status === 200,
    'health check response time < 100ms': (r) => r.timings.duration < 100,
  });
  
  sleep(1);
  
  // 2. Listar usuários (cache miss/hit)
  responses.users = http.get(`${config.baseUrl}${config.endpoints.users}`);
  check(responses.users, {
    'users status 200': (r) => r.status === 200,
    'users has data': (r) => JSON.parse(r.body).length > 0,
  });
  
  sleep(2);
  
  // 3. Listar pedidos (query complexa)
  responses.orders = http.get(`${config.baseUrl}${config.endpoints.orders}`);
  check(responses.orders, {
    'orders status 200': (r) => r.status === 200,
  });
  
  sleep(1);
  
  // 4. Listar produtos (pode dar erro)
  responses.products = http.get(`${config.baseUrl}${config.endpoints.products}`);
  check(responses.products, {
    'products request completed': (r) => r.status === 200 || r.status === 500,
  });
  
  sleep(3);
}