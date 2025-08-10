#!/bin/bash

echo "🚀 Starting FeathersUp Ticketing System Frontend..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed successfully"
else
    echo "✅ Dependencies already installed"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from example..."
    if [ -f "env.example" ]; then
        cp env.example .env
        echo "✅ .env file created from env.example"
        echo "⚠️  Please review and update the .env file with your configuration"
    else
        echo "⚠️  No env.example file found. Please create a .env file manually."
    fi
fi

echo ""
echo "🎯 Starting development server..."
echo "📱 The app will open at: http://localhost:3001"
echo "🔄 Press Ctrl+C to stop the server"
echo ""

# Start the development server
npm start 