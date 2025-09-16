import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Play,
  Pause,
  Maximize,
  Settings,
  RotateCcw,
  RotateCw,
  Crown,
  User,
  Search,
  Plus,
  Wand2,
  Upload,
  Image,
  Video,
  Save,
  Share,
  Download,
  Layers,
  Clock,
  Camera,
  Palette,
  Sliders
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'

export const VideoGenerator: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [isPlaying, setIsPlaying] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [duration, setDuration] = useState(10)
  const [cameraAngle, setCameraAngle] = useState('medium-shot')
  const [style, setStyle] = useState('cinematic')
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalTime] = useState(45)

  const mockScenes = [
    {
      id: 1,
      title: "Opening Scene",
      thumbnail: "/scene1.jpg",
      duration: "5s",
      status: "completed"
    },
    {
      id: 2,
      title: "Product Showcase",
      thumbnail: "/scene2.jpg",
      duration: "15s",
      status: "completed"
    },
    {
      id: 3,
      title: "Call to Action",
      thumbnail: "/scene3.jpg",
      duration: "10s",
      status: "processing"
    }
  ]

  const mockAssets = [
    { id: 1, name: "Logo", type: "image", thumbnail: "/logo.png" },
    { id: 2, name: "Product", type: "image", thumbnail: "/product.jpg" },
    { id: 3, name: "Background", type: "video", thumbnail: "/bg.mp4" },
    { id: 4, name: "Character", type: "image", thumbnail: "/char.png" }
  ]

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => setIsGenerating(false), 3000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between h-14 px-6 bg-gray-800 border-b border-gray-700">
        {/* Left: Project Navigation */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <input
              type="text"
              defaultValue="Product Launch Video"
              className="bg-transparent text-lg font-medium border-none outline-none focus:bg-gray-700 px-2 py-1 rounded"
              style={{ fontFamily: 'Google Sans, sans-serif' }}
            />
            <span className="text-sm text-gray-400">• Saved 2 mins ago</span>
          </div>
        </div>

        {/* Center: Controls */}
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <RotateCw className="w-4 h-4" />
          </button>
          <div className="text-sm text-gray-400">
            <Save className="w-4 h-4 inline mr-1" />
            Auto-saved
          </div>
        </div>

        {/* Right: Credits & Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-900/50 text-green-300 rounded-full border border-green-700">
            <Crown className="w-4 h-4" />
            <span className="text-sm font-medium" style={{ fontFamily: 'Google Sans, sans-serif' }}>
              85/100
            </span>
          </div>

          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
            <Share className="w-4 h-4 inline mr-2" />
            Export
          </button>

          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
          </button>

          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Assets & Ingredients */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-medium mb-4" style={{ fontFamily: 'Google Sans, sans-serif' }}>
              Assets & Ingredients
            </h3>

            <div className="flex gap-2 mb-4">
              <button className="flex-1 text-sm py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                Uploaded
              </button>
              <button className="flex-1 text-sm py-2 px-3 hover:bg-gray-700 rounded-lg transition-colors">
                Generated
              </button>
              <button className="flex-1 text-sm py-2 px-3 hover:bg-gray-700 rounded-lg transition-colors">
                Favorites
              </button>
            </div>

            <button className="w-full p-3 border-2 border-dashed border-gray-600 hover:border-gray-500 rounded-lg transition-colors text-center">
              <Upload className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm text-gray-300">Upload assets</span>
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              {mockAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="bg-gray-700 rounded-lg p-3 hover:bg-gray-600 transition-colors cursor-pointer"
                >
                  <div className="aspect-square bg-gray-600 rounded-lg mb-2 flex items-center justify-center">
                    {asset.type === 'image' ? (
                      <Image className="w-6 h-6 text-gray-400" />
                    ) : (
                      <Video className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <p className="text-xs text-gray-300 truncate">{asset.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center - Canvas & Controls */}
        <div className="flex-1 flex flex-col">
          {/* Video Canvas */}
          <div className="flex-1 flex items-center justify-center bg-black relative">
            <div className="relative w-full max-w-4xl aspect-video bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
              {/* Video Preview */}
              <div className="w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-white" />
                  ) : (
                    <Play className="w-8 h-8 text-white ml-1" />
                  )}
                </button>
              </div>

              {/* Video Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1 flex items-center gap-3">
                    <span className="text-sm">{formatTime(currentTime)}</span>
                    <div className="flex-1 bg-gray-600 rounded-full h-1">
                      <div
                        className="bg-blue-500 h-1 rounded-full transition-all"
                        style={{ width: `${(currentTime / totalTime) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm">{formatTime(totalTime)}</span>
                  </div>

                  <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                    <Maximize className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Prompt & Settings */}
        <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-medium mb-4" style={{ fontFamily: 'Google Sans, sans-serif' }}>
              Scene Generation
            </h3>

            {/* Prompt Input */}
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">Describe your scene</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A neon-lit city street with rain at night, cinematic lighting, professional videography..."
                className="w-full h-24 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-500"
                style={{ fontFamily: 'Google Sans, sans-serif' }}
              />
            </div>

            {/* Quick Controls */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value={5}>5 seconds</option>
                  <option value={10}>10 seconds</option>
                  <option value={15}>15 seconds</option>
                  <option value={30}>30 seconds</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Camera</label>
                <select
                  value={cameraAngle}
                  onChange={(e) => setCameraAngle(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="close-up">Close-up</option>
                  <option value="medium-shot">Medium shot</option>
                  <option value="wide-shot">Wide shot</option>
                  <option value="drone">Drone view</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs text-gray-400 mb-1">Style Preset</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="cinematic">Cinematic</option>
                <option value="animation">Animation</option>
                <option value="surreal">Surreal</option>
                <option value="documentary">Documentary</option>
              </select>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate Scene
                </>
              )}
            </button>

            {isGenerating && (
              <div className="mt-3 text-center">
                <div className="text-sm text-gray-300 mb-2">Generating your scene...</div>
                <div className="text-xs text-gray-400">~45 seconds remaining</div>
              </div>
            )}
          </div>

          {/* Advanced Controls */}
          <div className="p-4 border-b border-gray-700">
            <h4 className="font-medium mb-3 text-sm" style={{ fontFamily: 'Google Sans, sans-serif' }}>
              Advanced Controls
            </h4>

            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-3">
                <Camera className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-sm font-medium">Camera Motion</div>
                  <div className="text-xs text-gray-400">Pan, zoom, dolly effects</div>
                </div>
              </button>

              <button className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-3">
                <Palette className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-sm font-medium">Color Grading</div>
                  <div className="text-xs text-gray-400">Cinematic color presets</div>
                </div>
              </button>

              <button className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-3">
                <Sliders className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-sm font-medium">Fine Tuning</div>
                  <div className="text-xs text-gray-400">Lighting, composition</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Timeline */}
      <div className="h-32 bg-gray-800 border-t border-gray-700 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="font-medium" style={{ fontFamily: 'Google Sans, sans-serif' }}>
            Timeline
          </h3>

          <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm">
            <Plus className="w-4 h-4" />
            Add Scene
          </button>
        </div>

        <div className="flex-1 flex items-center gap-3 px-4 overflow-x-auto">
          {mockScenes.map((scene) => (
            <div
              key={scene.id}
              className="flex-shrink-0 bg-gray-700 hover:bg-gray-600 rounded-lg p-3 cursor-pointer transition-colors border-2 border-transparent hover:border-blue-500"
            >
              <div className="w-20 h-12 bg-gray-600 rounded-lg mb-2 flex items-center justify-center relative">
                <Play className="w-4 h-4 text-gray-400" />
                {scene.status === 'processing' && (
                  <div className="absolute inset-0 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-300 text-center">{scene.duration}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}