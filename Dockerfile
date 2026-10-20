FROM node:22.16.0-alpine AS base

# Etapa 1: Instalar Dependencias
FROM base AS dependencies
WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev --ignore-scripts && npm cache clean --force

# Etapa 2: Build de la imagen
FROM base AS builder
WORKDIR /app

COPY --from=dependencies /app/package.json /app/package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

# Etapa 3: Despliegue de la imagen
FROM base AS deployment
WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
RUN --mount=type=bind,from=builder,source=/app,target=/mnt/builder \
    if [ -f /mnt/builder/.env ]; then cp /mnt/builder/.env .; fi

ARG PORT=8003
ENV PORT=${PORT}

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app
USER nestjs

EXPOSE $PORT
CMD ["node", "dist/src/main.js"]
