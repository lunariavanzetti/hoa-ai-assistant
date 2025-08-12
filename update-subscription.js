// Temporary script to manually update subscription status
// Run this in browser console to update your subscription

async function updateSubscriptionStatus() {
  try {
    const user = useAuthStore.getState().user
    console.log('Current user:', user.id)
    
    // Update user subscription tier in Supabase
    const { data, error } = await supabase
      .from('users')
      .update({ 
        subscription_tier: 'pro',
        paddle_customer_id: 'manual_pro_upgrade' // Temporary value
      })
      .eq('id', user.id)
      .select()
    
    if (error) {
      console.error('Update error:', error)
    } else {
      console.log('✅ Subscription updated successfully:', data)
      
      // Refresh the user data
      const { data: updatedUser } = await supabase.auth.getUser()
      if (updatedUser?.user) {
        // Update the auth store
        useAuthStore.getState().setUser(updatedUser.user)
        console.log('✅ User data refreshed')
        
        // Reload the page to see changes
        window.location.reload()
      }
    }
  } catch (error) {
    console.error('Script error:', error)
  }
}

// Call the function
updateSubscriptionStatus()