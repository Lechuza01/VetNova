/**
 * API Route for Login
 * POST /api/auth/login - Authenticate user with username/email and password
 */

import { NextRequest, NextResponse } from "next/server"
import * as userQueries from "@/lib/db/queries/users"
import { isDbAvailable } from "@/lib/db"
import { sql } from "@vercel/postgres"

// GET method for debugging - returns API status
export async function GET() {
  return NextResponse.json({
    message: "Login API is working",
    method: "POST",
    endpoint: "/api/auth/login",
    dbAvailable: isDbAvailable(),
  })
}

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
    if (isDbAvailable()) {
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
      let verified = false
      try {
        const verifyResult = await sql.query(
          `SELECT crypt($1, $2) = $2 as verified`,
          [password, passwordHash]
        )
        verified = verifyResult.rows[0]?.verified || false
      } catch (verifyError: any) {
        console.error("Password verification error:", verifyError)
        return NextResponse.json(
          { error: "Password verification failed", details: verifyError.message },
          { status: 500 }
        )
      }

      if (!verified) {
        console.log("Password verification failed for user:", username)
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
