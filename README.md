# Travel Diary

A React-based travel diary application that captures and stores user memories with advanced media and location tracking capabilities.

## Features

- User authentication with Supabase
- Create diary entries with photos and captions
- Automatic location tracking
- Share entries via links
- Responsive design for mobile and desktop

## Technologies

- React (Frontend)
- Express (Backend)
- Supabase (Authentication)
- TypeScript
- Tailwind CSS (Styling)
- Drizzle ORM

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SESSION_SECRET=random_secret_string
   ```
4. Start the development server: `npm run dev`
5. Open your browser to the displayed URL

## Deployment to Vercel

### Prerequisites

1. Create a Vercel account if you don't have one already
2. Install the Vercel CLI: `npm i -g vercel`

### Deployment Steps

1. **Build the application locally first**: 
   ```
   npm run build
   ```

2. **Configure environment variables**:
   - In the Vercel dashboard, go to your project settings
   - Add the following environment variables:
     ```
     SUPABASE_URL=your_supabase_url
     SUPABASE_SERVICE_KEY=your_supabase_service_key
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     SESSION_SECRET=random_secret_string
     NODE_ENV=production
     ```

3. **Deploy to Vercel**:
   ```
   vercel
   ```

4. **Troubleshooting Deployment Issues**:
   - If you get a function invocation error (500):
     - Check that all environment variables are set correctly
     - Review the function logs in Vercel dashboard
     - Make sure Supabase credentials are valid

### Alternative Deployment Method

You can also connect your GitHub repository to Vercel for automatic deployments:

1. Push your code to GitHub
2. In Vercel dashboard, import the GitHub repository
3. Configure the environment variables as above
4. Vercel will build and deploy your application automatically

## Development Notes

- Images are stored as optimized data URLs (not in Supabase storage)
- The app uses a memory storage by default, data will be reset when the server restarts
- Maximum image size: 50MB (configured in Express)