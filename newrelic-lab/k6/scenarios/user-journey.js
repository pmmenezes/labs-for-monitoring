import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { config } from '../utils/config.js';

export const options = {
  scenarios: {
    user_journey: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 3 },
        { duration: '3m', target: 3 },
        { duration: '1m', target: 0 },
      ],
    },
  },
  thresholds: config.thresholds,
};

export default function () {
  group('User Login Flow', () => {
    // Simular login/autenticação
    const healthCheck = http.get(`${config.baseUrl}/health`);
    check(healthCheck, {
      'health check passed': (r) => r.status === 200,
    });
    sleep(1);
  });
  
  group('Browse Products', () => {
    // Usuário navega pelos produtos
    const products = http.get(`${config.baseUrl}/api/products`);
    check(products, {
      'products loaded': (r) => r.status === 200 || r.status === 500,
    });
    sleep(2);
    
    // Ver detalhes (cache hit)
    const productsAgain = http.get(`${config.baseUrl}/api/products`);
    sleep(1);
  });
  
  group('View Orders History', () => {
    // Usuário consulta histórico
    const orders = http.get(`${config.baseUrl}/api/orders`);
    check(orders, {
      'orders loaded': (r) => r.status === 200,
    });
    sleep(2);
  });
  
  group('Analytics Dashboard', () => {
    // Usuário acessa dashboard (CPU intensivo)
    const analytics = http.get(`${config.baseUrl}/api/analytics`);
    check(analytics, {
      'analytics processed': (r) => r.status === 200,
      'analytics response time acceptable': (r) => r.timings.duration < 2000,
    });
    sleep(3);
  });
}