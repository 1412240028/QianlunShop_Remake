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
	@echo "  make build        - Build all Docker images"
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
