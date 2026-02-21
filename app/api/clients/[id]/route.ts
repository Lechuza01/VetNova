/**
 * API Routes for individual Client
 * GET /api/clients/[id] - Get client by ID
 * PUT /api/clients/[id] - Update client
 * DELETE /api/clients/[id] - Delete client
 */

import { NextRequest, NextResponse } from "next/server"
import * as clientQueries from "@/lib/db/queries/clients"
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
    const client = await clientQueries.getClientById(id)

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error("Error fetching client:", error)
    return NextResponse.json(
      { error: "Failed to fetch client" },
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

    const client = await clientQueries.updateClient(id, body)
    return NextResponse.json(client)
  } catch (error: any) {
    console.error("Error updating client:", error)
    
    if (error.message?.includes("not found")) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update client" },
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
    await clientQueries.deleteClient(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting client:", error)
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    )
  }
}
