/**
 * Database connection and utilities
 * Uses Vercel Postgres for production, falls back to mocks in development if DB not available
 */

import { sql } from "@vercel/postgres"

// Check if database is available (runtime check)
export function isDbAvailable(): boolean {
  return !!process.env.POSTGRES_URL
}

// For backward compatibility
export const dbAvailable = isDbAvailable()

/**
 * Execute a SQL query
 */
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  if (!dbAvailable) {
    throw new Error("Database not available. Please configure POSTGRES_URL environment variable.")
  }
  
  try {
    const result = await sql.query(text, params)
    return result.rows as T[]
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

/**
 * Execute a SQL query and return a single row
 */
export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const results = await query<T>(text, params)
  return results[0] || null
}

/**
 * Execute a SQL query and return the number of affected rows
 */
export async function execute(text: string, params?: any[]): Promise<number> {
  if (!dbAvailable) {
    throw new Error("Database not available. Please configure POSTGRES_URL environment variable.")
  }
  
  try {
    const result = await sql.query(text, params)
    return result.rowCount || 0
  } catch (error) {
    console.error("Database execute error:", error)
    throw error
  }
}

/**
 * Check database connection
 */
export async function checkConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1`
    return true
  } catch (error) {
    return false
  }
}
