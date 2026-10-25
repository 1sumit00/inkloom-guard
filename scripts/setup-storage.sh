#!/usr/bin/env bash
set -e

echo "=========================================================="
echo " Inkloom Guard Infrastructure Setup (Postgres, Qdrant, MinIO)"
echo "=========================================================="

# Check Docker daemon availability
if ! docker info >/dev/null 2>&1; then
    echo "⚠️ Docker daemon is not running yet."
    echo "Please start the Docker service with:"
    echo "  sudo systemctl start docker   # OR sudo service docker start"
    exit 1
fi

echo "✓ Docker daemon detected."

# 1. Start core data layer: PostgreSQL, Qdrant, MinIO, Redis
echo "Starting PostgreSQL (pgvector), Qdrant, MinIO, and Redis..."
docker compose up -d postgres qdrant minio minio-init redis

echo "Waiting for services to become healthy..."
docker compose ps

echo "=========================================================="
echo " Infrastructure services started successfully!"
echo " - PostgreSQL: localhost:5432 (DB: inkloom_guard)"
echo " - Qdrant:     localhost:6333 (Web UI: http://localhost:6333/dashboard)"
echo " - MinIO S3:   localhost:9000 (Console: http://localhost:9001)"
echo "=========================================================="
