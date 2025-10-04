import { create } from 'zustand'

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
      console.log('🔍 Fetching videos for user:', userEmail)
      set({ isLoading: true })

      // Use backend API endpoint instead of direct Supabase access (to bypass RLS)
      const response = await fetch(`/api/get-user-videos?email=${encodeURIComponent(userEmail)}`)

      if (!response.ok) {
        console.error('❌ Error fetching videos:', response.statusText)
        set({ isLoading: false })
        return
      }

      const result = await response.json()

      console.log('📹 Raw video data from API:', result)
      console.log(`✅ Found ${result.videos?.length || 0} videos for ${userEmail}`)

      const videos: GeneratedVideo[] = (result.videos || []).map((video: any) => ({
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

      console.log('📦 Mapped videos:', videos)

      set({ generatedVideos: videos, isLoading: false })
    } catch (error) {
      console.error('❌ Error fetching user videos:', error)
      set({ isLoading: false })
    }
  },

  setVideos: (videos: GeneratedVideo[]) => {
    set({ generatedVideos: videos })
  }
}))