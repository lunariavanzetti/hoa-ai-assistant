import React, { useState } from 'react'

export const SimpleCheckout: React.FC = () => {
  const [status, setStatus] = useState<string>('Ready to test')
  const [logs, setLogs] = useState<string[]>([])

  const log = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testBasicPaddle = async () => {
    setStatus('Testing...')
    log('🧪 Starting basic Paddle test')
    
    try {
      // Test environment variables
      const env = import.meta.env.VITE_PADDLE_ENVIRONMENT
      const token = import.meta.env.VITE_PADDLE_SANDBOX_CLIENT_TOKEN
      
      log(`Environment: ${env}`)
      log(`Token found: ${!!token}`)
      
      if (!token) {
        throw new Error('No client token found')
      }

      // Test Paddle import
      log('📦 Importing Paddle SDK...')
      const paddleModule = await import('@paddle/paddle-js')
      log(`Paddle module keys: ${Object.keys(paddleModule).join(', ')}`)
      
      // Test initialization
      log('🚀 Initializing Paddle...')
      log('Using initializePaddle method')
      const paddle = await paddleModule.initializePaddle({
        token: token,
        environment: env as 'production' | 'sandbox'
      })
      
      if (!paddle) {
        throw new Error('Paddle initialization returned null')
      }
      
      log('✅ Paddle initialized successfully')
      log(`Paddle methods: ${Object.keys(paddle).join(', ')}`)
      
      // Test checkout with demo price
      log('🛒 Testing checkout with demo price...')
      const demoPrice = 'pri_01gsz91wy9k1yn7kx82aafwvea'
      
      const checkoutConfig = {
        items: [{ priceId: demoPrice, quantity: 1 }],
        successUrl: `${window.location.origin}/success`,
        closeUrl: window.location.href
      }
      
      log(`Checkout config: ${JSON.stringify(checkoutConfig, null, 2)}`)
      
      // Try different checkout methods
      let result: any
      if (paddle.Checkout && paddle.Checkout.open) {
        log('Using paddle.Checkout.open method')
        result = await paddle.Checkout.open(checkoutConfig)
      } else if ((paddle as any).open) {
        log('Using paddle.open method')
        result = await (paddle as any).open(checkoutConfig)
      } else {
        log(`Available paddle methods: ${Object.keys(paddle).join(', ')}`)
        throw new Error('No checkout method found')
      }
      
      log(`✅ Checkout result: ${JSON.stringify(result)}`)
      
      setStatus('✅ Test completed successfully!')
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      log(`❌ Error: ${errorMessage}`)
      
      if (error instanceof Error && error.stack) {
        log(`Stack: ${error.stack}`)
      }
      
      // Log the full error object
      log(`Full error: ${JSON.stringify(error, null, 2)}`)
      
      setStatus(`❌ Error: ${errorMessage}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">🔧 Simple Paddle Test</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Status</h2>
          <p>{status}</p>
        </div>
        
        <button 
          onClick={testBasicPaddle}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Run Paddle Test
        </button>
        
        <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
          <h2 className="text-white font-semibold mb-2">Debug Log</h2>
          {logs.length === 0 ? (
            <p className="text-gray-400">No logs yet. Click "Run Paddle Test" to start.</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))
          )}
        </div>
        
        <div className="bg-yellow-100 border border-yellow-400 p-4 rounded">
          <h3 className="font-semibold text-yellow-800 mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside text-yellow-700 space-y-1">
            <li>Click "Run Paddle Test" to start the diagnostic</li>
            <li>Watch the debug log for detailed information</li>
            <li>If a Paddle checkout window opens, the integration is working!</li>
            <li>If you see errors, check the browser's Network tab for 400/403 errors</li>
          </ol>
        </div>
      </div>
    </div>
  )
}