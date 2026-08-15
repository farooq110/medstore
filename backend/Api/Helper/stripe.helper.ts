import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const createStripeCustomer = async (email: string, name: string) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
    });
    return customer;
  } catch (error: any) {
    throw new Error(`Stripe Customer Creation Error: ${error.message}`);
  }
};

export const createCheckoutSession = async (
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) => {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    return session;
  } catch (error: any) {
    throw new Error(`Stripe Checkout Session Error: ${error.message}`);
  }
};

export const verifyStripeWebhook = (payload: string | Buffer, sig: string) => {
  try {
    return stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error: any) {
    throw new Error(`Stripe Webhook Verification Error: ${error.message}`);
  }
};

export default stripe;
