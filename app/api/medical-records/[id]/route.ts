/**
 * API Routes for individual Medical Record
 * GET /api/medical-records/[id] - Get medical record by ID
 * PUT /api/medical-records/[id] - Update medical record
 * DELETE /api/medical-records/[id] - Delete medical record
 */

import { NextRequest, NextResponse } from "next/server"
import * as medicalRecordQueries from "@/lib/db/queries/medical-records"
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
    const record = await medicalRecordQueries.getMedicalRecordById(id)

    if (!record) {
      return NextResponse.json(
        { error: "Medical record not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(record)
  } catch (error) {
    console.error("Error fetching medical record:", error)
    return NextResponse.json(
      { error: "Failed to fetch medical record" },
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

    const record = await medicalRecordQueries.updateMedicalRecord(id, body)
    return NextResponse.json(record)
  } catch (error: any) {
    console.error("Error updating medical record:", error)
    
    if (error.message?.includes("not found")) {
      return NextResponse.json(
        { error: "Medical record not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update medical record" },
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
    await medicalRecordQueries.deleteMedicalRecord(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting medical record:", error)
    return NextResponse.json(
      { error: "Failed to delete medical record" },
      { status: 500 }
    )
  }
}
