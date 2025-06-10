#!/bin/bash

echo "🚀 New Relic Lab - K6 Test Suite"
echo "================================="

# Função para executar teste
run_test() {
    local test_name=$1
    local script_path=$2
    
    echo "🧪 Executando: $test_name"
    echo "📁 Script: $script_path"
    echo "⏰ Iniciado em: $(date)"
    
    docker compose run --rm k6 run /scripts/scenarios/$script_path
    
    echo "✅ $test_name concluído"
    echo "---"
}

# Menu interativo
echo "Escolha o teste para executar:"
echo "1) Basic Load Test (10min)"
echo "2) User Journey Test (5min)"
echo "3) Stress Test (7min)"
echo "4) Spike Test (2min)"
echo "5) Executar todos sequencialmente"
echo "0) Sair"

read -p "Opção: " choice

case $choice in
    1)
        run_test "Basic Load Test" "basic-load.js"
        ;;
    2)
        run_test "User Journey Test" "user-journey.js"
        ;;
    3)
        run_test "Stress Test" "stress-test.js"
        ;;
    4)
        run_test "Spike Test" "spike-test.js"
        ;;
    5)
        echo "🔄 Executando todos os testes..."
        run_test "Basic Load Test" "basic-load.js"
        sleep 30
        run_test "User Journey Test" "user-journey.js"
        sleep 30
        run_test "Stress Test" "stress-test.js"
        sleep 30
        run_test "Spike Test" "spike-test.js"
        echo "🎉 Todos os testes concluídos!"
        ;;
    0)
        echo "👋 Saindo..."
        exit 0
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac