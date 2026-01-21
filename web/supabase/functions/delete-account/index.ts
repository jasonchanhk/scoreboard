import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create Supabase client with service role for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase configuration' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Step 1: Get the user from the auth token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log(`Starting account deletion process for user ${user.id}`)

    // Step 2: Cancel Stripe subscription FIRST (before deleting database records)
    // We need to do this while we still have the subscription data in the database
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!subError && subscription && subscription.stripe_subscription_id) {
      const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
      if (stripeSecretKey) {
        try {
          const stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
          })

          // Cancel the subscription immediately (not at period end, since we're deleting the account)
          await stripe.subscriptions.cancel(subscription.stripe_subscription_id)
          console.log(`✓ Canceled Stripe subscription ${subscription.stripe_subscription_id} for user ${user.id}`)
        } catch (stripeError: any) {
          // Log the error but don't fail the account deletion if Stripe cancellation fails
          console.error('Error canceling Stripe subscription:', stripeError)
          // Continue with account deletion even if Stripe cancellation fails
        }
      }
    } else if (subError && subError.code !== 'PGRST116') {
      // PGRST116 is "not found" - that's fine, user might not have a subscription
      console.warn('Error fetching subscription:', subError)
    }

    // Step 3: Delete all scoreboards (BEFORE deleting user account)
    // This will cascade delete teams and quarters due to ON DELETE CASCADE constraints
    // We do this explicitly to ensure proper cleanup and logging
    const { data: scoreboards, error: scoreboardsError } = await supabase
      .from('scoreboards')
      .select('id')
      .eq('owner_id', user.id)

    if (!scoreboardsError && scoreboards && scoreboards.length > 0) {
      const scoreboardIds = scoreboards.map(sb => sb.id)
      const { error: deleteScoreboardsError } = await supabase
        .from('scoreboards')
        .delete()
        .in('id', scoreboardIds)

      if (deleteScoreboardsError) {
        console.error('Error deleting scoreboards:', deleteScoreboardsError)
        // Continue with account deletion even if scoreboard deletion fails
        // (CASCADE should handle it when user is deleted, but explicit deletion is preferred)
      } else {
        console.log(`✓ Deleted ${scoreboards.length} scoreboard(s) for user ${user.id}`)
        // Teams and quarters are automatically deleted via CASCADE when scoreboards are deleted
      }
    } else if (scoreboardsError) {
      console.warn('Error fetching scoreboards:', scoreboardsError)
    } else {
      console.log(`✓ No scoreboards found for user ${user.id}`)
    }

    // Step 4: Delete the user account LAST
    // This will cascade delete the subscription record in the database
    // (subscription record has ON DELETE CASCADE from auth.users)
    // All other data (scoreboards, teams, quarters) should already be deleted in Step 3
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('✗ Error deleting user:', deleteError)
      return new Response(
        JSON.stringify({ error: deleteError.message || 'Failed to delete account' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log(`✓ Successfully deleted user account ${user.id}`)
    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error: any) {
    console.error('Error in delete-account function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

