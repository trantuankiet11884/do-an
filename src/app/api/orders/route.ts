import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/supabaseServer'
import { verifyAuth } from '@/lib/auth/middleware'
import { createCheckoutSession } from '@/lib/stripe'

// api/orders/route.ts

// POST create new order (without order number initially)
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { shippingInfo, totalPrice, updateUserAddress, paymentMethod = 'COD', voucherCode, discountAmount } = body

    if (!shippingInfo || !totalPrice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createAdminClient()

    // Validate and apply voucher if provided
    let finalPrice = totalPrice
    let appliedDiscount = 0
    if (voucherCode) {
      const { data: voucher } = await supabase
        .from('vouchers')
        .select('*')
        .eq('code', voucherCode.toUpperCase().trim())
        .eq('is_active', true)
        .single()

      if (voucher) {
        const now = new Date()
        const validDate = new Date(voucher.start_date) <= now && new Date(voucher.end_date) >= now
        const validUsage = !voucher.usage_limit || voucher.used_count < voucher.usage_limit

        if (validDate && validUsage) {
          if (voucher.discount_type === 'PERCENT') {
            appliedDiscount = (totalPrice * parseFloat(voucher.discount_value)) / 100
            if (voucher.max_discount) {
              appliedDiscount = Math.min(appliedDiscount, parseFloat(voucher.max_discount))
            }
          } else {
            appliedDiscount = parseFloat(voucher.discount_value)
          }
          appliedDiscount = Math.min(appliedDiscount, totalPrice)
          finalPrice = totalPrice - appliedDiscount

          // Increment used_count
          await supabase
            .from('vouchers')
            .update({ used_count: voucher.used_count + 1, updated_at: new Date().toISOString() })
            .eq('id', voucher.id)
        }
      }
    }

    // Get user's cart items
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        *,
        products!inner(*),
        product_variants!left(*)
      `)
      .eq('user_id', user.id)

    if (cartError) {
      throw cartError
    }

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    // Update user's address if requested and different from current
    if (updateUserAddress) {
      const addressMatch = shippingInfo.match(/Address:\s*(.+)/)
      if (addressMatch) {
        const newAddress = addressMatch[1].trim()
        await supabase
          .from('users')
          .update({ address: newAddress })
          .eq('id', user.id)
      }
    }

    // Create order with voucher info
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        id: crypto.randomUUID(),
        user_id: user.id,
        total_price: finalPrice,
        shipping_info: shippingInfo,
        status: 'PENDING',
        payment_method: paymentMethod,
        payment_status: 'PENDING',
        order_number: null,
        voucher_code: voucherCode ? voucherCode.toUpperCase().trim() : null,
        discount_amount: appliedDiscount > 0 ? appliedDiscount : null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      throw orderError
    }

    // Create payment transaction record
    await supabase
      .from('payment_transactions')
      .insert({
        order_id: order.id,
        user_id: user.id,
        amount: finalPrice,
        payment_method: paymentMethod,
        payment_status: 'pending',
        updated_at: new Date().toISOString(),
      })

    // Create order items from cart items – use the price already stored in cart (which is the variant price if applicable)
    const orderItems = cartItems.map((item) => ({
      id: crypto.randomUUID(),
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      price: item.price, // ✅ Use the price from cart_items (correct variant or product price)
    }))

    const { error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (orderItemsError) {
      // Delete the order if order items creation fails
      await supabase.from('orders').delete().eq('id', order.id)
      throw orderItemsError
    }

    // Clear the cart
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)

    // Fetch complete order data
    const { data: completeOrder } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          products(*),
          product_variants(*)
        )
      `)
      .eq('id', order.id)
      .single()

    // If payment method is Stripe, generate checkout session directly
    let checkoutUrl = null;
    if (paymentMethod === 'STRIPE') {
      try {
        const session = await createCheckoutSession({
          order: completeOrder,
          user,
          origin: request.nextUrl.origin
        });
        
        checkoutUrl = session.url;
        
        // Update order with Stripe session ID for tracking
        await supabase
          .from('orders')
          .update({ stripe_session_id: session.id })
          .eq('id', order.id);
      } catch (stripeError) {
        console.error('Stripe Session Error:', stripeError);
        // We don't fail the whole order if Stripe session fails, 
        // the user can still be redirected to order success but with a warning or manual pay link later.
      }
    }

    return NextResponse.json(
      {
        order: completeOrder,
        checkoutUrl,
        message: paymentMethod === 'STRIPE' 
          ? 'Order created. Redirecting to payment...' 
          : 'Order placed successfully. It will be confirmed soon.',
      },
      { status: 201 }
    )

  } catch (error: any) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    )
  }
}

// GET user's orders – unchanged
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createAdminClient()

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          products(*),
          product_variants(*)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({
      orders: orders || [],
    })

  } catch (error: any) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}