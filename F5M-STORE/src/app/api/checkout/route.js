import Stripe from "stripe";

export async function POST(req) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const body = await req.json();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: body.items.map((item) => ({
      price_data: {
        currency: "sar",
        product_data: { name: item.name },
        unit_amount: item.price * 100
      },
      quantity: item.qty
    })),
    success_url: "https://your-site.com/success",
    cancel_url: "https://your-site.com/cancel"
  });

  return Response.json({ sessionId: session.id });
}
