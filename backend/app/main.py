"""
Inkloom Guard SaaS - FastAPI Application Entrypoint
Zero hardcoded secrets; configuration loaded from environment variables.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.scans import router as scans_router
from app.api.v1.vault import router as vault_router
from app.api.v1.workflows import router as workflows_router
from app.api.v1.analytics import router as analytics_router

app = FastAPI(
    title="Inkloom Guard API",
    description="Intelligent Brand-Governance & Pre-Publication Multi-Modal Co-Pilot",
    version="2.4.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration allowing local frontend development & cloud deployments (e.g. Vercel)
raw_origins = os.getenv("ALLOWED_ORIGINS", "*")
if raw_origins.strip() == "*":
    allowed_origins = ["*"]
    allow_credentials = False
else:
    allowed_origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
    allow_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API v1 Routers
app.include_router(scans_router)
app.include_router(vault_router)
app.include_router(workflows_router)
app.include_router(analytics_router)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Inkloom Guard API",
        "version": "2.4.0",
        "responsible_ai_policy": "Zero-Retention Verified"
    }

@app.get("/")
async def root():
    return {
        "message": "Welcome to Inkloom Guard API v2.4 Enterprise",
        "documentation": "/docs"
    }
