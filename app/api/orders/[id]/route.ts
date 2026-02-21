/**
 * API Routes for individual Order
 * GET /api/orders/[id] - Get order by ID
 * PUT /api/orders/[id] - Update order (mainly status)
 * DELETE /api/orders/[id] - Delete order
 */

import { NextRequest, NextResponse } from "next/server"
import * as orderQueries from "@/lib/db/queries/orders"
import { isDbAvailable } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isDbAvailable()) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      )
    }

    const { id } = await params
    const order = await orderQueries.getOrderById(id)

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isDbAvailable()) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      )
    }

    const { id } = await params
    const body = await request.json()

    if (body.status) {
      const order = await orderQueries.updateOrderStatus(id, body.status)
      return NextResponse.json(order)
    }

    return NextResponse.json(
      { error: "Only status can be updated" },
      { status: 400 }
    )
  } catch (error: any) {
    console.error("Error updating order:", error)
    
    if (error.message?.includes("not found")) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isDbAvailable()) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      )
    }

    const { id } = await params
    await orderQueries.deleteOrder(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting order:", error)
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    )
  }
}
