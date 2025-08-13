#!/bin/bash

# Database Reset Script for OptiStaff Development
# This script resets the local Supabase database to the exported state

set -e  # Exit on any error

echo "� OptiStaff Database Reset Script"
echo "ℹ️  If you get permission errors, run: chmod +x scripts/reset-db.sh"
echo ""

echo "�🛑 Stopping Supabase..."
supabase stop 2>/dev/null || echo "Supabase was not running"

echo "🔄 Starting fresh Supabase instance..."
supabase start

echo "⏳ Waiting for services to be ready..."
sleep 5

echo "📊 Loading database state..."

# Apply the full database dump using Docker
if [ -f "supabase/local_full_dump.sql" ]; then
    echo "Applying full database dump..."
    # Use the specific container name for this project
    CONTAINER_NAME="supabase_db_optistaff-main"
    
    # Check if container exists
    if docker ps --filter "name=$CONTAINER_NAME" --format "{{.Names}}" | grep -q "$CONTAINER_NAME"; then
        # Copy file to container and execute
        docker cp supabase/local_full_dump.sql $CONTAINER_NAME:/tmp/dump.sql
        echo "Setting replica mode..."
        docker exec $CONTAINER_NAME psql -U postgres -d postgres -c "SET session_replication_role = replica;"
        echo "Applying database dump..."
        docker exec $CONTAINER_NAME psql -U postgres -d postgres -f /tmp/dump.sql
        echo "Resetting session mode..."
        docker exec $CONTAINER_NAME psql -U postgres -d postgres -c "SET session_replication_role = DEFAULT;"
        docker exec $CONTAINER_NAME rm /tmp/dump.sql
    else
        echo "❌ Error: Could not find Postgres container '$CONTAINER_NAME'"
        echo "Available containers:"
        docker ps --format "{{.Names}}"
        exit 1
    fi
else
    echo "❌ Error: supabase/local_full_dump.sql not found!"
    echo "Please make sure you have the exported database files."
    exit 1
fi

echo "✅ Database reset complete!"

echo "🧪 Running auth tests to verify..."
if npm run test tests/integration/uc2/useAuth-login.test.ts; then
    echo "🎉 Tests are passing! Database sync successful."
else
    echo "⚠️  Tests failed. Check the output above for issues."
    echo "You may need to:"
    echo "  1. Check your .env files"
    echo "  2. Verify Node.js version matches team"
    echo "  3. Clear npm cache and reinstall dependencies"
fi

echo ""
echo "📋 Supabase services status:"
supabase status
