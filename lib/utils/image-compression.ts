import imageCompression from 'browser-image-compression';
import { createClient } from '../supabase/client';

export async function compressAndUploadImage(
  file: File,
  bucket: string,
  path: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    const options = {
      maxSizeMB: 0.5, // 500KB
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      fileType: 'image/webp',
    };
    
    // 1. Compress
    const compressedFile = await imageCompression(file, options);
    
    // 2. Upload
    const supabase = createClient();
    const fileName = `${Date.now()}-${path.replace(/[^a-zA-Z0-9]/g, '-')}.webp`;
    const fullPath = `${path}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fullPath, compressedFile, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/webp',
      });

    if (error) {
      console.error('Upload Error:', error);
      return { url: null, error: error.message };
    }

    // 3. Get Public URL
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fullPath);
    return { url: publicUrlData.publicUrl, error: null };

  } catch (error: any) {
    console.error('Compression/Upload Error:', error);
    return { url: null, error: error.message };
  }
}
