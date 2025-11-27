# --- Stage 1: Build React app ---
FROM node:20.9.0-alpine AS builder

WORKDIR /app

# Copy package files first
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest and build
COPY . .
RUN npm run build

# --- Stage 2: Serve with nginx ---
FROM nginx:1.25-alpine

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /app/dist .
COPY nginx.conf.default /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
