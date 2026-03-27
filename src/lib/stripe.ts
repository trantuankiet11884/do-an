import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-01-27.acacia' as any, // Using a stable version
  appInfo: {
    name: 'Amba Ecommerce',
    version: '1.0.0',
  },
});
export const createCheckoutSession = async ({ 
  order, 
  user, 
  origin 
}: { 
  order: any; 
  user: any; 
  origin: string 
}) => {
  const lineItems = order.order_items.map((item: any) => {
    const name = item.product_variants 
      ? `${item.products.title} (${[item.product_variants.color, item.product_variants.size].filter(Boolean).join(' - ')})`
      : item.products.title;

    return {
      price_data: {
        currency: 'vnd',
        product_data: {
          name,
          images: item.products.images?.length > 0 ? [item.products.images[0]] : [],
        },
        unit_amount: Math.round(item.price), // VND doesn't have cents in Stripe
      },
      quantity: item.quantity,
    };
  });

  return await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${origin}/orders?success=true&orderId=${order.id}`,
    cancel_url: `${origin}/checkout?canceled=true`,
    metadata: {
      orderId: order.id,
      userId: user.id,
    },
    customer_email: user.email,
  });
};
