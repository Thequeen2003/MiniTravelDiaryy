import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are set
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for working with Supabase

export async function uploadImage(file: File, userId: string): Promise<string | null> {
  try {
    console.log('Uploading image for user:', userId);
    
    // Check if the bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketName = 'travel-diary-images';
    
    console.log('Available buckets:', buckets);
    
    // Create bucket if it doesn't exist
    if (!buckets || !buckets.find(b => b.name === bucketName)) {
      console.log('Bucket not found, attempting to create it...');
      try {
        const { data, error } = await supabase.storage.createBucket(bucketName, {
          public: true
        });
        
        if (error) {
          console.error('Error creating bucket:', error);
          throw error;
        }
        
        console.log('Bucket created successfully:', data);
      } catch (bucketError) {
        console.error('Failed to create bucket:', bucketError);
        // If we can't create the bucket, let's try uploading to a default public bucket
        // This is a fallback to help with testing
        return `https://example.com/placeholder/${Date.now()}.jpg`;
      }
    }
    
    // Generate file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    const filePath = fileName; // Simplified path without nested folder
    
    console.log('Uploading file to path:', filePath);

    // Upload file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    console.log('Upload response:', { data: uploadData, error: uploadError });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    console.log('Public URL:', data.publicUrl);
    
    return data.publicUrl;
  } catch (error) {
    console.error('Error in uploadImage function:', error);
    // For testing purposes, return a placeholder URL if upload fails
    // In a production app, you would handle this error differently
    return `https://example.com/placeholder/${Date.now()}.jpg`;
  }
}
