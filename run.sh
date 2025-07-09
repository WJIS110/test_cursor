#!/bin/bash

# Activate virtual environment and run the Mesop todo list application

echo "🚀 Starting Mesop Todo List Application..."
echo "=========================================="

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run:"
    echo "   python3 -m venv venv"
    echo "   source venv/bin/activate"
    echo "   pip install -r requirements.txt"
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Check if mesop is installed
if ! command -v mesop &> /dev/null; then
    echo "❌ Mesop not found. Installing dependencies..."
    pip install -r requirements.txt
fi

echo "✅ Starting Mesop development server..."
echo "📱 The application will be available at: http://localhost:32123"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Check for demo flag
if [ "$1" = "demo" ]; then
    echo "🎬 Running in DEMO mode with sample data..."
    mesop demo.py
else
    echo "▶️  Running the main application..."
    mesop main.py
fi