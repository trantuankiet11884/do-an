import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/supabaseServer';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed.`, err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const orderId = session.metadata.orderId;

    const supabase = await createAdminClient();

    // Update order status
    const { error } = await supabase
      .from('orders')
      .update({
        payment_status: 'PAID',
        status: 'PROCESSING',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order after successful payment:', error);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    // Update payment transaction
    await supabase
      .from('payment_transactions')
      .update({
        payment_status: 'success',
        stripe_session_id: session.id,
        transaction_id: session.payment_intent,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', orderId);

    console.log(`Order ${orderId} marked as PAID`);
  }

  return NextResponse.json({ received: true });
}

// Disable body parsing for Stripe webhooks
export const config = {
  api: {
    bodyParser: false,
  },
};
