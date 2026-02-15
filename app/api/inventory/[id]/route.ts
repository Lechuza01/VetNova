/**
 * API Routes for individual Inventory Item
 * GET /api/inventory/[id] - Get inventory item by ID
 * PUT /api/inventory/[id] - Update inventory item
 * DELETE /api/inventory/[id] - Delete inventory item
 */

import { NextRequest, NextResponse } from "next/server"
import * as inventoryQueries from "@/lib/db/queries/inventory"
import { dbAvailable } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!dbAvailable) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      )
    }

    const { id } = await params
    const item = await inventoryQueries.getInventoryItemById(id)

    if (!item) {
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error("Error fetching inventory item:", error)
    return NextResponse.json(
      { error: "Failed to fetch inventory item" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!dbAvailable) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      )
    }

    const { id } = await params
    const body = await request.json()

    const item = await inventoryQueries.updateInventoryItem(id, body)
    return NextResponse.json(item)
  } catch (error: any) {
    console.error("Error updating inventory item:", error)
    
    if (error.message?.includes("not found")) {
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update inventory item" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!dbAvailable) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      )
    }

    const { id } = await params
    await inventoryQueries.deleteInventoryItem(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting inventory item:", error)
    return NextResponse.json(
      { error: "Failed to delete inventory item" },
      { status: 500 }
    )
  }
}
