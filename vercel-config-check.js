// This script checks if your project is properly configured for Vercel deployment
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Vercel configuration...');

// Check if required files exist
const requiredFiles = [
  'vercel.json',
  'vercel-server.js',
  '.env.production'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  try {
    const exists = fs.existsSync(path.join(process.cwd(), file));
    if (exists) {
      console.log(`✅ ${file} exists`);
    } else {
      console.error(`❌ ${file} does not exist`);
      allFilesExist = false;
    }
  } catch (err) {
    console.error(`❌ Error checking ${file}: ${err.message}`);
    allFilesExist = false;
  }
});

// Check vercel.json
try {
  const vercelConfig = require('./vercel.json');
  
  console.log('\n📄 Checking vercel.json configuration...');
  
  // Check builds section
  if (vercelConfig.builds && Array.isArray(vercelConfig.builds) && vercelConfig.builds.length > 0) {
    console.log('✅ builds section is defined');
    
    // Check if builds point to the correct file
    const hasCorrectBuild = vercelConfig.builds.some(build => 
      build.src === 'vercel-server.js' && build.use === '@vercel/node'
    );
    
    if (hasCorrectBuild) {
      console.log('✅ builds section correctly references vercel-server.js');
    } else {
      console.warn('⚠️ builds section may not be correctly configured');
    }
  } else {
    console.error('❌ builds section is missing or empty');
  }
  
  // Check routes section
  if (vercelConfig.routes && Array.isArray(vercelConfig.routes) && vercelConfig.routes.length > 0) {
    console.log('✅ routes section is defined');
    
    // Check API routes
    const hasApiRoute = vercelConfig.routes.some(route => 
      route.src && route.src.includes('/api/') && route.dest
    );
    
    if (hasApiRoute) {
      console.log('✅ API routes are defined');
    } else {
      console.warn('⚠️ API routes may not be correctly configured');
    }
    
    // Check catch-all route
    const hasCatchAllRoute = vercelConfig.routes.some(route => 
      route.src === '/(.*)' && route.dest
    );
    
    if (hasCatchAllRoute) {
      console.log('✅ Catch-all route is defined');
    } else {
      console.warn('⚠️ Catch-all route may not be correctly configured');
    }
  } else {
    console.error('❌ routes section is missing or empty');
  }
  
  // Check env section
  if (vercelConfig.env) {
    console.log('✅ env section is defined');
    
    if (vercelConfig.env.NODE_ENV) {
      console.log('✅ NODE_ENV is defined');
    } else {
      console.warn('⚠️ NODE_ENV is not defined in the env section');
    }
    
    if (vercelConfig.env.SESSION_SECRET) {
      console.log('✅ SESSION_SECRET is defined');
    } else {
      console.warn('⚠️ SESSION_SECRET is not defined in the env section');
    }
  } else {
    console.warn('⚠️ env section is not defined');
  }
} catch (err) {
  console.error(`❌ Error checking vercel.json: ${err.message}`);
}

// Final status
console.log('\n📝 Vercel configuration check summary:');
if (allFilesExist) {
  console.log('✅ All required files exist');
} else {
  console.error('❌ Some required files are missing');
}

console.log('\n🔧 Next steps:');
console.log('1. Ensure all environment variables are configured in Vercel');
console.log('2. Deploy the application using the Vercel CLI or GitHub integration');
console.log('3. Check the deployment logs for any errors');
console.log('\nRefer to vercel-deployment-guide.md for more information');