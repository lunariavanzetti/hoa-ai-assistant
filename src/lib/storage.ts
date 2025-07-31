import { supabase } from './supabase'

export interface UploadResult {
  url: string
  path: string
}

class StorageService {
  private bucket = 'violation-photos'

  async uploadPhoto(file: File, violationId?: string): Promise<UploadResult> {
    try {
      // Skip bucket checking - go directly to upload (bucket should exist from SQL setup)
      console.log('📤 Starting direct upload (skipping bucket check)')

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${violationId || Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `violations/${fileName}`

      console.log('📁 Uploading to bucket:', this.bucket, 'file path:', filePath)

      // Create a timeout promise that rejects after 30 seconds
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Direct upload timeout after 30 seconds'))
        }, 30000)
      })

      // Upload file to Supabase Storage with timeout
      const uploadPromise = supabase.storage
        .from(this.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      console.log('⏱️ Starting direct upload with 30s timeout...')
      const { data, error } = await Promise.race([uploadPromise, timeoutPromise])

      if (error) {
        console.error('❌ Supabase upload error:', error)
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