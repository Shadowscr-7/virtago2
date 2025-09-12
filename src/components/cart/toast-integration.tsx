"use client";

import { useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import { setToastFunction } from "@/components/cart/cart-store";

export function ToastIntegration() {
  const { showToast } = useToast();

  useEffect(() => {
    // Set the toast function in the cart store so it can be used
    setToastFunction(showToast);
  }, [showToast]);

  // This component doesn't render anything, it just sets up the integration
  return null;
}
