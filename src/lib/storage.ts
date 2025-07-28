import { supabase } from './supabase'

export interface UploadResult {
  url: string
  path: string
}

class StorageService {
  private bucket = 'violation-photos'

  async uploadPhoto(file: File, violationId?: string): Promise<UploadResult> {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${violationId || Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `violations/${fileName}`

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
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

  // Create bucket if it doesn't exist (call this during setup)
  async createBucket(): Promise<void> {
    try {
      const { error } = await supabase.storage.createBucket(this.bucket, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      })

      if (error && !error.message.includes('already exists')) {
        throw error
      }
    } catch (error) {
      console.error('Bucket creation error:', error)
    }
  }
}

export const storageService = new StorageService()