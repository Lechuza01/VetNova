/**
 * API Routes for Pets
 * GET /api/pets - Get all pets (optionally filtered by clientId)
 * POST /api/pets - Create a new pet
 */

import { NextRequest, NextResponse } from "next/server"
import * as petQueries from "@/lib/db/queries/pets"
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
    const clientId = searchParams.get("clientId")

    let pets
    if (clientId) {
      pets = await petQueries.getPetsByClientId(clientId)
    } else {
      pets = await petQueries.getAllPets()
    }

    return NextResponse.json(pets)
  } catch (error) {
    console.error("Error fetching pets:", error)
    return NextResponse.json(
      { error: "Failed to fetch pets" },
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
    const { name, clientId, animalId, breedId, birthDate, weight, color, microchipNumber, photo, notes } = body

    if (!name || !clientId) {
      return NextResponse.json(
        { error: "Missing required fields: name and clientId" },
        { status: 400 }
      )
    }

    const pet = await petQueries.createPet({
      name,
      clientId,
      animalId,
      breedId,
      birthDate,
      weight,
      color,
      microchipNumber,
      photo,
      notes,
    })

    return NextResponse.json(pet, { status: 201 })
  } catch (error: any) {
    console.error("Error creating pet:", error)
    return NextResponse.json(
      { error: "Failed to create pet", details: error.message },
      { status: 500 }
    )
  }
}
