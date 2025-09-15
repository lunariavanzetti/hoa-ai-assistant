# Kateriss AI Video Generator - Transformation Implementation Plan

## Phase 1: Database & Paddle Setup (Week 1)

### Database Migration
1. Run `VIDEO_GENERATOR_SCHEMA.sql` on your Supabase instance
2. Update existing user records to video-focused structure
3. Test data migration with your existing users

### Paddle Configuration
1. Create new price IDs in Paddle dashboard:
   - Pay-per-video: $2.49 (one-time)
   - Basic: $29/month (update existing Pro)
   - Premium: $149/month (update existing Agency)

2. Update environment variables:
```env
# Keep existing Paddle config
# Add new price IDs
VITE_PADDLE_PAY_PER_VIDEO_PRICE_ID=pri_new_pay_per_video_249
VITE_PADDLE_BASIC_MONTHLY_PRICE_ID=pri_01k1jmkp73zpywnccyq39vea1s
VITE_PADDLE_PREMIUM_MONTHLY_PRICE_ID=pri_01k1jmsk04pfsf5b34dwe5ej4a
```

## Phase 2: Core Service Updates (Week 1-2)

### Update Subscription Service
```typescript
// Update subscriptionService.ts price mappings
private getTierPriceId(tier: string): string {
  const tierMap: Record<string, string> = {
    'basic': process.env.VITE_PADDLE_BASIC_MONTHLY_PRICE_ID,
    'premium': process.env.VITE_PADDLE_PREMIUM_MONTHLY_PRICE_ID,
    'pay_per_video': process.env.VITE_PADDLE_PAY_PER_VIDEO_PRICE_ID
  }
  return tierMap[tier] || tierMap['basic']
}
```

### Create Gemini Integration
```typescript
// New file: src/lib/geminiClient.ts
export class GeminiVideoService {
  async enhancePrompt(userPrompt: string): Promise<string>
  async generateScript(prompt: string): Promise<string>
  async generateVideo(script: string, quality: 'hd' | '4k'): Promise<VideoResult>
}
```

## Phase 3: UI Component Transformation (Week 2)

### Update Routing in App.tsx
```typescript
// Replace HOA routes with video routes
<Route path="generate" element={<VideoGenerator />} />
<Route path="templates" element={<VideoTemplates />} />
<Route path="videos" element={<VideoHistory />} />
<Route path="analytics" element={<VideoAnalytics />} />
```

### Transform Core Components
1. `ViolationGenerator.tsx` → `VideoGenerator.tsx`
   - Change form fields from HOA to video prompts
   - Integrate Gemini AI for prompt enhancement
   - Add video quality selection
   - Add template selection

2. `Dashboard.tsx` updates:
   - Change "AI Letters Generated" to "Videos Created"
   - Update quick actions to video-focused
   - Update usage tracking for video credits

3. `Pricing.tsx` updates:
   - Add pay-per-video option
   - Update plan features for video generation
   - Update pricing structure

## Phase 4: Video Processing Pipeline (Week 2-3)

### Video Generation Workflow
```typescript
// src/lib/videoGeneration.ts
export class VideoGenerationService {
  async queueVideo(project: VideoProject): Promise<VideoJob>
  async processQueue(): Promise<void>
  async getProgress(videoId: string): Promise<number>
  async downloadVideo(videoId: string): Promise<string>
}
```

### Queue Management System
```typescript
// Background processing with status updates
// Integration with VEO 3 FAST API (when available)
// Fallback to alternative video generation services
```

## Phase 5: Frontend Polish (Week 3)

### Design Updates
1. Update branding from "HOA AI Assistant" to "Kateriss AI Video Generator"
2. Change color scheme to video-focused (keep liquid glass design)
3. Update icons from HOA-specific to video-specific
4. Add video preview components

### New Components Needed
```typescript
// src/components/video/VideoPlayer.tsx
// src/components/video/VideoQueue.tsx
// src/components/video/TemplateSelector.tsx
// src/components/video/QualitySelector.tsx
```

## Phase 6: Testing & Launch (Week 4)

### Testing Checklist
- [ ] Paddle integration with new prices
- [ ] Pay-per-video transactions
- [ ] Video generation pipeline
- [ ] Queue management
- [ ] Usage limits and credits
- [ ] Gemini AI integration
- [ ] File storage and downloads

### Launch Strategy
1. Soft launch to existing users with migration notice
2. Update domain from HOA focus to video focus
3. Marketing campaign for video generation platform

## Technical Considerations

### API Rate Limits
- Gemini API: Monitor usage and implement caching
- Video generation: Queue system to handle demand
- Paddle webhooks: Ensure reliable payment processing

### Storage Requirements
- Supabase Storage for generated videos
- CDN for fast global delivery
- Automatic cleanup of old free-tier videos

### Performance Optimization
- Video compression and optimization
- Progressive loading for large videos
- Background processing with WebSocket updates

## Migration Strategy for Existing Users

### User Communication
1. Email announcement about platform transformation
2. Migration guide for existing HOA users
3. Special pricing for early video platform adopters

### Data Handling
1. Archive existing HOA data
2. Migrate users to video-focused interface
3. Preserve payment history and subscription status
4. Offer credit bonuses for loyal users

## Success Metrics

### Technical KPIs
- Video generation success rate > 95%
- Average processing time < 5 minutes
- Payment processing success rate > 99%
- User satisfaction score > 4.5/5

### Business KPIs
- Monthly recurring revenue growth
- Pay-per-video conversion rate
- User retention after video generation
- Support ticket reduction through automation