#!/bin/bash

# PicMoney Dashboard - Development Startup Script
echo "🚀 Starting PicMoney Dashboard Development Environment"
echo "=================================================="

# Kill existing processes
echo "🔄 Cleaning up existing processes..."
pkill -f "node.*server.js" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
lsof -ti:3002 | xargs -r kill -9 2>/dev/null || true
lsof -ti:5173 | xargs -r kill -9 2>/dev/null || true

# Wait a moment for cleanup
sleep 2

# Function to start backend
start_backend() {
    echo "🔧 Starting Backend Server..."
    cd "src/Entrega1/Backend"
    npm run dev &
    BACKEND_PID=$!
    echo "Backend started with PID: $BACKEND_PID"
    cd ../../..
}

# Function to start frontend
start_frontend() {
    echo "🎨 Starting Frontend Server..."
    cd "src/Entrega1/Frontend"
    npm run dev &
    FRONTEND_PID=$!
    echo "Frontend started with PID: $FRONTEND_PID"
    cd ../../..
}

# Start servers
start_backend
sleep 5  # Give backend time to start
start_frontend

echo ""
echo "✅ Both servers are starting up!"
echo "📊 Backend API: http://localhost:3002/api"
echo "🌐 Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo "🔄 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    pkill -f "node.*server.js" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
    echo "✅ All servers stopped"
    exit 0
}

# Set up signal handling
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait