/**
 * API Routes for Pets
 * GET /api/pets - Get all pets (optionally filtered by clientId)
 * POST /api/pets - Create a new pet
 */

import { NextRequest, NextResponse } from "next/server"
import * as petQueries from "@/lib/db/queries/pets"
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
    if (!isDbAvailable()) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { name, clientId, animalId, breedId, species, breed, birthDate, weight, color, microchipNumber, photo, notes } = body

    if (!name || !clientId) {
      return NextResponse.json(
        { error: "Missing required fields: name and clientId" },
        { status: 400 }
      )
    }

    // Resolve animalId from species name if not provided
    let resolvedAnimalId = animalId
    if (!resolvedAnimalId && species) {
      const { sql } = await import("@vercel/postgres")
      const animalResult = await sql.query(
        `SELECT id FROM animals WHERE name = $1 LIMIT 1`,
        [species]
      )
      if (animalResult.rows.length > 0) {
        resolvedAnimalId = animalResult.rows[0].id
      } else {
        // Create animal if it doesn't exist
        const newAnimalResult = await sql.query(
          `INSERT INTO animals (name) VALUES ($1) RETURNING id`,
          [species]
        )
        resolvedAnimalId = newAnimalResult.rows[0].id
      }
    }

    // Resolve breedId from breed name if not provided
    let resolvedBreedId = breedId
    if (!resolvedBreedId && breed && resolvedAnimalId) {
      const { sql } = await import("@vercel/postgres")
      const breedResult = await sql.query(
        `SELECT id FROM breeds WHERE animal_id = $1 AND name = $2 LIMIT 1`,
        [resolvedAnimalId, breed]
      )
      if (breedResult.rows.length > 0) {
        resolvedBreedId = breedResult.rows[0].id
      } else {
        // Create breed if it doesn't exist
        const newBreedResult = await sql.query(
          `INSERT INTO breeds (animal_id, name) VALUES ($1, $2) RETURNING id`,
          [resolvedAnimalId, breed]
        )
        resolvedBreedId = newBreedResult.rows[0].id
      }
    }

    const pet = await petQueries.createPet({
      name,
      clientId,
      animalId: resolvedAnimalId,
      breedId: resolvedBreedId,
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
