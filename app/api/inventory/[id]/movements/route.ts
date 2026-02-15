/**
 * API Routes for Inventory Movements
 * GET /api/inventory/[id]/movements - Get movements for an inventory item
 * POST /api/inventory/[id]/movements - Create a movement (ingreso/egreso/ajuste)
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
    const movements = await inventoryQueries.getInventoryMovements(id)

    return NextResponse.json(movements)
  } catch (error) {
    console.error("Error fetching inventory movements:", error)
    return NextResponse.json(
      { error: "Failed to fetch inventory movements" },
      { status: 500 }
    )
  }
}

export async function POST(
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
    const { movementType, quantity, reason, referenceId, referenceType, createdBy, notes } = body

    if (!movementType || quantity === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: movementType, quantity" },
        { status: 400 }
      )
    }

    await inventoryQueries.createInventoryMovement({
      inventoryItemId: id,
      movementType,
      quantity,
      reason,
      referenceId,
      referenceType,
      createdBy,
      notes,
    })

    // Retornar el item actualizado
    const updatedItem = await inventoryQueries.getInventoryItemById(id)
    return NextResponse.json(updatedItem, { status: 201 })
  } catch (error: any) {
    console.error("Error creating inventory movement:", error)
    
    if (error.message?.includes("Stock insuficiente")) {
      return NextResponse.json(
        { error: "Stock insuficiente para realizar este egreso" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create inventory movement", details: error.message },
      { status: 500 }
    )
  }
}
