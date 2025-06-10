FROM node:18-alpine

# Instalar curl para healthcheck
RUN apk add --no-cache curl

WORKDIR /usr/src/app

# Copiar package.json primeiro
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o resto do código
COPY . .

# Verificar se newrelic.js existe
RUN ls -la newrelic.js || echo "newrelic.js não encontrado!"

EXPOSE 3000

CMD ["node", "server.js"]