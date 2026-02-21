/**
 * API Route for Login
 * POST /api/auth/login - Authenticate user with username/email and password
 */

/**
 * API Route for Login
 * POST /api/auth/login - Authenticate user with username/email and password
 */

import { NextRequest, NextResponse } from "next/server"
import * as userQueries from "@/lib/db/queries/users"
import { dbAvailable } from "@/lib/db"
import { sql } from "@vercel/postgres"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      )
    }

    // If database is available, check against DB
    if (dbAvailable) {
      // Get user and password hash from database
      const result = await sql.query(
        `SELECT id, username, email, name, role, phone, address, birth_date, password_hash 
         FROM users 
         WHERE (username = $1 OR email = $1) AND is_active = true`,
        [username]
      )

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        )
      }

      const dbUser = result.rows[0]
      const passwordHash = dbUser.password_hash

      // Verify password using pgcrypto crypt function
      // crypt() with the same salt returns the same hash if password matches
      const verifyResult = await sql.query(
        `SELECT crypt($1, $2) = $2 as verified`,
        [password, passwordHash]
      )

      if (!verifyResult.rows[0]?.verified) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        )
      }

      // Return user without password
      return NextResponse.json({
        id: dbUser.id,
        username: dbUser.username,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        phone: dbUser.phone || undefined,
        address: dbUser.address || undefined,
        birthDate: dbUser.birth_date || undefined,
      })
    }

    // Fallback to mock data if DB not available
    return NextResponse.json(
      { error: "Database not available. Please configure POSTGRES_URL." },
      { status: 503 }
    )
  } catch (error: any) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Failed to authenticate" },
      { status: 500 }
    )
  }
}
