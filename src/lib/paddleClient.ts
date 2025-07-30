class PaddleClient {
  private paddle: any = null
  private isInitialized = false

  async initialize() {
    if (this.isInitialized) return this.paddle

    try {
      // Dynamic import to avoid build issues
      const paddle = await import('@paddle/paddle-js')
      this.paddle = await paddle.initializePaddle({
        token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN!,
        environment: import.meta.env.VITE_PADDLE_ENVIRONMENT as 'production' | 'sandbox'
      })
      
      this.isInitialized = true
      return this.paddle
    } catch (error) {
      console.error('Error initializing Paddle:', error)
      throw error
    }
  }

  async openCheckout(priceId: string, customerId?: string) {
    const paddle = await this.initialize()
    if (!paddle) throw new Error('Paddle not initialized')

    try {
      const checkout = await paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customerId,
        successUrl: `${window.location.origin}/billing/success`,
        closeUrl: `${window.location.origin}/billing`
      })
      
      return checkout
    } catch (error) {
      console.error('Error opening checkout:', error)
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