/**
 * API Routes for individual Emergency
 * GET /api/emergencies/[id] - Get emergency by ID
 * PUT /api/emergencies/[id] - Update emergency
 * DELETE /api/emergencies/[id] - Delete emergency
 */

import { NextRequest, NextResponse } from "next/server"
import * as emergencyQueries from "@/lib/db/queries/emergencies"
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
    const emergency = await emergencyQueries.getEmergencyById(id)

    if (!emergency) {
      return NextResponse.json(
        { error: "Emergency not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(emergency)
  } catch (error) {
    console.error("Error fetching emergency:", error)
    return NextResponse.json(
      { error: "Failed to fetch emergency" },
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

    const emergency = await emergencyQueries.updateEmergency(id, body)
    return NextResponse.json(emergency)
  } catch (error: any) {
    console.error("Error updating emergency:", error)
    
    if (error.message?.includes("not found")) {
      return NextResponse.json(
        { error: "Emergency not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update emergency" },
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
    await emergencyQueries.deleteEmergency(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting emergency:", error)
    return NextResponse.json(
      { error: "Failed to delete emergency" },
      { status: 500 }
    )
  }
}
