import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Run the build command
console.log('Building client and server...');
exec('npm run build', (error, stdout, stderr) => {
  if (error) {
    console.error(`Build error: ${error}`);
    return;
  }
  console.log(stdout);
  
  if (stderr) {
    console.error(`Build stderr: ${stderr}`);
  }
  
  console.log('Build completed successfully.');
  
  // Create necessary directories for Vercel
  const vercelOutput = path.join(__dirname, '..', '.vercel', 'output');
  const staticDir = path.join(vercelOutput, 'static');
  
  // Make directories if they don't exist
  if (!fs.existsSync(vercelOutput)) {
    fs.mkdirSync(vercelOutput, { recursive: true });
  }
  
  if (!fs.existsSync(staticDir)) {
    fs.mkdirSync(staticDir, { recursive: true });
  }
  
  // Copy static assets to Vercel output directory
  const distDir = path.join(__dirname, '..', 'dist');
  if (fs.existsSync(distDir)) {
    fs.cpSync(distDir, staticDir, { recursive: true });
    console.log('Static assets copied to Vercel output directory.');
  } else {
    console.error('Dist directory does not exist. Build may not have completed properly.');
  }
  
  console.log('Vercel build setup completed.');
});