/**
 * API Routes for Medical Records
 * GET /api/medical-records - Get all medical records (with optional filters)
 * POST /api/medical-records - Create a new medical record
 */

import { NextRequest, NextResponse } from "next/server"
import * as medicalRecordQueries from "@/lib/db/queries/medical-records"
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
    const petId = searchParams.get("petId")
    const veterinarianId = searchParams.get("veterinarianId")
    const serviceType = searchParams.get("serviceType")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    let records

    if (petId) {
      records = await medicalRecordQueries.getMedicalRecordsByPetId(petId)
    } else {
      records = await medicalRecordQueries.getAllMedicalRecords({
        petId: petId || undefined,
        veterinarianId: veterinarianId || undefined,
        serviceType: serviceType as any,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      })
    }

    return NextResponse.json(records)
  } catch (error) {
    console.error("Error fetching medical records:", error)
    return NextResponse.json(
      { error: "Failed to fetch medical records" },
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
    const { petId, veterinarianId, serviceType, reason, diagnosis, treatment, observations, nextVisitDate, attachments } = body

    if (!petId || !veterinarianId) {
      return NextResponse.json(
        { error: "Missing required fields: petId, veterinarianId" },
        { status: 400 }
      )
    }

    const record = await medicalRecordQueries.createMedicalRecord({
      petId,
      veterinarianId,
      serviceType,
      reason,
      diagnosis,
      treatment,
      observations,
      nextVisitDate,
      attachments,
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error: any) {
    console.error("Error creating medical record:", error)
    return NextResponse.json(
      { error: "Failed to create medical record", details: error.message },
      { status: 500 }
    )
  }
}
