/**
 * API Routes for individual Pet
 * GET /api/pets/[id] - Get pet by ID
 * PUT /api/pets/[id] - Update pet
 * DELETE /api/pets/[id] - Delete pet
 */

import { NextRequest, NextResponse } from "next/server"
import * as petQueries from "@/lib/db/queries/pets"
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
    const pet = await petQueries.getPetById(id)

    if (!pet) {
      return NextResponse.json(
        { error: "Pet not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(pet)
  } catch (error) {
    console.error("Error fetching pet:", error)
    return NextResponse.json(
      { error: "Failed to fetch pet" },
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

    const pet = await petQueries.updatePet(id, body)
    return NextResponse.json(pet)
  } catch (error: any) {
    console.error("Error updating pet:", error)
    
    if (error.message?.includes("not found")) {
      return NextResponse.json(
        { error: "Pet not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update pet" },
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
    await petQueries.deletePet(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting pet:", error)
    return NextResponse.json(
      { error: "Failed to delete pet" },
      { status: 500 }
    )
  }
}
