"use client"

import type React from "react"

import { AuthProvider } from "@/contexts/auth-context"
import { ClinicProvider } from "@/contexts/clinic-context"
import { CartProvider } from "@/contexts/cart-context"
import { OrdersProvider } from "@/contexts/orders-context"
import { CommunityProvider } from "@/contexts/community-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ClinicProvider>
        <CartProvider>
          <OrdersProvider>
            <CommunityProvider>{children}</CommunityProvider>
          </OrdersProvider>
        </CartProvider>
      </ClinicProvider>
    </AuthProvider>
  )
}
