/**
 * Test endpoint to verify database connection
 * GET /api/test-db - Check if database is connected
 */

import { NextResponse } from "next/server"
import { checkConnection, isDbAvailable } from "@/lib/db"

export async function GET() {
  const hasEnvVar = isDbAvailable()
  const connected = hasEnvVar ? await checkConnection() : false
  
  return NextResponse.json({ 
    connected,
    hasEnvVar,
    postgresUrl: hasEnvVar ? "configured" : "not configured"
  })
}
