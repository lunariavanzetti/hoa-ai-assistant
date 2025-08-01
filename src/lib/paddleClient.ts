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

      console.log('Initializing Paddle with environment:', environment)
      console.log('Using client token:', clientToken ? 'Found' : 'Missing')

      if (!clientToken) {
        throw new Error(`Missing Paddle client token for ${environment} environment`)
      }

      // Dynamic import to avoid build issues
      const paddle = await import('@paddle/paddle-js')
      this.paddle = await paddle.initializePaddle({
        token: clientToken,
        environment
      })
      
      this.isInitialized = true
      console.log('Paddle initialized successfully for', environment)
      return this.paddle
    } catch (error) {
      console.error('Error initializing Paddle:', error)
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
      
      // Add error listener before opening checkout
      paddle.Checkout.on('checkout.error', (error: any) => {
        console.error('Paddle Checkout Error Event:', error)
      })
      
      const checkout = await paddle.Checkout.open(checkoutConfig)
      
      console.log('Checkout opened successfully:', checkout)
      return checkout
    } catch (error) {
      console.error('=== PADDLE CHECKOUT ERROR ===')
      console.error('Error details:', error)
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
      console.error('Error stack:', error instanceof Error ? error.stack : undefined)
      
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