# Preparação
```bash
# Clonar/criar a estrutura
mkdir newrelic-lab
cd newrelic-lab

# Editar o arquivo .env com sua chave do New Relic

```

# Executar a aplicação
```bash
# Subir todos os serviços
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f app

```
# Acessar a aplicação
```bash
# Criar dados de teste
curl -X POST http://localhost/api/seed

# Testar endpoints
curl http://localhost/health
curl http://localhost/api/users
curl http://localhost/api/orders
curl http://localhost/api/products
curl http://localhost/api/analytics

```

# 🎯 Cenários de Demonstração

## Cenário 1: Performance Issues

```bash
# Gerar carga na rota analytics (CPU intensiva)
for i in {1..10}; do curl http://localhost/api/analytics & done
```

## Cenário 2: Database Performance

```bash
# Múltiplas consultas simultâneas
for i in {1..20}; do curl http://localhost/api/orders & done
```

## Cenário 3: Error Tracking
```bash
# A rota /api/products tem 10% de chance de erro
for i in {1..50}; do curl http://localhost/api/products; done
```
## Cenário 4: Cache Behavior
```bash
# Testar cache com Redis# Primeira chamada: miss no cache
curl http://localhost/api/users

# Segunda chamada: hit no cache
curl http://localhost/api/users
```
## 🛠️ Comandos Úteis

# Parar todos os serviços
docker-compose down

# Remover volumes (reset completo)
docker-compose down -v

# Ver logs específicos
docker-compose logs app
docker-compose logs postgres
docker-compose logs nginx

# Executar comandos no container
docker-compose exec app npm install
docker-compose exec postgres psql -U labuser -d labdb

# Rebuild da aplicação
docker-compose build app
docker-compose up -d app