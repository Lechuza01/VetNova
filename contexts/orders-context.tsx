"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Order } from "@/lib/types"

interface OrdersContextType {
  orders: Order[]
  addOrder: (order: Omit<Order, "id" | "date">) => void
  getOrderById: (id: string) => Order | undefined
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined)

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])

  // Cargar órdenes desde localStorage al montar
  useEffect(() => {
    const savedOrders = localStorage.getItem("vetnova_orders")
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders))
      } catch (error) {
        console.error("Error loading orders:", error)
      }
    }
  }, [])

  // Guardar órdenes en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem("vetnova_orders", JSON.stringify(orders))
  }, [orders])

  const addOrder = (orderData: Omit<Order, "id" | "date">) => {
    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    }
    setOrders((prev) => [newOrder, ...prev])
  }

  const getOrderById = (id: string) => {
    return orders.find((order) => order.id === id)
  }

  return (
    <OrdersContext.Provider
      value={{
        orders,
        addOrder,
        getOrderById,
      }}
    >
      {children}
    </OrdersContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrdersContext)
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrdersProvider")
  }
  return context
}

