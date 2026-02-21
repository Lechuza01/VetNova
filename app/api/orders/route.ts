/**
 * API Routes for Orders
 * GET /api/orders - Get all orders (with optional filters)
 * POST /api/orders - Create a new order
 */

import { NextRequest, NextResponse } from "next/server"
import * as orderQueries from "@/lib/db/queries/orders"
import { isDbAvailable } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    if (!isDbAvailable()) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("clientId")
    const status = searchParams.get("status")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    let orders

    if (clientId) {
      orders = await orderQueries.getOrdersByClientId(clientId)
    } else {
      orders = await orderQueries.getAllOrders({
        status: status as any,
        clientId: clientId || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      })
    }

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isDbAvailable()) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { clientId, userId, items, totalAmount, paymentMethod, paymentDetails, shippingAddress, notes } = body

    if (!userId || !items || !Array.isArray(items) || items.length === 0 || !totalAmount || !paymentMethod) {
      return NextResponse.json(
        { error: "Missing required fields: userId, items, totalAmount, paymentMethod" },
        { status: 400 }
      )
    }

    const order = await orderQueries.createOrder({
      clientId,
      userId,
      items,
      totalAmount,
      paymentMethod,
      paymentDetails,
      shippingAddress,
      notes,
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error: any) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      { error: "Failed to create order", details: error.message },
      { status: 500 }
    )
  }
}
