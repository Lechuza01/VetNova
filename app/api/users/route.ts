/**
 * API Routes for Users
 * GET /api/users - Get all users
 * POST /api/users - Create a new user
 */

import { NextRequest, NextResponse } from "next/server"
import * as userQueries from "@/lib/db/queries/users"
import { isDbAvailable } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    if (!isDbAvailable()) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      )
    }

    const users = await userQueries.getAllUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
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
    const { username, email, name, passwordHash, role, phone, address, birthDate, clientId, employeeId } = body

    if (!username || !email || !name || !passwordHash || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const user = await userQueries.createUser({
      username,
      email,
      name,
      passwordHash,
      role,
      phone,
      address,
      birthDate,
      clientId,
      employeeId,
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error: any) {
    console.error("Error creating user:", error)
    
    if (error.message?.includes("unique") || error.message?.includes("duplicate")) {
      return NextResponse.json(
        { error: "User with this email or username already exists" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    )
  }
}
