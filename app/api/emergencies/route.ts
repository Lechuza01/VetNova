/**
 * API Routes for Emergencies
 * GET /api/emergencies - Get all emergencies (with optional filters)
 * POST /api/emergencies - Create a new emergency
 */

import { NextRequest, NextResponse } from "next/server"
import * as emergencyQueries from "@/lib/db/queries/emergencies"
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
    const status = searchParams.get("status")
    const priority = searchParams.get("priority")
    const branchId = searchParams.get("branchId")

    let emergencies

    if (clientId) {
      emergencies = await emergencyQueries.getEmergenciesByClientId(clientId)
    } else {
      emergencies = await emergencyQueries.getAllEmergencies({
        status: status as any,
        priority: priority as any,
        branchId: branchId || undefined,
      })
    }

    return NextResponse.json(emergencies)
  } catch (error) {
    console.error("Error fetching emergencies:", error)
    return NextResponse.json(
      { error: "Failed to fetch emergencies" },
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
    const { petId, clientId, reportedBy, priority, description, symptoms, assignedTo, assignedBranchId, notes } = body

    if (!petId || !clientId || !reportedBy || !description) {
      return NextResponse.json(
        { error: "Missing required fields: petId, clientId, reportedBy, description" },
        { status: 400 }
      )
    }

    const emergency = await emergencyQueries.createEmergency({
      petId,
      clientId,
      reportedBy,
      priority,
      description,
      symptoms,
      assignedTo,
      assignedBranchId,
      notes,
    })

    return NextResponse.json(emergency, { status: 201 })
  } catch (error: any) {
    console.error("Error creating emergency:", error)
    return NextResponse.json(
      { error: "Failed to create emergency", details: error.message },
      { status: 500 }
    )
  }
}
