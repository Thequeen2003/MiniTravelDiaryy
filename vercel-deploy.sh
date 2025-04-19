#!/bin/bash

# This script helps prepare the project for Vercel deployment
echo "Preparing for Vercel deployment..."

# Step 1: Build the client
echo "Building client..."
npm run build

# Step 2: Create a copy of vercel-server.js with correct imports
echo "Setting up server for Vercel..."
cp server/vercel-server.js dist/vercel-server.js

# Step 3: Create a vercel.output directory if it doesn't exist
mkdir -p .vercel/output/static

# Step 4: Copy dist files to Vercel output directory
echo "Copying static assets..."
cp -r dist/* .vercel/output/static/

echo "Deployment preparation complete!"
echo "Now run 'vercel deploy' to deploy your application."