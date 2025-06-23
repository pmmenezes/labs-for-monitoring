#!/bin/bash

# Setup OpenTelemetry monitoring for PostgreSQL and Redis

set -e

echo "🚀 Setting up OpenTelemetry monitoring stack..."

# Check if license key is set
if [ -z "$NEW_RELIC_LICENSE_KEY" ]; then
    echo "❌ NEW_RELIC_LICENSE_KEY not set. Please set it in .env file"
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs/{postgresql,redis,otel}
mkdir -p data/{postgres,redis}

# Set proper permissions
chmod 755 logs/
chmod 755 data/
chmod 644 *.yaml *.conf

# Validate OpenTelemetry config
echo "✅ Validating OpenTelemetry configuration..."
if command -v otelcol-contrib &> /dev/null; then
    otelcol-contrib --config-validate --config=otel-collector-config.yaml
else
    echo "⚠️  otelcol-contrib not found locally, will validate in container"
fi

# Start the monitoring stack
echo "🐳 Starting containers..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Health checks
echo "🔍 Performing health checks..."

# Check PostgreSQL
if docker exec postgres pg_isready -U postgres; then
    echo "✅ PostgreSQL is ready"
else
    echo "❌ PostgreSQL is not ready"
fi

# Check Redis
if docker exec redis redis-cli ping | grep -q PONG; then
    echo "✅ Redis is ready"
else
    echo "❌ Redis is not ready"
fi

# Check OpenTelemetry Collector
if curl -s http://localhost:13133 | grep -q "Server available"; then
    echo "✅ OpenTelemetry Collector is ready"
else
    echo "❌ OpenTelemetry Collector is not ready"
fi

# Check exporters
echo "📊 Checking metric exporters..."
curl -s http://localhost:9187/metrics | head -5
curl -s http://localhost:9121/metrics | head -5
curl -s http://localhost:9100/metrics | head -5

# Show logs
echo "📋 Recent OpenTelemetry Collector logs:"
docker logs otel-collector --tail 10

echo ""
echo "✅ Monitoring setup complete!"
echo "📈 Check your New Relic dashboard at: https://one.newrelic.com"
echo "🔧 Local Prometheus metrics available at: http://localhost:8889/metrics"
echo "🏥 Health check endpoint: http://localhost:13133"
echo ""
echo "🎯 Key endpoints:"
echo "  - PostgreSQL: localhost:5432"
echo "  - Redis: localhost:6379"
echo "  - OTLP gRPC: localhost:4317"
echo "  - OTLP HTTP: localhost:4318"
echo "  - Prometheus metrics: localhost:8889"