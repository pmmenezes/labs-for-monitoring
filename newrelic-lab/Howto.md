# 1. Subir a aplicação
docker compose up -d

# 2. Aguardar inicialização
sleep 30

# 3. Criar dados de teste
curl -X POST http://localhost/api/seed

# 4. Tornar script executável
chmod +x run-tests.sh

# 5. Executar testes
./run-tests.sh

# 6. Ou executar teste específico
docker compose run --rm k6 run /scripts/scenarios/basic-load.js