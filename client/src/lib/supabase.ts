import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are set
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for working with Supabase

/**
 * Optimize and convert an image file to a data URL
 * This avoids Supabase storage issues and reduces payload size
 */
export async function uploadImage(file: File, userId: string): Promise<string | null> {
  console.log('Processing image for user:', userId);
  
  try {
    // Resize and compress the image before converting to data URL
    const optimizedImage = await resizeAndCompressImage(file, 800);
    return await readFileAsDataURL(optimizedImage);
  } catch (error) {
    console.error('Error processing image:', error);
    return null;
  }
}

/**
 * Resize and compress an image to reduce its size
 */
function resizeAndCompressImage(file: File, maxWidth: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        // Draw resized image on canvas
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          'image/jpeg', // Convert to JPEG for better compression
          0.7 // Compression quality (0.7 = 70%)
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = event.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Convert a file to a data URL
 */
function readFileAsDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result as string);
    };
    
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(blob);
  });
}
