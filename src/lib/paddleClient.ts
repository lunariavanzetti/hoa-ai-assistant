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


      if (!clientToken) {
        throw new Error(`Missing Paddle client token for ${environment} environment`)
      }

      // Check if Paddle is available from CDN
      if (typeof (window as any).Paddle === 'undefined') {
        throw new Error('Paddle SDK not loaded from CDN. Check if script is included in HTML.')
      }

      // Use Paddle v2 CDN method

      // Use correct Paddle.js initialization according to docs
      try {
        (window as any).Paddle.Environment.set("sandbox");

        const initResult = (window as any).Paddle.Initialize({
          token: clientToken,
          pwCustomer: {}
        })
      } catch (initError) {
        // Handle initialization error silently

        // This is a critical error - don't continue without proper initialization
        throw new Error(`Paddle initialization failed: ${initError?.message}`)
      }

      this.paddle = (window as any).Paddle

      this.isInitialized = true
      return this.paddle
    } catch (error) {
      throw error
    }
  }

  async openCheckout(priceId: string, customerId?: string, userEmail?: string) {
    const environment = import.meta.env.VITE_PADDLE_ENVIRONMENT as 'production' | 'sandbox'
    const clientToken = environment === 'sandbox' 
      ? import.meta.env.VITE_PADDLE_SANDBOX_CLIENT_TOKEN
      : import.meta.env.VITE_PADDLE_PRODUCTION_CLIENT_TOKEN

    
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


      // Validate checkout configuration

      // Add debugging for the specific price being used

      // Map current price IDs to names for better debugging
      const priceNames = {
        'pri_01k5j03ma3tzk51v95213h7yy9': 'Pay-per-Video $2.99',
        'pri_01k5j04nvcbwrrdz18d7yhv5ap': 'Basic Monthly $19.99',
        'pri_01k5j06b5zmw5f8cfm06vdrvb9': 'Premium Monthly $49.99'
      }

      const priceName = priceNames[priceId] || 'Unknown Price'

      // Open checkout using Paddle v2 API

      let checkout: any
      try {
        // Use the global Paddle.Checkout.open method as per docs
        checkout = await (window as any).Paddle.Checkout.open(checkoutConfig)

        // Start token polling after successful checkout
        const { useAuthStore } = await import('@/stores/auth')
        const { startTokenPolling } = useAuthStore.getState()
        startTokenPolling()

        // Stop polling after 2 minutes to avoid infinite polling
        setTimeout(() => {
          const { stopTokenPolling } = useAuthStore.getState()
          stopTokenPolling()
        }, 120000)

      } catch (openError) {

        // Add specific error handling
        if (openError && typeof openError === 'object') {
          // Handle error object silently
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

      return checkout
    } catch (error) {
      
      // Handle error object silently
      if (error && typeof error === 'object') {
        // Error handling without logging
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
      throw error
    }
  }
}

export const paddleClient = new PaddleClient()