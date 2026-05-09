#!/bin/bash

# Create Folder Structure
mkdir -p trade-wave/apps/api/app/api/endpoints
mkdir -p trade-wave/apps/api/app/core
mkdir -p trade-wave/apps/api/app/models
mkdir -p trade-wave/apps/api/app/schemas
mkdir -p trade-wave/apps/api/app/workers
mkdir -p trade-wave/apps/web/app/admin
mkdir -p trade-wave/apps/web/components/news

# Initialize Docker Compose
cat <<EOF > trade-wave/docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: tradewave
    ports:
      - "5432:5432"
  redis:
    image: redis:7
    ports:
      - "6379:6379"
EOF

# Initialize FastAPI Main
cat <<EOF > trade-wave/apps/api/main.py
from fastapi import FastAPI
from app.api.endpoints import articles

app = FastAPI(title="TradeWave API")
app.include_router(articles.router, prefix="/api/v1/articles", tags=["Articles"])

@app.get("/")
async def root():
    return {"message": "TradeWave Backend Active"}
EOF

# Note: You would repeat this for the models, workers, and Next.js components 
# provided in our previous turns.
echo "Project structure for TradeWave has been created!"
