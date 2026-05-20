"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, Appearance } from "@stripe/stripe-js";
import { ReactNode } from "react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const appearance: Appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#8b5cf6",
  },
};

interface StripeProviderProps {
  clientSecret: string;
  children: ReactNode;
}

export const StripeProvider = ({ clientSecret, children }: StripeProviderProps) => {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance,
      }}
    >
      {children}
    </Elements>
  );
};
