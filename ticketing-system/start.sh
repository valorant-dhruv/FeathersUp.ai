#!/bin/bash

echo "🚀 Starting FeathersUp Ticketing System..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start database
echo "📦 Starting PostgreSQL database..."
docker-compose up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Install dependencies if node_modules doesn't exist
if [ ! -d "backend/node_modules" ]; then
    echo "📥 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Check if .env exists in backend
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env file not found. Please create one from backend/env.example"
    echo "   cd backend && cp env.example .env && cd .."
    exit 1
fi

echo "✅ Setup complete!"
echo ""
echo "To start development:"
echo "  Backend:  npm run dev:backend"
echo "  Frontend: npm run dev:frontend"
echo "  Both:     npm run dev"
echo ""
echo "Database: http://localhost:5432"
echo "PgAdmin:  http://localhost:5050"
echo "Backend:  http://localhost:3000"
echo "Frontend: http://localhost:3001" 