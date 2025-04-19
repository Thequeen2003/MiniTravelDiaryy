#!/bin/bash
set -e

echo "🛠 Building Vite frontend..."
npm run build # Make sure this runs your Vite build, or replace with vite build

echo "📦 Compiling Express server..."
tsc server/index.ts --outDir dist/server

echo "📁 Renaming to vercel-server.js..."
mv dist/server/index.js dist/server/vercel-server.js

echo "✅ Build complete."