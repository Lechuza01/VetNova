/**
 * API Routes for individual Appointment
 * GET /api/appointments/[id] - Get appointment by ID
 * PUT /api/appointments/[id] - Update appointment
 * DELETE /api/appointments/[id] - Delete appointment
 */

import { NextRequest, NextResponse } from "next/server"
import * as appointmentQueries from "@/lib/db/queries/appointments"
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
    const appointment = await appointmentQueries.getAppointmentById(id)

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(appointment)
  } catch (error) {
    console.error("Error fetching appointment:", error)
    return NextResponse.json(
      { error: "Failed to fetch appointment" },
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

    const appointment = await appointmentQueries.updateAppointment(id, body)
    return NextResponse.json(appointment)
  } catch (error: any) {
    console.error("Error updating appointment:", error)
    
    if (error.message?.includes("not found")) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      )
    }

    if (error.message?.includes("unique") || error.message?.includes("duplicate")) {
      return NextResponse.json(
        { error: "Appointment conflict: Veterinarian already has an appointment at this time" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update appointment" },
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
    await appointmentQueries.deleteAppointment(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting appointment:", error)
    return NextResponse.json(
      { error: "Failed to delete appointment" },
      { status: 500 }
    )
  }
}
