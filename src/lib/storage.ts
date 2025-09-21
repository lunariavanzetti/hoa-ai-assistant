import { supabase } from './supabase'

export interface UploadResult {
  url: string
  path: string
}

class StorageService {
  private bucket = 'violation-photos'

  async uploadPhoto(file: File, violationId?: string): Promise<UploadResult> {
    try {
      // Skip bucket check since we know it exists from your SQL verification

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${violationId || Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `violations/${fileName}`


      // Skip auth check - let Supabase storage policies handle it
      
      // Try the simplest possible upload
      const { data, error } = await supabase.storage
        .from(this.bucket)
        .upload(filePath, file)

      if (error) {
          message: error.message,
          name: error.name
        })
        
        // If bucket doesn't exist, try to create it
        if (error.message.includes('Bucket not found') || error.message.includes('bucket does not exist')) {
          await this.createBucket()
          
          // Retry upload
          const { data: retryData, error: retryError } = await supabase.storage
            .from(this.bucket)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            })
            
          if (retryError) {
            throw new Error(`Upload failed after bucket creation: ${retryError.message}`)
          }
          
          
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from(this.bucket)
            .getPublicUrl(retryData.path)

          return {
            url: publicUrl,
            path: retryData.path
          }
        }
        
        // More specific error messages
        if (error.message.includes('insufficient_scope') || error.message.includes('access_denied')) {
          throw new Error('Storage permission denied. Please check your Supabase storage policies.')
        }
        
        if (error.message.includes('payload_too_large')) {
          throw new Error('File too large. Please choose a smaller image (under 10MB).')
        }
        
        throw new Error(`Upload failed: ${error.message}`)
      }


      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.bucket)
        .getPublicUrl(data.path)

      return {
        url: publicUrl,
        path: data.path
      }
    } catch (error) {
      throw error
    }
  }

  async deletePhoto(path: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(this.bucket)
        .remove([path])

      if (error) {
        throw new Error(`Delete failed: ${error.message}`)
      }
    } catch (error) {
      throw error
    }
  }

  // Ensure bucket exists before upload
  private async ensureBucketExists(): Promise<void> {
    try {
      
      // First check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()
      
      if (listError) {
        throw new Error(`Cannot list buckets: ${listError.message}`)
      }
      
      const bucketExists = buckets?.some(bucket => bucket.id === this.bucket)
      
      if (!bucketExists) {
        const { error } = await supabase.storage.createBucket(this.bucket, {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
          fileSizeLimit: 10485760 // 10MB
        })

        if (error && !error.message.includes('already exists')) {
          throw new Error(`Bucket creation failed: ${error.message}`)
        }
      } else {
      }
    } catch (error) {
      throw error // Throw here so we know about the problem
    }
  }

  // Create bucket if it doesn't exist (call this during setup)
  async createBucket(): Promise<void> {
    return this.ensureBucketExists()
  }
}

export const storageService = new StorageService()