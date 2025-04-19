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
 * Simple implementation that converts an image file to a data URL
 * This avoids Supabase storage issues for testing purposes
 */
export async function uploadImage(file: File, userId: string): Promise<string | null> {
  console.log('Processing image for user:', userId);
  
  try {
    // Read the file as a data URL
    return await readFileAsDataURL(file);
  } catch (error) {
    console.error('Error processing image:', error);
    return null;
  }
}

/**
 * Convert a file to a data URL
 */
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result as string);
    };
    
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}
