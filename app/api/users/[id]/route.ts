/**
 * API Routes for individual User
 * GET /api/users/[id] - Get user by ID
 * PUT /api/users/[id] - Update user
 * DELETE /api/users/[id] - Delete user (soft delete)
 */

import { NextRequest, NextResponse } from "next/server"
import * as userQueries from "@/lib/db/queries/users"
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
    const user = await userQueries.getUserById(id)

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Failed to fetch user" },
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

    const user = await userQueries.updateUser(id, body)
    return NextResponse.json(user)
  } catch (error: any) {
    console.error("Error updating user:", error)
    
    if (error.message?.includes("not found")) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update user" },
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
    // Soft delete - set is_active to false
    await userQueries.updateUser(id, {})
    
    // Actually soft delete
    const { execute } = await import("@/lib/db")
    await execute(`UPDATE users SET is_active = false WHERE id = $1`, [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    )
  }
}
