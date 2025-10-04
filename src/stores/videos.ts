import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

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
  user_email?: string
  orientation?: string
}

interface VideoState {
  generatedVideos: GeneratedVideo[]
  isLoading: boolean
  addVideo: (video: Omit<GeneratedVideo, 'id' | 'timestamp'>) => void
  removeVideo: (id: string) => void
  clearAllVideos: () => void
  updateVideo: (id: string, updates: Partial<GeneratedVideo>) => void
  fetchUserVideos: (userEmail: string) => Promise<void>
  setVideos: (videos: GeneratedVideo[]) => void
}

export const useVideoStore = create<VideoState>()((set, get) => ({
  generatedVideos: [],
  isLoading: false,

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

    set(state => ({
      generatedVideos: [newVideo, ...state.generatedVideos]
    }))
  },

  removeVideo: (id) => {
    set(state => ({
      generatedVideos: state.generatedVideos.filter(video => video.id !== id)
    }))
  },

  clearAllVideos: () => {
    set({ generatedVideos: [] })
  },

  updateVideo: (id, updates) => {
    set(state => ({
      generatedVideos: state.generatedVideos.map(video =>
        video.id === id ? { ...video, ...updates } : video
      )
    }))
  },

  fetchUserVideos: async (userEmail: string) => {
    try {
      set({ isLoading: true })

      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching videos:', error)
        set({ isLoading: false })
        return
      }

      const videos: GeneratedVideo[] = (data || []).map((video: any) => ({
        id: video.id,
        url: video.video_url,
        prompt: video.prompt,
        timestamp: video.created_at,
        status: video.generation_status as 'completed' | 'processing' | 'failed',
        quality: 'hd',
        duration: video.duration || 8,
        fileSize: video.file_size || 50000000,
        template: 'AI Generated',
        title: `Video: ${video.prompt.substring(0, 30)}...`,
        user_email: video.user_email,
        orientation: video.orientation
      }))

      set({ generatedVideos: videos, isLoading: false })
    } catch (error) {
      console.error('Error fetching user videos:', error)
      set({ isLoading: false })
    }
  },

  setVideos: (videos: GeneratedVideo[]) => {
    set({ generatedVideos: videos })
  }
}))