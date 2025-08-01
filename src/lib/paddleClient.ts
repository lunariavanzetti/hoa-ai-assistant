class PaddleClient {
  private paddle: any = null
  private isInitialized = false

  async initialize() {
    if (this.isInitialized) return this.paddle

    try {
      const environment = import.meta.env.VITE_PADDLE_ENVIRONMENT as 'production' | 'sandbox'
      const clientToken = environment === 'sandbox' 
        ? import.meta.env.VITE_PADDLE_SANDBOX_CLIENT_TOKEN
        : import.meta.env.VITE_PADDLE_PRODUCTION_CLIENT_TOKEN

      console.log('🔧 Initializing Paddle SDK v1.4.2')
      console.log('- Environment:', environment)
      console.log('- Token found:', !!clientToken)
      console.log('- Token prefix:', clientToken?.substring(0, 10) + '...')

      if (!clientToken) {
        throw new Error(`Missing Paddle client token for ${environment} environment`)
      }

      // Use the correct method for Paddle JS SDK v1.4.2
      const paddleModule = await import('@paddle/paddle-js')
      console.log('📦 Paddle module loaded:', Object.keys(paddleModule))
      
      // Try multiple initialization methods for compatibility
      let initMethod = 'unknown'
      try {
        // Method 1: Paddle.Setup (v1.4.2)
        if (paddleModule.Paddle?.Setup) {
          console.log('🚀 Using Paddle.Setup method (v1.4.2)')
          initMethod = 'Paddle.Setup'
          this.paddle = await paddleModule.Paddle.Setup({
            token: clientToken,
            environment: environment as any
          })
        }
        // Method 2: initializePaddle (newer versions)
        else if (paddleModule.initializePaddle) {
          console.log('🚀 Using initializePaddle method (newer version)')
          initMethod = 'initializePaddle'
          this.paddle = await paddleModule.initializePaddle({
            token: clientToken,
            environment
          })
        }
        // Method 3: Direct constructor
        else if (paddleModule.Paddle) {
          console.log('🚀 Using Paddle constructor')
          initMethod = 'Paddle constructor'
          this.paddle = new paddleModule.Paddle({
            token: clientToken,
            environment
          })
        }
        else {
          throw new Error('No known Paddle initialization method found')
        }
      } catch (setupError) {
        console.error(`❌ ${initMethod} failed:`, setupError)
        throw setupError
      }
      
      if (!this.paddle) {
        throw new Error(`${initMethod} returned null/undefined`)
      }
      
      this.isInitialized = true
      console.log('✅ Paddle initialized successfully for', environment)
      console.log('Paddle instance methods:', Object.keys(this.paddle))
      return this.paddle
    } catch (error) {
      console.error('❌ Error initializing Paddle:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        type: typeof error
      })
      throw error
    }
  }

  async openCheckout(priceId: string, customerId?: string) {
    const environment = import.meta.env.VITE_PADDLE_ENVIRONMENT as 'production' | 'sandbox'
    const clientToken = environment === 'sandbox' 
      ? import.meta.env.VITE_PADDLE_SANDBOX_CLIENT_TOKEN
      : import.meta.env.VITE_PADDLE_PRODUCTION_CLIENT_TOKEN

    console.log('=== PADDLE CLIENT DEBUG ===')
    console.log('Initializing Paddle with:')
    console.log('- Environment:', environment)
    console.log('- Client Token (first 20 chars):', clientToken?.substring(0, 20) + '...')
    console.log('- Client Token Length:', clientToken?.length)
    console.log('- Client Token Valid:', clientToken?.startsWith(environment === 'sandbox' ? 'test_' : 'live_'))
    console.log('- Price ID:', priceId)
    console.log('- Customer ID:', customerId)
    console.log('- Current URL:', window.location.href)
    console.log('- User Agent:', navigator.userAgent)
    
    const paddle = await this.initialize()
    if (!paddle) throw new Error('Paddle not initialized')

    try {
      const checkoutConfig: any = {
        items: [{ priceId, quantity: 1 }],
        successUrl: `${window.location.origin}/billing/success`,
        closeUrl: `${window.location.origin}/pricing`
      }
      
      // Only add customerId if it exists and is not null
      if (customerId && customerId.trim()) {
        checkoutConfig.customerId = customerId
      }
      
      console.log('Opening checkout with config:', JSON.stringify(checkoutConfig, null, 2))
      
      // Add network monitoring
      console.log('🌐 Starting network monitoring for Paddle requests...')
      
      const checkout = await paddle.Checkout.open(checkoutConfig)
      
      console.log('Checkout opened successfully:', checkout)
      return checkout
    } catch (error) {
      console.error('=== PADDLE CHECKOUT ERROR ===')
      console.error('Error details:', error)
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
      console.error('Error stack:', error instanceof Error ? error.stack : undefined)
      console.error('Error type:', typeof error)
      console.error('Error constructor:', error?.constructor?.name)
      
      // Log the raw error object
      if (error && typeof error === 'object') {
        console.error('Raw error object keys:', Object.keys(error))
        for (const key of Object.keys(error)) {
          console.error(`Error.${key}:`, (error as any)[key])
        }
      }
      
      // Check for specific error types
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('403')) {
          throw new Error('Authentication failed. Please check Paddle configuration and client token.')
        }
        if (error.message.includes('price')) {
          throw new Error(`Price ID "${priceId}" not found or not active in Paddle. Please verify the price exists and is active.`)
        }
        if (error.message.includes('JWT')) {
          throw new Error('JWT token retrieval failed. This usually means the client token is invalid or the price is not properly configured.')
        }
        if (error.message.includes('400')) {
          throw new Error(`HTTP 400 Error: Bad Request. This could be due to: 1) Price is inactive/draft, 2) CORS/CSP blocking, 3) Invalid checkout configuration. Check browser Network tab for details.`)
        }
      }
      
      throw error
    }
  }

  async openSubscriptionUpdate(_subscriptionId: string, _newPriceId: string) {
    try {
      // For subscription updates, redirect to a simpler flow
      window.location.href = '/pricing'
    } catch (error) {
      console.error('Error opening subscription update:', error)
      throw error
    }
  }

  async openCustomerPortal(_customerId: string) {
    const paddle = await this.initialize()
    if (!paddle) throw new Error('Paddle not initialized')

    try {
      // For customer portal, we need to redirect to Paddle's billing portal
      // This is typically done server-side, but for now we'll show a message
      window.open(`https://checkout.paddle.com/subscription/update`, '_blank')
    } catch (error) {
      console.error('Error opening customer portal:', error)
      throw error
    }
  }
}

export const paddleClient = new PaddleClient()