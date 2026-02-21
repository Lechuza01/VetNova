/**
 * API Routes for Clients
 * GET /api/clients - Get all clients
 * POST /api/clients - Create a new client
 */

import { NextRequest, NextResponse } from "next/server"
import * as clientQueries from "@/lib/db/queries/clients"
import { isDbAvailable } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    if (!isDbAvailable()) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      )
    }

    const clients = await clientQueries.getAllClients()
    return NextResponse.json(clients)
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json(
      { error: "Failed to fetch clients" },
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
    const { firstName, lastName, email, phone, address, city, postalCode, dniCuit, birthDate, gender, notes } = body

    if (!firstName || !lastName || !email || !phone || !dniCuit) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const client = await clientQueries.createClient({
      firstName,
      lastName,
      email,
      phone,
      address: address || "",
      city: city || "",
      postalCode: postalCode || "",
      dniCuit,
      birthDate,
      gender,
      notes,
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error: any) {
    console.error("Error creating client:", error)
    
    if (error.message?.includes("unique") || error.message?.includes("duplicate")) {
      return NextResponse.json(
        { error: "Client with this DNI/CUIT or email already exists" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    )
  }
}
