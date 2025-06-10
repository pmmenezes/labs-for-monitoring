FROM node:18-alpine

WORKDIR /usr/src/app

# Instalar dependências
COPY package*.json ./
RUN npm install

# Copiar código da aplicação
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]