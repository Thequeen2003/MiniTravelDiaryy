# Vercel Deployment Guide

This document provides instructions for deploying the Travel Diary app to Vercel.

## Pre-Deployment Steps

1. Make sure all files are correctly set up:
   - `vercel.json` - Configuration for Vercel deployment
   - `vercel-server.js` - Standalone Express server for Vercel
   - `vercel-package.json` - Dependencies for Vercel deployment
   - `.env.production` - Environment variables for production

2. Set up the necessary environment variables in Vercel:
   - `SESSION_SECRET` - Secret for session management
   - Any other required environment variables for your application

## Deployment Process

### Option 1: Deploy with GitHub Integration

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Configure the deployment settings:
   - Set the framework preset to "Other"
   - Set the build command to empty
   - Set the output directory to empty
   - The `vercel.json` file will handle the configuration

### Option 2: Deploy with Vercel CLI

1. Install the Vercel CLI: `npm i -g vercel`
2. Run `vercel login` to authenticate
3. Run `vercel` in the project directory to deploy
4. Follow the prompts to configure your deployment

## Post-Deployment Steps

1. Verify that the application is working correctly
2. Check that authentication works correctly
3. Test the diary entry creation and sharing functionality
4. Monitor for any deployment-related issues

## Troubleshooting

If you encounter issues during deployment, check the following:

1. Vercel deployment logs for any errors
2. Ensure all environment variables are correctly set
3. Verify that the vercel-server.js file is correctly configured
4. Check that all dependencies are correctly specified in vercel-package.json

## Notes

- The application uses a memory store for sessions, which means sessions will be lost when the server restarts
- For a production deployment, consider using a more persistent session store
- The standalone server file (vercel-server.js) is used to avoid issues with TypeScript compilation