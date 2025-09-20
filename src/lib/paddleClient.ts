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

      console.log('🔧 Initializing Paddle SDK v2 (CDN)')
      console.log('- Environment:', environment)
      console.log('- Token found:', !!clientToken)
      console.log('- Token prefix:', clientToken?.substring(0, 10) + '...')

      if (!clientToken) {
        throw new Error(`Missing Paddle client token for ${environment} environment`)
      }

      // Check if Paddle is available from CDN
      if (typeof (window as any).Paddle === 'undefined') {
        throw new Error('Paddle SDK not loaded from CDN. Check if script is included in HTML.')
      }

      // Use Paddle v2 CDN method
      console.log('🚀 Using Paddle v2 CDN initialization')
      console.log('Available Paddle methods:', Object.keys((window as any).Paddle))

      // Use correct Paddle.js initialization according to docs
      try {
        console.log('🔧 Setting Paddle environment to sandbox...');
        (window as any).Paddle.Environment.set("sandbox");
        console.log('✅ Environment set to sandbox')

        console.log('🔧 Initializing Paddle with token:', clientToken)
        const initResult = (window as any).Paddle.Initialize({
          token: clientToken,
          pwCustomer: {}
        })
        console.log('✅ Paddle.Initialize completed, result:', initResult)
      } catch (initError) {
        console.error('❌ Paddle initialization failed:', initError)
        console.error('❌ Init error details:', {
          message: initError?.message,
          stack: initError?.stack,
          name: initError?.name
        })

        // This is a critical error - don't continue without proper initialization
        throw new Error(`Paddle initialization failed: ${initError?.message}`)
      }

      this.paddle = (window as any).Paddle
      
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

  async openCheckout(priceId: string, customerId?: string, userEmail?: string) {
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
    console.log('- User Email:', userEmail)
    console.log('- Current URL:', window.location.href)
    console.log('- User Agent:', navigator.userAgent)
    
    const paddle = await this.initialize()
    if (!paddle) throw new Error('Paddle not initialized')

    try {
      // Use the correct Paddle v2 checkout configuration format (minimal and clean)
      const checkoutConfig: any = {
        items: [{
          priceId: priceId,
          quantity: 1
        }]
      }

      // Add customer info if available (for better UX) - using correct field names
      if (customerId) {
        checkoutConfig.customerId = customerId
      }

      // Add customer email separately (not customerEmail)
      if (userEmail && !customerId) {
        checkoutConfig.customer = {
          email: userEmail
        }
      }

      console.log('🔧 Final checkout configuration:', JSON.stringify(checkoutConfig, null, 2))

      // Validate checkout configuration
      console.log('🔍 Validating checkout configuration...')
      console.log('- Price ID format valid:', /^pri_[a-zA-Z0-9]+$/.test(priceId))
      console.log('- Has items:', checkoutConfig.items?.length > 0)
      console.log('- Environment matches token:', environment)

      // Open checkout using Paddle v2 API
      console.log('🚀 Opening checkout with Paddle.Checkout.open...')
      console.log('Available Paddle methods:', Object.keys((window as any).Paddle || {}))

      let checkout: any
      try {
        // Use the global Paddle.Checkout.open method as per docs
        checkout = await (window as any).Paddle.Checkout.open(checkoutConfig)
        console.log('✅ Checkout opened successfully:', checkout)
      } catch (openError) {
        console.error('❌ Checkout failed:', openError)

        // Add specific error handling
        if (openError && typeof openError === 'object') {
          console.error('Error details:', {
            message: openError.message,
            stack: openError.stack,
            name: openError.name,
            cause: openError.cause
          })
        }

        // Check for common Paddle errors
        if (openError?.message?.includes('400') || openError?.message?.includes('Bad Request')) {
          throw new Error(`HTTP 400 Bad Request: Invalid checkout configuration. This could be due to:\n1. Price ID "${priceId}" is invalid or not found\n2. Price is not active/published in Paddle Sandbox\n3. Invalid checkout parameters\n4. Check the price exists in your Paddle dashboard`)
        }

        if (openError?.message?.includes('403')) {
          throw new Error('Authentication failed (403). Check if:\n1. Client token is valid for sandbox environment\n2. Price ID exists and is active in Paddle Sandbox\n3. Domain is approved (if required)')
        }

        if (openError?.message?.includes('price')) {
          throw new Error(`Price ID "${priceId}" not found or not active in Paddle Sandbox. Verify the price exists and is published.`)
        }

        throw openError
      }

      console.log('✅ Final checkout result:', checkout)
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