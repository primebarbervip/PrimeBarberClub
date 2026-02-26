#!/bin/bash
set -e

echo "Running Prisma migrations..."
cd /vercel/share/v0-project

# Run migrations to sync database with schema
npx prisma migrate deploy

echo "Migration completed successfully!"
