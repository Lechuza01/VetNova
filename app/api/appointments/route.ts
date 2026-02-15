/**
 * API Routes for Appointments
 * GET /api/appointments - Get all appointments (with optional filters)
 * POST /api/appointments - Create a new appointment
 */

import { NextRequest, NextResponse } from "next/server"
import * as appointmentQueries from "@/lib/db/queries/appointments"
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
    const veterinarianId = searchParams.get("veterinarianId")
    const status = searchParams.get("status")
    const branchId = searchParams.get("branchId")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    let appointments

    if (clientId) {
      appointments = await appointmentQueries.getAppointmentsByClientId(clientId)
    } else if (veterinarianId) {
      appointments = await appointmentQueries.getAppointmentsByVeterinarianId(veterinarianId)
    } else {
      appointments = await appointmentQueries.getAllAppointments({
        status: status as any,
        branchId: branchId || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      })
    }

    return NextResponse.json(appointments)
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
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
    const { petId, clientId, veterinarianId, branchId, date, time, reason, status, notes } = body

    if (!petId || !clientId || !branchId || !date || !time) {
      return NextResponse.json(
        { error: "Missing required fields: petId, clientId, branchId, date, time" },
        { status: 400 }
      )
    }

    const appointment = await appointmentQueries.createAppointment({
      petId,
      clientId,
      veterinarianId,
      branchId,
      date,
      time,
      reason,
      status,
      notes,
    })

    return NextResponse.json(appointment, { status: 201 })
  } catch (error: any) {
    console.error("Error creating appointment:", error)
    
    if (error.message?.includes("unique") || error.message?.includes("duplicate")) {
      return NextResponse.json(
        { error: "Appointment conflict: Veterinarian already has an appointment at this time" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create appointment", details: error.message },
      { status: 500 }
    )
  }
}
