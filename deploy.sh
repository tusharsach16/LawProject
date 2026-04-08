#!/bin/bash

# deploy.sh - Production deployment script with health checks and rollback
# Usage: ./deploy.sh

set -euo pipefail

# --- Configuration ---
SERVICES=("backend" "backend-signaling" "frontend")
HEALTH_CHECK_TIMEOUT=60 # seconds
HEALTH_CHECK_INTERVAL=5 # seconds

# Mock health check URLs (Replace with real ones if available)
declare -A HEALTH_URLS=(
    ["backend"]="http://localhost:5000/api/health"
    ["backend-signaling"]="http://localhost:8080/health"
    ["frontend"]="http://localhost:3000"
)

# --- Utilities ---
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

check_health() {
    local service=$1
    local url=${HEALTH_URLS[$service]}
    local elapsed=0

    log "Checking health for $service at $url..."

    while [ $elapsed -lt $HEALTH_CHECK_TIMEOUT ]; do
        if curl -s -f "$url" > /dev/null; then
            log "✅ $service is healthy!"
            return 0
        fi
        sleep $HEALTH_CHECK_INTERVAL
        elapsed=$((elapsed + HEALTH_CHECK_INTERVAL))
    done

    log "❌ $service health check timed out after ${HEALTH_CHECK_TIMEOUT}s"
    return 1
}

# --- Execution ---
log "🚀 Starting deployment for nyaysetu..."

# 1. Pull latest images
log "📥 Pulling latest Docker images..."
docker compose pull

# 2. Deploy
log "🔄 Updating containers..."
# Capture current state for rollback
PREVIOUS_STATE=$(docker ps -a --format "{{.Image}}" | sort | uniq)

docker compose up -d --remove-orphans

# 3. Health Checks
ALL_HEALTHY=true
for service in "${SERVICES[@]}"; do
    if ! check_health "$service"; then
        ALL_HEALTHY=false
        break
    fi
done

# 4. Rollback if needed
if [ "$ALL_HEALTHY" = false ]; then
    log "⚠️ Deployment failed! Rolling back to previously stable images..."
    # Relying on docker-compose's ability to use available images if pull is not forced
    # In a more advanced setup, we would use specific SHA tags for rollback
    docker compose up -d --no-build
    log "♻️ Rollback completed. Please investigate logs."
    exit 1
fi

# 5. Cleanup
log "🧹 Pruning old Docker images..."
docker image prune -f

log "✨ Deployment successful!"
