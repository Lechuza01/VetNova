/**
 * API Routes for Inventory
 * GET /api/inventory - Get all inventory items (with optional filters)
 * POST /api/inventory - Create a new inventory item
 */

import { NextRequest, NextResponse } from "next/server"
import * as inventoryQueries from "@/lib/db/queries/inventory"
import { dbAvailable } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    if (!dbAvailable) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    const items = await inventoryQueries.getAllInventoryItems({
      category: category as any,
      search: search || undefined,
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!dbAvailable) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { name, category, description, inventoryCategoryId, unitOfMeasure, minStock, price, supplier, expiryDate, notes } = body

    if (!name || !category) {
      return NextResponse.json(
        { error: "Missing required fields: name, category" },
        { status: 400 }
      )
    }

    const item = await inventoryQueries.createInventoryItem({
      name,
      category,
      description,
      inventoryCategoryId,
      unitOfMeasure,
      minStock,
      price,
      supplier,
      expiryDate,
      notes,
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error: any) {
    console.error("Error creating inventory item:", error)
    return NextResponse.json(
      { error: "Failed to create inventory item", details: error.message },
      { status: 500 }
    )
  }
}
