/**
 * User database queries
 */

import { query, queryOne, execute } from "@/lib/db"
import type { User } from "@/lib/types"

export async function getUserById(id: string): Promise<User | null> {
  const result = await queryOne<{
    id: string
    username: string
    email: string
    name: string
    role: string
    phone: string | null
    address: string | null
    birth_date: string | null
    created_at: string
  }>(
    `SELECT id, username, email, name, role, phone, address, birth_date, created_at 
     FROM users 
     WHERE id = $1 AND is_active = true`,
    [id]
  )

  if (!result) return null

  return {
    id: result.id,
    username: result.username,
    email: result.email,
    name: result.name,
    role: result.role as User["role"],
    phone: result.phone || undefined,
    address: result.address || undefined,
    birthDate: result.birth_date || undefined,
    createdAt: result.created_at,
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await queryOne<{
    id: string
    username: string
    email: string
    name: string
    role: string
    phone: string | null
    address: string | null
    birth_date: string | null
    created_at: string
    password_hash: string
  }>(
    `SELECT id, username, email, name, role, phone, address, birth_date, created_at, password_hash 
     FROM users 
     WHERE email = $1 AND is_active = true`,
    [email]
  )

  if (!result) return null

  return {
    id: result.id,
    username: result.username,
    email: result.email,
    name: result.name,
    role: result.role as User["role"],
    phone: result.phone || undefined,
    address: result.address || undefined,
    birthDate: result.birth_date || undefined,
    createdAt: result.created_at,
  }
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const result = await queryOne<{
    id: string
    username: string
    email: string
    name: string
    role: string
    phone: string | null
    address: string | null
    birth_date: string | null
    created_at: string
  }>(
    `SELECT id, username, email, name, role, phone, address, birth_date, created_at 
     FROM users 
     WHERE username = $1 AND is_active = true`,
    [username]
  )

  if (!result) return null

  return {
    id: result.id,
    username: result.username,
    email: result.email,
    name: result.name,
    role: result.role as User["role"],
    phone: result.phone || undefined,
    address: result.address || undefined,
    birthDate: result.birth_date || undefined,
    createdAt: result.created_at,
  }
}

export async function createUser(userData: {
  username: string
  email: string
  name: string
  passwordHash: string
  role: User["role"]
  phone?: string
  address?: string
  birthDate?: string
  clientId?: string
  employeeId?: string
}): Promise<User> {
  const result = await queryOne<{
    id: string
    username: string
    email: string
    name: string
    role: string
    phone: string | null
    address: string | null
    birth_date: string | null
    created_at: string
  }>(
    `INSERT INTO users (username, email, name, password_hash, role, phone, address, birth_date, client_id, employee_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id, username, email, name, role, phone, address, birth_date, created_at`,
    [
      userData.username,
      userData.email,
      userData.name,
      userData.passwordHash,
      userData.role,
      userData.phone || null,
      userData.address || null,
      userData.birthDate || null,
      userData.clientId || null,
      userData.employeeId || null,
    ]
  )

  if (!result) throw new Error("Failed to create user")

  return {
    id: result.id,
    username: result.username,
    email: result.email,
    name: result.name,
    role: result.role as User["role"],
    phone: result.phone || undefined,
    address: result.address || undefined,
    birthDate: result.birth_date || undefined,
    createdAt: result.created_at,
  }
}

export async function updateUser(id: string, updates: Partial<{
  email: string
  name: string
  phone: string
  address: string
  birthDate: string
  lastLogin: string
}>): Promise<User> {
  const fields: string[] = []
  const values: any[] = []
  let paramIndex = 1

  if (updates.email !== undefined) {
    fields.push(`email = $${paramIndex++}`)
    values.push(updates.email)
  }
  if (updates.name !== undefined) {
    fields.push(`name = $${paramIndex++}`)
    values.push(updates.name)
  }
  if (updates.phone !== undefined) {
    fields.push(`phone = $${paramIndex++}`)
    values.push(updates.phone)
  }
  if (updates.address !== undefined) {
    fields.push(`address = $${paramIndex++}`)
    values.push(updates.address)
  }
  if (updates.birthDate !== undefined) {
    fields.push(`birth_date = $${paramIndex++}`)
    values.push(updates.birthDate)
  }
  if (updates.lastLogin !== undefined) {
    fields.push(`last_login = $${paramIndex++}`)
    values.push(updates.lastLogin)
  }

  if (fields.length === 0) {
    const user = await getUserById(id)
    if (!user) throw new Error("User not found")
    return user
  }

  values.push(id)

  const result = await queryOne<{
    id: string
    username: string
    email: string
    name: string
    role: string
    phone: string | null
    address: string | null
    birth_date: string | null
    created_at: string
  }>(
    `UPDATE users 
     SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${paramIndex}
     RETURNING id, username, email, name, role, phone, address, birth_date, created_at`,
    values
  )

  if (!result) throw new Error("Failed to update user")

  return {
    id: result.id,
    username: result.username,
    email: result.email,
    name: result.name,
    role: result.role as User["role"],
    phone: result.phone || undefined,
    address: result.address || undefined,
    birthDate: result.birth_date || undefined,
    createdAt: result.created_at,
  }
}

export async function getAllUsers(): Promise<User[]> {
  const results = await query<{
    id: string
    username: string
    email: string
    name: string
    role: string
    phone: string | null
    address: string | null
    birth_date: string | null
    created_at: string
  }>(
    `SELECT id, username, email, name, role, phone, address, birth_date, created_at 
     FROM users 
     WHERE is_active = true 
     ORDER BY created_at DESC`
  )

  return results.map((r) => ({
    id: r.id,
    username: r.username,
    email: r.email,
    name: r.name,
    role: r.role as User["role"],
    phone: r.phone || undefined,
    address: r.address || undefined,
    birthDate: r.birth_date || undefined,
    createdAt: r.created_at,
  }))
}
