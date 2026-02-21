/**
 * Test endpoint to verify login functionality
 * POST /api/test-login - Test login with admin credentials
 */

import { NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { isDbAvailable } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username = "admin", password = "admin123" } = body

    if (!isDbAvailable()) {
      return NextResponse.json({
        error: "Database not available",
        dbAvailable: false
      })
    }

    // Get user from database
    const result = await sql.query(
      `SELECT id, username, email, name, role, phone, address, birth_date, password_hash 
       FROM users 
       WHERE (username = $1 OR email = $1) AND is_active = true`,
      [username]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({
        error: "User not found",
        username,
        userFound: false
      })
    }

    const dbUser = result.rows[0]
    const passwordHash = dbUser.password_hash

    // Try to verify password
    let verified = false
    let verificationError = null

    try {
      const verifyResult = await sql.query(
        `SELECT crypt($1, $2) = $2 as verified`,
        [password, passwordHash]
      )
      verified = verifyResult.rows[0]?.verified || false
    } catch (error: any) {
      verificationError = error.message
    }

    return NextResponse.json({
      userFound: true,
      username: dbUser.username,
      email: dbUser.email,
      passwordHash: passwordHash.substring(0, 20) + "...", // Show first 20 chars only
      verified,
      verificationError,
      message: verified ? "Password verified successfully" : "Password verification failed"
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST method with { username: 'admin', password: 'admin123' }",
    dbAvailable: isDbAvailable()
  })
}
