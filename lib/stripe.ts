import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeInstance) return stripeInstance;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
  }
  stripeInstance = new Stripe(key, {
    // Use package default API version to prevent type mismatches during builds
    typescript: true,
  });
  return stripeInstance;
}

export default getStripe;
