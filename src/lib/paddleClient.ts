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

      // Initialize Paddle v2 (environment is determined by the token)
      try {
        (window as any).Paddle.Setup({
          token: clientToken
        })
        console.log('✅ Paddle.Setup completed with token')
      } catch (setupError) {
        console.error('❌ Paddle.Setup failed:', setupError)
        // Continue anyway, might work with global instance
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
      // Test with minimal configuration first
      const checkoutConfig: any = {
        items: [{ priceId, quantity: 1 }]
        // Remove success/close URLs temporarily to test
        // successUrl: `${window.location.origin}/`,
        // closeUrl: `${window.location.origin}/pricing`
      }

      // Don't add customerId for now to test
      // if (customerId && customerId.trim()) {
      //   checkoutConfig.customerId = customerId
      // }

      console.log('🧪 Testing with minimal config (no URLs/customer):', JSON.stringify(checkoutConfig, null, 2))

      // First, let's test if we can get price information from Paddle
      try {
        console.log('🔍 Testing if price exists in Paddle...')
        const testPrice = await fetch(`https://sandbox-api.paddle.com/prices/${priceId}`, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.PADDLE_SANDBOX_API_KEY || 'test-key'}`,
            'Content-Type': 'application/json'
          }
        })
        console.log('📊 Price API response:', testPrice.status, testPrice.statusText)
      } catch (priceError) {
        console.log('⚠️ Could not fetch price info (expected in sandbox):', priceError)
      }

      console.log('Opening checkout with config:', JSON.stringify(checkoutConfig, null, 2))
      
      // Add comprehensive network monitoring
      console.log('🌐 Starting network monitoring for Paddle requests...')

      // Monitor ALL network requests (not just paddle)
      const originalFetch = window.fetch
      window.fetch = function(...args) {
        const url = args[0]
        const urlString = typeof url === 'string' ? url : url?.toString() || 'unknown'

        // Log ALL requests to see what's happening
        console.log('🌐 Network Request:', urlString, args[1])

        return originalFetch.apply(this, args).then(response => {
          console.log('📡 Network Response:', {
            url: urlString,
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries())
          })

          if (!response.ok) {
            console.error('❌ Network Error Details:', {
              url: urlString,
              status: response.status,
              statusText: response.statusText,
              bodyUsed: response.bodyUsed
            })

            // Try to get error body
            response.clone().text().then(body => {
              console.error('❌ Error Response Body:', body)
            }).catch(() => {
              console.error('❌ Could not read error response body')
            })
          }
          return response
        }).catch(error => {
          console.error('💥 Network Request Failed:', {
            url: urlString,
            error: error.message,
            stack: error.stack
          })
          throw error
        })
      }

      // Also monitor XMLHttpRequest
      const originalXHR = window.XMLHttpRequest
      const xhrInstances = new Set()

      window.XMLHttpRequest = function() {
        const xhr = new originalXHR()
        xhrInstances.add(xhr)

        const originalOpen = xhr.open
        xhr.open = function(method, url, ...args) {
          console.log('🔗 XHR Request:', method, url)
          return originalOpen.call(this, method, url, ...args)
        }

        const originalSend = xhr.send
        xhr.send = function(data) {
          console.log('📤 XHR Send:', this.responseURL || 'unknown URL', data)
          return originalSend.call(this, data)
        }

        xhr.addEventListener('load', () => {
          console.log('📥 XHR Response:', {
            url: xhr.responseURL,
            status: xhr.status,
            statusText: xhr.statusText,
            response: xhr.response
          })
        })

        xhr.addEventListener('error', () => {
          console.error('💥 XHR Error:', {
            url: xhr.responseURL,
            status: xhr.status,
            statusText: xhr.statusText
          })
        })

        return xhr
      }

      // Add detailed validation
      console.log('🔍 Validating checkout configuration...')
      console.log('- Price ID format valid:', /^pri_[a-zA-Z0-9]+$/.test(priceId))
      console.log('- Success URL valid:', checkoutConfig.successUrl)
      console.log('- Close URL valid:', checkoutConfig.closeUrl)
      console.log('- Environment matches token:', environment)

      // Use Paddle v2 checkout method
      let checkout: any
      console.log('🚀 Attempting to open checkout with v2 API...')
      console.log('Available paddle methods:', Object.keys(paddle))

      try {
        // Try v2 method first
        if (paddle.Checkout && paddle.Checkout.open) {
          console.log('Using paddle.Checkout.open method (v2)')
          checkout = await paddle.Checkout.open(checkoutConfig)
          console.log('✅ Checkout opened via paddle.Checkout.open:', checkout)
        } else if (typeof paddle.open === 'function') {
          console.log('Using paddle.open method (v2)')
          checkout = await paddle.open(checkoutConfig)
          console.log('✅ Checkout opened via paddle.open:', checkout)
        } else if (typeof (window as any).Paddle?.Checkout?.open === 'function') {
          console.log('Using global Paddle.Checkout.open method (v2)')
          checkout = await (window as any).Paddle.Checkout.open(checkoutConfig)
          console.log('✅ Checkout opened via global Paddle.Checkout.open:', checkout)
        } else {
          console.log('Available paddle methods:', Object.keys(paddle))
          console.log('Global Paddle methods:', Object.keys((window as any).Paddle || {}))
          throw new Error('No checkout method found on Paddle instance')
        }
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
        if (openError?.message?.includes('403')) {
          throw new Error('Authentication failed (403). Check if:\n1. Price ID exists and is active in Paddle Sandbox\n2. Client token is valid for sandbox environment\n3. Webhook URL is configured in Paddle dashboard')
        }

        if (openError?.message?.includes('price')) {
          throw new Error(`Price ID "${priceId}" not found or not active in Paddle Sandbox. Verify the price exists and is published.`)
        }

        throw openError
      }

      console.log('✅ Final checkout result:', checkout)

      // Restore original fetch and XHR after a delay
      setTimeout(() => {
        window.fetch = originalFetch
        window.XMLHttpRequest = originalXHR
        console.log('🔄 Network monitoring restored')
      }, 15000)
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