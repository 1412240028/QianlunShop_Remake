🐳 Excellent Choice! Docker untuk QianlunShop
Keputusan yang sangat bagus! Docker akan membuat development dan deployment jauh lebih smooth. Mari kita setup production-ready Docker architecture.

🎯 Arsitektur dengan Docker
QianlunShop/
├── frontend/          # Existing frontend
├── backend/           # New Express API
├── docker-compose.yml # Orchestration
├── .env              # Environment variables
└── docker/
    ├── frontend.Dockerfile
    ├── backend.Dockerfile
    └── nginx.conf

📋 Docker Stack yang Akan Kita Bangun
yamlServices:
├─ 🌐 Nginx (Reverse Proxy + Static Files)
├─ 🎨 Frontend (Static files served by Nginx)
├─ ⚙️ Backend (Node.js + Express API)
├─ 🗄️ MongoDB (Database)
└─ 🔴 Redis (Optional: Caching & Sessions)

🚀 Step-by-Step Implementation
Saya akan guide Anda membuat setup yang production-ready tapi tetap easy to develop.
Step 1: Restructure Project
Pertama, kita perlu organize ulang:
bash# Di root project QianlunShop, jalankan:
mkdir backend
mkdir docker
Step 2: Create Docker Composedocker-compose.yml - QianlunShop Full StackKode # ============================================
# 🐳 QIANLUNSHOP - DOCKER COMPOSE
# Production-ready multi-container setup
# ============================================

version: '3.8'

services:
  # ==========================================
  # 🗄️
Step 3: Environment Variables.env.example - Environment ConfigurationKode # ============================================
# 🔐 QIANLUNSHOP - ENVIRONMENT VARIABLES
# Copy to .env and fill with your values
# ============================================

# ==========================================
# 🌍 General
# =============
Step 4: Backend Dockerfiledocker/backend.DockerfileKode # ============================================
# 🐳 QIANLUNSHOP BACKEND - Multi-stage Build
# Optimized Node.js Docker Image
# ============================================

# ==========================================
# Stage 1: Base
# ==============
Step 5: Nginx Configurationdocker/nginx.conf - Reverse Proxy ConfigurationKode # ============================================
# 🌐 QIANLUNSHOP - NGINX CONFIGURATION
# Reverse proxy + Static file server
# ============================================

# Worker configuration
user nginx;
worker_processes auto;
error_log /var/log/ng
Step 6: Nginx Dockerfiledocker/nginx.DockerfileKode # ============================================
# 🌐 QIANLUNSHOP NGINX - Frontend Server
# ============================================

FROM nginx:alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Remove default nginx config
RUN r
Step 7: Basic Backend Setupbackend/package.jsonKode {
  "name": "qianlunshop-backend",
  "version": "1.0.0",
  "description": "QianlunShop Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --coverage",
    "test:watch":
Step 8: Backend Server Entry Pointbackend/server.js - Express ServerKode // ============================================
// 🚀 QIANLUNSHOP BACKEND - Main Server
// ============================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compres
Step 9: Quick Start CommandsMakefile - Easy Docker CommandsKode # ============================================
# 🐳 QIANLUNSHOP - MAKEFILE
# Quick commands for Docker operations
# ============================================

.PHONY: help build up down restart logs clean dev prod

# Default target
.DEFAULT_GOAL :
🎯 How to Use
1. Setup Environment
bash# Clone atau di folder QianlunShop yang sudah ada
cd QianlunShop

# Copy environment template
cp .env.example .env

# Edit .env dengan credentials Anda
nano .env  # atau code .env
2. Start Development
bash# Build dan start semua services
make dev

# Atau tanpa Makefile:
docker-compose up -d
3. Check Status
bash# Lihat running containers
make ps

# Lihat logs
make logs

# Health check
make health
```

### **4. Access Services**
```
Frontend:  http://localhost
Backend:   http://localhost:5000
API Docs:  http://localhost:5000/api/health
MongoDB:   mongodb://localhost:27017
Redis:     redis://localhost:6379

🎨 Keuntungan Docker Setup Ini
✅ Development

Hot reload untuk backend (nodemon)
Isolated environment
Sama persis dengan production

✅ Production Ready

Multi-stage builds (optimized images)
Security best practices
Health checks
Graceful shutdown
Non-root user

✅ Scalability

Easy horizontal scaling
Load balancer ready (nginx)
Cache layer (redis)

✅ Maintainability

Single command deployment
Easy backup/restore
Clean separation of concerns

# ============================================
# 🐳 QIANLUNSHOP - DOCKER COMPOSE
# Production-ready multi-container setup
# ============================================

version: '3.8'

services:
  # ==========================================
  # 🗄️ MongoDB Database
  # ==========================================
  mongodb:
    image: mongo:7.0
    container_name: qianlun-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USER:-admin}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD:-secure_password_change_me}
      MONGO_INITDB_DATABASE: ${MONGO_DATABASE:-qianlunshop}
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
      - mongodb_config:/data/configdb
    networks:
      - qianlun-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5

  # ==========================================
  # 🔴 Redis Cache (Optional but Recommended)
  # ==========================================
  redis:
    image: redis:7-alpine
    container_name: qianlun-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - qianlun-network
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD:-secure_redis_password}
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  # ==========================================
  # ⚙️ Backend API (Node.js + Express)
  # ==========================================
  backend:
    build:
      context: ./backend
      dockerfile: ../docker/backend.Dockerfile
      args:
        NODE_ENV: ${NODE_ENV:-development}
    container_name: qianlun-backend
    restart: unless-stopped
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      PORT: 5000
      
      # Database
      MONGODB_URI: mongodb://${MONGO_ROOT_USER:-admin}:${MONGO_ROOT_PASSWORD:-secure_password_change_me}@mongodb:27017/${MONGO_DATABASE:-qianlunshop}?authSource=admin
      
      # Redis
      REDIS_URL: redis://:${REDIS_PASSWORD:-secure_redis_password}@redis:6379
      
      # JWT
      JWT_SECRET: ${JWT_SECRET:-your_super_secret_jwt_key_change_in_production}
      JWT_EXPIRE: ${JWT_EXPIRE:-7d}
      
      # Midtrans
      MIDTRANS_SERVER_KEY: ${MIDTRANS_SERVER_KEY}
      MIDTRANS_CLIENT_KEY: ${MIDTRANS_CLIENT_KEY}
      MIDTRANS_IS_PRODUCTION: ${MIDTRANS_IS_PRODUCTION:-false}
      
      # CORS
      CORS_ORIGIN: ${CORS_ORIGIN:-http://localhost:3000}
      
      # Email (Optional)
      SMTP_HOST: ${SMTP_HOST}
      SMTP_PORT: ${SMTP_PORT:-587}
      SMTP_USER: ${SMTP_USER}
      SMTP_PASSWORD: ${SMTP_PASSWORD}
      
    ports:
      - "5000:5000"
    volumes:
      - ./backend:/app
      - /app/node_modules  # Prevent overwriting node_modules
      - backend_logs:/app/logs
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - qianlun-network
    command: npm run dev  # Development mode with hot reload

  # ==========================================
  # 🌐 Nginx (Reverse Proxy + Frontend)
  # ==========================================
  nginx:
    build:
      context: .
      dockerfile: docker/nginx.Dockerfile
    container_name: qianlun-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./:/usr/share/nginx/html:ro
      - nginx_logs:/var/log/nginx
      # Uncomment for SSL
      # - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
    networks:
      - qianlun-network
    healthcheck:
      test: ["CMD", "nginx", "-t"]
      interval: 30s
      timeout: 10s
      retries: 3

# ==========================================
# 📦 Volumes (Persistent Data)
# ==========================================
volumes:
  mongodb_data:
    driver: local
  mongodb_config:
    driver: local
  redis_data:
    driver: local
  backend_logs:
    driver: local
  nginx_logs:
    driver: local

# ==========================================
# 🌐 Networks
# ==========================================
networks:
  qianlun-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

# ============================================
# 🔐 QIANLUNSHOP - ENVIRONMENT VARIABLES
# Copy to .env and fill with your values
# ============================================

# ==========================================
# 🌍 General
# ==========================================
NODE_ENV=development
# NODE_ENV=production

# ==========================================
# 🗄️ MongoDB Configuration
# ==========================================
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=secure_password_change_me
MONGO_DATABASE=qianlunshop

# ==========================================
# 🔴 Redis Configuration
# ==========================================
REDIS_PASSWORD=secure_redis_password

# ==========================================
# 🔑 JWT Configuration
# ==========================================
JWT_SECRET=your_super_secret_jwt_key_change_in_production_min_32_chars
JWT_EXPIRE=7d

# ==========================================
# 💳 Midtrans Payment Gateway
# ==========================================
# Get from: https://dashboard.midtrans.com/
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
MIDTRANS_IS_PRODUCTION=false

# ==========================================
# 🌐 CORS Configuration
# ==========================================
CORS_ORIGIN=http://localhost:3000

# ==========================================
# 📧 Email Configuration (Optional)
# ==========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# ==========================================
# 📱 Contact Information
# ==========================================
CONTACT_EMAIL=hello@qianlunshop.com
CONTACT_PHONE=+6281234567890
CONTACT_WHATSAPP=+6281234567890

# ==========================================
# 🔒 Security
# ==========================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ==========================================
# 📝 Logging
# ==========================================
LOG_LEVEL=info
# LOG_LEVEL=debug

# ============================================
# 🐳 QIANLUNSHOP BACKEND - Multi-stage Build
# Optimized Node.js Docker Image
# ============================================

# ==========================================
# Stage 1: Base
# ==========================================
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    dumb-init \
    curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# ==========================================
# Stage 2: Dependencies (Development)
# ==========================================
FROM base AS dependencies-dev

# Install all dependencies (including devDependencies)
RUN npm ci --include=dev

# ==========================================
# Stage 3: Dependencies (Production)
# ==========================================
FROM base AS dependencies-prod

# Install only production dependencies
RUN npm ci --omit=dev && \
    npm cache clean --force

# ==========================================
# Stage 4: Development
# ==========================================
FROM base AS development

# Copy dev dependencies
COPY --from=dependencies-dev /app/node_modules ./node_modules

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p logs && chmod 755 logs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start with nodemon for hot reload
CMD ["npm", "run", "dev"]

# ==========================================
# Stage 5: Builder (for production build)
# ==========================================
FROM base AS builder

# Copy prod dependencies
COPY --from=dependencies-prod /app/node_modules ./node_modules

# Copy source
COPY . .

# Build if needed (e.g., TypeScript compilation)
# RUN npm run build

# ==========================================
# Stage 6: Production
# ==========================================
FROM node:20-alpine AS production

# Install dumb-init
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

# Create logs directory with proper permissions
RUN mkdir -p logs && \
    chown -R nodejs:nodejs logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Use dumb-init
ENTRYPOINT ["dumb-init", "--"]

# Start production server
CMD ["node", "server.js"]

# ============================================
# 🌐 QIANLUNSHOP - NGINX CONFIGURATION
# Reverse proxy + Static file server
# ============================================

# Worker configuration
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

# Events configuration
events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    # Basic settings
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;

    # Performance optimizations
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general_limit:10m rate=30r/s;

    # Backend upstream
    upstream backend {
        server backend:5000;
        keepalive 32;
    }

    # ==========================================
    # 🌍 Main Server Block
    # ==========================================
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Security: Hide nginx version
        server_tokens off;

        # ==========================================
        # 📁 Static Files (Frontend)
        # ==========================================
        location / {
            try_files $uri $uri/ /index.html;
            
            # Cache static assets
            location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }

        # ==========================================
        # 🔌 API Proxy (Backend)
        # ==========================================
        location /api/ {
            # Rate limiting
            limit_req zone=api_limit burst=20 nodelay;
            limit_req_status 429;

            # Proxy settings
            proxy_pass http://backend;
            proxy_http_version 1.1;
            
            # Headers
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";

            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;

            # Buffering
            proxy_buffering off;
            proxy_request_buffering off;
        }

        # ==========================================
        # 📊 Health Check Endpoint
        # ==========================================
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # ==========================================
        # 🚫 Deny access to hidden files
        # ==========================================
        location ~ /\. {
            deny all;
            access_log off;
            log_not_found off;
        }

        # ==========================================
        # 🚫 Block common exploit attempts
        # ==========================================
        location ~* (\.php|\.aspx|\.asp|\.jsp)$ {
            deny all;
            access_log off;
            log_not_found off;
        }

        # ==========================================
        # 📝 Custom error pages
        # ==========================================
        error_page 404 /404.html;
        error_page 500 502 503 504 /50x.html;
        
        location = /50x.html {
            root /usr/share/nginx/html;
        }
    }

    # ==========================================
    # 🔒 HTTPS Server Block (Uncomment for SSL)
    # ==========================================
    # server {
    #     listen 443 ssl http2;
    #     server_name yourdomain.com;
    #     
    #     ssl_certificate /etc/nginx/ssl/cert.pem;
    #     ssl_certificate_key /etc/nginx/ssl/key.pem;
    #     ssl_protocols TLSv1.2 TLSv1.3;
    #     ssl_ciphers HIGH:!aNULL:!MD5;
    #     ssl_prefer_server_ciphers on;
    #     ssl_session_cache shared:SSL:10m;
    #     ssl_session_timeout 10m;
    #     
    #     # Add HSTS header
    #     add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    #     
    #     # Same location blocks as above
    #     location / {
    #         try_files $uri $uri/ /index.html;
    #     }
    #     
    #     location /api/ {
    #         proxy_pass http://backend;
    #         # ... same proxy settings
    #     }
    # }
    
    # ==========================================
    # 🔄 HTTP to HTTPS Redirect (Uncomment for SSL)
    # ==========================================
    # server {
    #     listen 80;
    #     server_name yourdomain.com;
    #     return 301 https://$server_name$request_uri;
    # }
}

# ============================================
# 🌐 QIANLUNSHOP NGINX - Frontend Server
# ============================================

FROM nginx:alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Copy frontend files
COPY . /usr/share/nginx/html

# Create cache directory
RUN mkdir -p /var/cache/nginx/client_temp && \
    chown -R nginx:nginx /var/cache/nginx

# Expose ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

{
  "name": "qianlunshop-backend",
  "version": "1.0.0",
  "description": "QianlunShop Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  },
  "keywords": ["ecommerce", "api", "express", "mongodb"],
  "author": "Dhoni Prasetya",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "express-mongo-sanitize": "^2.2.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "validator": "^13.11.0",
    "morgan": "^1.10.0",
    "compression": "^1.7.4",
    "redis": "^4.6.11",
    "midtrans-client": "^1.3.1",
    "nodemailer": "^6.9.7"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "eslint": "^8.56.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}

// ============================================
// 🚀 QIANLUNSHOP BACKEND - Main Server
// ============================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const mongoose = require('mongoose');
require('dotenv').config();

// ==========================================
// 🔧 App Configuration
// ==========================================
const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ==========================================
// 🗄️ Database Connection
// ==========================================
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// ==========================================
// 🛡️ Security Middleware
// ==========================================

// Helmet - Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable for now, configure later
  crossOriginEmbedderPolicy: false
}));

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// ==========================================
// 📊 Middleware
// ==========================================

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ==========================================
// 📍 Routes
// ==========================================

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'QianlunShop API is running',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API Routes (will be added)
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));

// ==========================================
// ❌ Error Handling
// ==========================================

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message: NODE_ENV === 'development' ? message : 'Something went wrong',
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ==========================================
// 🚀 Server Start
// ==========================================

const server = app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║   🐉 QianlunShop Backend Server       ║
  ║   ✅ Running on port ${PORT}              ║
  ║   🌍 Environment: ${NODE_ENV.padEnd(20)}║
  ║   🗄️  Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'.padEnd(18)}║
  ╚════════════════════════════════════════╝
  `);
});

// ==========================================
// 🛑 Graceful Shutdown
// ==========================================

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
    mongoose.connection.close(false, () => {
      console.log('🗄️  MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
    mongoose.connection.close(false, () => {
      console.log('🗄️  MongoDB connection closed');
      process.exit(0);
    });
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;

# ============================================
# 🐳 QIANLUNSHOP - MAKEFILE
# Quick commands for Docker operations
# ============================================

.PHONY: help build up down restart logs clean dev prod

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

## help: Show this help message
help:
	@echo "$(BLUE)╔════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║   🐉 QianlunShop Docker Commands      ║$(NC)"
	@echo "$(BLUE)╚════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@echo "  make dev          - Start development environment"
	@echo "  make logs         - View logs (all services)"
	@echo "  make logs-backend - View backend logs only"
	@echo "  make logs-nginx   - View nginx logs only"
	@echo "  make shell-backend- SSH into backend container"
	@echo ""
	@echo "$(GREEN)Production:$(NC)"
	@echo "  make prod         - Start production environment"
	@echo "  make build        - Build all images"
	@echo "  make rebuild      - Rebuild without cache"
	@echo ""
	@echo "$(GREEN)Control:$(NC)"
	@echo "  make up           - Start all containers"
	@echo "  make down         - Stop all containers"
	@echo "  make restart      - Restart all containers"
	@echo "  make ps           - Show running containers"
	@echo ""
	@echo "$(GREEN)Maintenance:$(NC)"
	@echo "  make clean        - Remove containers, volumes, images"
	@echo "  make clean-all    - Nuclear option (remove everything)"
	@echo "  make backup-db    - Backup MongoDB database"
	@echo "  make restore-db   - Restore MongoDB database"
	@echo ""
	@echo "$(GREEN)Database:$(NC)"
	@echo "  make mongo-shell  - Open MongoDB shell"
	@echo "  make redis-cli    - Open Redis CLI"
	@echo ""

## dev: Start development environment with hot reload
dev:
	@echo "$(GREEN)🚀 Starting development environment...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✅ Development environment started!$(NC)"
	@echo "$(BLUE)Frontend: http://localhost$(NC)"
	@echo "$(BLUE)Backend:  http://localhost:5000$(NC)"
	@echo "$(BLUE)MongoDB:  mongodb://localhost:27017$(NC)"
	@echo "$(BLUE)Redis:    redis://localhost:6379$(NC)"

## prod: Start production environment
prod:
	@echo "$(GREEN)🚀 Starting production environment...$(NC)"
	NODE_ENV=production docker-compose up -d
	@echo "$(GREEN)✅ Production environment started!$(NC)"

## build: Build all Docker images
build:
	@echo "$(BLUE)🔨 Building Docker images...$(NC)"
	docker-compose build
	@echo "$(GREEN)✅ Build complete!$(NC)"

## rebuild: Rebuild without cache
rebuild:
	@echo "$(BLUE)🔨 Rebuilding without cache...$(NC)"
	docker-compose build --no-cache
	@echo "$(GREEN)✅ Rebuild complete!$(NC)"

## up: Start all containers
up:
	docker-compose up -d

## down: Stop all containers
down:
	@echo "$(YELLOW)⏹️  Stopping containers...$(NC)"
	docker-compose down
	@echo "$(GREEN)✅ Containers stopped$(NC)"

## restart: Restart all containers
restart: down up
	@echo "$(GREEN)✅ Containers restarted$(NC)"

## logs: View logs from all services
logs:
	docker-compose logs -f

## logs-backend: View backend logs only
logs-backend:
	docker-compose logs -f backend

## logs-nginx: View nginx logs only
logs-nginx:
	docker-compose logs -f nginx

## logs-mongodb: View MongoDB logs
logs-mongodb:
	docker-compose logs -f mongodb

## ps: Show running containers
ps:
	docker-compose ps

## shell-backend: SSH into backend container
shell-backend:
	docker-compose exec backend sh

## shell-nginx: SSH into nginx container
shell-nginx:
	docker-compose exec nginx sh

## mongo-shell: Open MongoDB shell
mongo-shell:
	docker-compose exec mongodb mongosh -u admin -p secure_password_change_me

## redis-cli: Open Redis CLI
redis-cli:
	docker-compose exec redis redis-cli -a secure_redis_password

## backup-db: Backup MongoDB database
backup-db:
	@echo "$(BLUE)💾 Backing up database...$(NC)"
	@mkdir -p ./backups
	docker-compose exec -T mongodb mongodump \
		--uri="mongodb://admin:secure_password_change_me@localhost:27017/qianlunshop?authSource=admin" \
		--out=/data/backup_$(shell date +%Y%m%d_%H%M%S)
	@echo "$(GREEN)✅ Database backed up!$(NC)"

## restore-db: Restore MongoDB database (usage: make restore-db BACKUP=backup_20240101_120000)
restore-db:
	@echo "$(BLUE)📥 Restoring database...$(NC)"
	docker-compose exec mongodb mongorestore \
		--uri="mongodb://admin:secure_password_change_me@localhost:27017" \
		/data/$(BACKUP)
	@echo "$(GREEN)✅ Database restored!$(NC)"

## clean: Remove containers and volumes
clean:
	@echo "$(RED)🧹 Cleaning up...$(NC)"
	docker-compose down -v
	@echo "$(GREEN)✅ Cleanup complete!$(NC)"

## clean-all: Nuclear option - remove everything
clean-all:
	@echo "$(RED)☢️  NUCLEAR CLEANUP - Removing everything...$(NC)"
	docker-compose down -v --rmi all --remove-orphans
	docker system prune -af --volumes
	@echo "$(GREEN)✅ Everything cleaned!$(NC)"

## install-backend: Install backend dependencies
install-backend:
	@echo "$(BLUE)📦 Installing backend dependencies...$(NC)"
	cd backend && npm install
	@echo "$(GREEN)✅ Dependencies installed!$(NC)"

## test-backend: Run backend tests
test-backend:
	docker-compose exec backend npm test

## seed-db: Seed database with sample data
seed-db:
	@echo "$(BLUE)🌱 Seeding database...$(NC)"
	docker-compose exec backend npm run seed
	@echo "$(GREEN)✅ Database seeded!$(NC)"

## health: Check health of all services
health:
	@echo "$(BLUE)🏥 Checking service health...$(NC)"
	@curl -s http://localhost/health | jq .
	@curl -s http://localhost:5000/api/health | jq .
	@echo "$(GREEN)✅ Health check complete!$(NC)"