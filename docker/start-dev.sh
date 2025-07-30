#!/bin/bash

echo "🚀 Starting iPrompt Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start services
echo "📦 Building and starting Docker containers..."
docker compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check services status
echo "✅ Services status:"
docker compose ps

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "📱 Access the application:"
echo "   - Web Frontend: http://localhost:13000"
echo "   - API Backend: http://localhost:18080"
echo "   - PostgreSQL: localhost:15432"
echo "   - Redis: localhost:16379"
echo ""
echo "📝 View logs:"
echo "   docker compose logs -f"
echo ""
echo "🛑 Stop services:"
echo "   docker compose down"