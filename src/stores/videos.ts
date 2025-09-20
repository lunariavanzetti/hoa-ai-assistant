import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface GeneratedVideo {
  id: string
  url: string
  prompt: string
  timestamp: string
  title?: string
  status: 'completed' | 'processing' | 'failed'
  quality: 'hd' | '4k'
  duration: number
  fileSize: number
  template: string
}

interface VideoState {
  generatedVideos: GeneratedVideo[]
  addVideo: (video: Omit<GeneratedVideo, 'id' | 'timestamp'>) => void
  removeVideo: (id: string) => void
  clearAllVideos: () => void
  updateVideo: (id: string, updates: Partial<GeneratedVideo>) => void
}

export const useVideoStore = create<VideoState>()(
  persist(
    (set, get) => ({
      generatedVideos: [],

      addVideo: (videoData) => {
        const newVideo: GeneratedVideo = {
          id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          status: 'completed',
          quality: 'hd',
          duration: 30, // Default duration
          fileSize: 50000000, // Default file size (~50MB)
          template: 'AI Generated',
          title: `Video: ${videoData.prompt.substring(0, 30)}...`,
          ...videoData
        }

        console.log('📹 Adding video to store:', newVideo)

        set(state => ({
          generatedVideos: [newVideo, ...state.generatedVideos]
        }))

        console.log('📊 Total videos in store:', get().generatedVideos.length)
      },

      removeVideo: (id) => {
        console.log('🗑️ Removing video from store:', id)
        set(state => ({
          generatedVideos: state.generatedVideos.filter(video => video.id !== id)
        }))
      },

      clearAllVideos: () => {
        console.log('🗑️ Clearing all videos from store')
        set({ generatedVideos: [] })
      },

      updateVideo: (id, updates) => {
        console.log('✏️ Updating video in store:', id, updates)
        set(state => ({
          generatedVideos: state.generatedVideos.map(video =>
            video.id === id ? { ...video, ...updates } : video
          )
        }))
      }
    }),
    {
      name: 'video-storage',
      partialize: (state) => ({ generatedVideos: state.generatedVideos })
    }
  )
)