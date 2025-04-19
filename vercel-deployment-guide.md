# Vercel Deployment Guide for Mini Travel Diary

## Preparation Steps

1. **Create a `.env` file**: This should include all your environment variables:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SESSION_SECRET=your_session_secret
   ```

2. **Create a `vercel.json` file** in the root directory:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "/dist/index.js"
       },
       {
         "src": "/(.*)",
         "dest": "/dist/$1"
       }
     ]
   }
   ```

## Deployment Process

### Option 1: Using Vercel CLI

1. Install Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Login to Vercel:
   ```
   vercel login
   ```

3. Deploy your project:
   ```
   vercel
   ```

4. When prompted, setup environment variables from your .env file

### Option 2: Using GitHub and Vercel Dashboard

1. Push your code to GitHub:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/mini-travel-diary.git
   git push -u origin main
   ```

2. Import your repository in the Vercel dashboard:
   - Go to https://vercel.com/new
   - Select your GitHub repository
   - Configure your project:
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Development Command: `npm run dev`

3. Set up environment variables:
   - Go to the "Environment Variables" section
   - Add all the variables from your `.env` file

4. Deploy the project

## Troubleshooting

If you encounter a "404 NOT_FOUND" error:

1. **Check Vercel logs**: Go to your Vercel dashboard > Project > Deployments > Latest Deployment > View Logs

2. **Build locally first**:
   ```
   npm run build
   ```
   Ensure it builds successfully before deploying

3. **Try with a Node.js specific preset**:
   - In Vercel dashboard, go to Project Settings > General > Build & Development Settings
   - Set Framework Preset to "Node.js"

4. **Configure Vercel CLI output**:
   ```
   vercel -d
   ```
   This will show detailed debugging information during deployment

5. **Consider using a different server setup**:
   - You might need to separate the frontend and backend for easier deployment to Vercel
   - Vercel is optimized for frontend deployments, so a separate backend hosting might work better

## Alternative Deployment Options

If Vercel continues to present challenges, consider:

1. **Render.com**: Excellent for full-stack JavaScript applications
2. **Railway.app**: Simple deployment for Node.js applications
3. **Netlify**: Good alternative for frontend with serverless functions