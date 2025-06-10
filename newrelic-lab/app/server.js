// Importar New Relic PRIMEIRO
require('./newrelic');

const express = require('express');
const { Client } = require('pg');
const redis = require('redis');
const cors = require('cors');
const helmet = require('helmet');
const winston = require('winston');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Configurar conexões
const pgClient = new Client({
  connectionString: process.env.DATABASE_URL
});

const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

// Conectar aos bancos
async function connectDatabases() {
  try {
    await pgClient.connect();
    await redisClient.connect();
    logger.info('Conectado aos bancos de dados');
  } catch (error) {
    logger.error('Erro ao conectar aos bancos:', error);
  }
}

connectDatabases();

// Middleware para adicionar delay aleatório (simular latência)
app.use((req, res, next) => {
  const delay = Math.random() * 100; // 0-100ms
  setTimeout(next, delay);
});

// Rotas da API

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rota com cache Redis
app.get('/api/users', async (req, res) => {
  try {
    const cacheKey = 'users:all';
    
    // Tentar buscar do cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      logger.info('Dados retornados do cache');
      return res.json(JSON.parse(cached));
    }

    // Buscar do banco
    const result = await pgClient.query('SELECT * FROM users LIMIT 10');
    const users = result.rows;

    // Salvar no cache por 30 segundos
    await redisClient.setEx(cacheKey, 30, JSON.stringify(users));
    
    logger.info(`Retornados ${users.length} usuários do banco`);
    res.json(users);
  } catch (error) {
    logger.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota com consulta complexa (para demonstrar slow queries)
app.get('/api/orders', async (req, res) => {
  try {
    // Simular consulta complexa com JOIN
    const query = `
      SELECT o.*, u.name as user_name, u.email 
      FROM orders o 
      JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC 
      LIMIT 20
    `;
    
    const result = await pgClient.query(query);
    logger.info(`Retornados ${result.rows.length} pedidos`);
    res.json(result.rows);
  } catch (error) {
    logger.error('Erro ao buscar pedidos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota que ocasionalmente falha (para demonstrar error tracking)
app.get('/api/products', async (req, res) => {
  try {
    // 10% de chance de erro
    if (Math.random() < 0.1) {
      throw new Error('Erro simulado na busca de produtos');
    }

    const result = await pgClient.query('SELECT * FROM products LIMIT 15');
    logger.info(`Retornados ${result.rows.length} produtos`);
    res.json(result.rows);
  } catch (error) {
    logger.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// Rota com processamento CPU intensivo
app.get('/api/analytics', (req, res) => {
  const start = Date.now();
  
  // Simular processamento pesado
  let result = 0;
  for (let i = 0; i < 1000000; i++) {
    result += Math.sqrt(i);
  }
  
  const duration = Date.now() - start;
  logger.info(`Processamento analytics completado em ${duration}ms`);
  
  res.json({
    result: Math.floor(result),
    processingTime: duration,
    timestamp: new Date().toISOString()
  });
});

// Rota para criar dados de teste
app.post('/api/seed', async (req, res) => {
  try {
    // Inserir usuários de teste
    await pgClient.query(`
      INSERT INTO users (name, email) VALUES 
      ('João Silva', 'joao@email.com'),
      ('Maria Santos', 'maria@email.com'),
      ('Pedro Oliveira', 'pedro@email.com')
      ON CONFLICT (email) DO NOTHING
    `);

    // Inserir produtos de teste
    await pgClient.query(`
      INSERT INTO products (name, price) VALUES 
      ('Notebook', 2500.00),
      ('Mouse', 50.00),
      ('Teclado', 150.00)
      ON CONFLICT (name) DO NOTHING
    `);

    logger.info('Dados de teste inseridos');
    res.json({ message: 'Dados de teste criados com sucesso' });
  } catch (error) {
    logger.error('Erro ao criar dados de teste:', error);
    res.status(500).json({ error: 'Erro ao criar dados de teste' });
  }
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  logger.error('Erro não tratado:', error);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Encerrando aplicação...');
  await pgClient.end();
  await redisClient.quit();
  process.exit(0);
});