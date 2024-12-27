FROM node:18-bullseye-slim

# Installation des dépendances système nécessaires
RUN apt-get update -y && \
    apt-get install -y openssl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Configuration et génération de Prisma
ENV NODE_ENV=production
ENV PRISMA_BINARY_PLATFORM=debian-openssl-3.0.x
RUN npx prisma generate

# Build du projet
RUN npm run build || true

# Script de démarrage
COPY start.sh .
RUN chmod +x start.sh

EXPOSE ${PORT:-3001}

CMD ["./start.sh"] 