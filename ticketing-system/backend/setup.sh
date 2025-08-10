#!/bin/bash

echo "🚀 Setting up FeathersUp Ticketing System Backend..."
echo "📍 Location: FeathersUp.ai/ticketing-system/"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if Docker is installed (optional)
if command -v docker &> /dev/null; then
    echo "✅ Docker is installed"
    DOCKER_AVAILABLE=true
else
    echo "⚠️  Docker is not installed. You'll need to set up PostgreSQL manually."
    DOCKER_AVAILABLE=false
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Creating .env file..."
    cp env.example .env
    echo "✅ .env file created. Please edit it with your database credentials."
else
    echo "✅ .env file already exists"
fi

# Start database if Docker is available
if [ "$DOCKER_AVAILABLE" = true ]; then
    echo "🐳 Starting PostgreSQL database with Docker..."
    docker-compose up -d postgres
    
    if [ $? -eq 0 ]; then
        echo "✅ Database started successfully"
        echo "📊 PostgreSQL is running on localhost:5432"
        echo "🔧 PgAdmin is available at http://localhost:5050"
        echo "   Email: admin@feathersup.com"
        echo "   Password: admin123"
    else
        echo "❌ Failed to start database"
        exit 1
    fi
else
    echo "⚠️  Please set up PostgreSQL manually and update your .env file"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📍 Project Location: FeathersUp.ai/ticketing-system/"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your database credentials"
echo "2. Start the development server: npm run dev"
echo "3. Test the API: curl http://localhost:3000/health"
echo ""
echo "📚 For more information, check the README.md file"
echo "🏠 To return to main project: cd .." 