import { supabase } from './supabase'

export interface UploadResult {
  url: string
  path: string
}

class StorageService {
  private bucket = 'violation-photos'

  async uploadPhoto(file: File, violationId?: string): Promise<UploadResult> {
    try {
      // First ensure bucket exists
      console.log('📤 Starting upload with bucket check...')
      await this.ensureBucketExists()

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${violationId || Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `violations/${fileName}`

      console.log('📁 Uploading to bucket:', this.bucket, 'file path:', filePath)

      // Upload file to Supabase Storage (no timeout - let Supabase handle it)
      const { data, error } = await supabase.storage
        .from(this.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('❌ Supabase upload error:', error)
        console.error('❌ Error details:', {
          message: error.message,
          name: error.name
        })
        
        // If bucket doesn't exist, try to create it
        if (error.message.includes('Bucket not found') || error.message.includes('bucket does not exist')) {
          console.log('🏗️ Bucket not found, creating...')
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
          
          console.log('✅ Upload successful after bucket creation')
          
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

      console.log('✅ Upload successful, getting public URL...')

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.bucket)
        .getPublicUrl(data.path)

      return {
        url: publicUrl,
        path: data.path
      }
    } catch (error) {
      console.error('Photo upload error:', error)
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
      console.error('Photo delete error:', error)
      throw error
    }
  }

  // Ensure bucket exists before upload
  private async ensureBucketExists(): Promise<void> {
    try {
      console.log('🔍 Checking if bucket exists:', this.bucket)
      
      // First check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()
      
      if (listError) {
        console.error('❌ Error listing buckets:', listError)
        throw new Error(`Cannot list buckets: ${listError.message}`)
      }
      
      console.log('📦 Available buckets:', buckets?.map(b => b.id) || [])
      const bucketExists = buckets?.some(bucket => bucket.id === this.bucket)
      
      if (!bucketExists) {
        console.log('🏗️ Creating bucket:', this.bucket)
        const { error } = await supabase.storage.createBucket(this.bucket, {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
          fileSizeLimit: 10485760 // 10MB
        })

        if (error && !error.message.includes('already exists')) {
          console.error('❌ Failed to create bucket:', error)
          throw new Error(`Bucket creation failed: ${error.message}`)
        }
        console.log('✅ Bucket created successfully')
      } else {
        console.log('✅ Bucket already exists:', this.bucket)
      }
    } catch (error) {
      console.error('❌ Error ensuring bucket exists:', error)
      throw error // Throw here so we know about the problem
    }
  }

  // Create bucket if it doesn't exist (call this during setup)
  async createBucket(): Promise<void> {
    return this.ensureBucketExists()
  }
}

export const storageService = new StorageService()