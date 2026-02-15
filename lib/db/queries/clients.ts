/**
 * Client database queries
 */

import { query, queryOne, execute } from "@/lib/db"
import type { Client } from "@/lib/types"

export async function getClientById(id: string): Promise<Client | null> {
  const result = await queryOne<{
    id: string
    registration_date: string
    notes: string | null
    first_name: string
    last_name: string
    email: string | null
    phone: string | null
    address: string | null
    city: string | null
    postal_code: string | null
  }>(
    `SELECT 
      c.id, 
      c.registration_date, 
      c.notes,
      p.first_name,
      p.last_name,
      p.email,
      p.phone,
      p.address,
      p.city,
      p.postal_code
     FROM clients c
     JOIN persons p ON c.person_id = p.id
     WHERE c.id = $1`,
    [id]
  )

  if (!result) return null

  return {
    id: result.id,
    name: `${result.first_name} ${result.last_name}`,
    email: result.email || "",
    phone: result.phone || "",
    address: result.address || "",
    city: result.city || "",
    postalCode: result.postal_code || "",
    registrationDate: result.registration_date,
    notes: result.notes || undefined,
  }
}

export async function getAllClients(): Promise<Client[]> {
  const results = await query<{
    id: string
    registration_date: string
    notes: string | null
    first_name: string
    last_name: string
    email: string | null
    phone: string | null
    address: string | null
    city: string | null
    postal_code: string | null
  }>(
    `SELECT 
      c.id, 
      c.registration_date, 
      c.notes,
      p.first_name,
      p.last_name,
      p.email,
      p.phone,
      p.address,
      p.city,
      p.postal_code
     FROM clients c
     JOIN persons p ON c.person_id = p.id
     ORDER BY c.registration_date DESC`
  )

  return results.map((r) => ({
    id: r.id,
    name: `${r.first_name} ${r.last_name}`,
    email: r.email || "",
    phone: r.phone || "",
    address: r.address || "",
    city: r.city || "",
    postalCode: r.postal_code || "",
    registrationDate: r.registration_date,
    notes: r.notes || undefined,
  }))
}

export async function createClient(clientData: {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  dniCuit: string
  birthDate?: string
  gender?: string
  notes?: string
}): Promise<Client> {
  // First create person
  const personResult = await queryOne<{ id: string }>(
    `INSERT INTO persons (first_name, last_name, email, phone, address, city, postal_code, dni_cuit, birth_date, gender)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id`,
    [
      clientData.firstName,
      clientData.lastName,
      clientData.email,
      clientData.phone,
      clientData.address,
      clientData.city,
      clientData.postalCode,
      clientData.dniCuit,
      clientData.birthDate || null,
      clientData.gender || null,
    ]
  )

  if (!personResult) throw new Error("Failed to create person")

  // Then create client
  const clientResult = await queryOne<{
    id: string
    registration_date: string
    notes: string | null
  }>(
    `INSERT INTO clients (person_id, notes)
     VALUES ($1, $2)
     RETURNING id, registration_date, notes`,
    [personResult.id, clientData.notes || null]
  )

  if (!clientResult) throw new Error("Failed to create client")

  return {
    id: clientResult.id,
    name: `${clientData.firstName} ${clientData.lastName}`,
    email: clientData.email,
    phone: clientData.phone,
    address: clientData.address,
    city: clientData.city,
    postalCode: clientData.postalCode,
    registrationDate: clientResult.registration_date,
    notes: clientResult.notes || undefined,
  }
}

export async function updateClient(id: string, updates: Partial<{
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  notes: string
}>): Promise<Client> {
  const client = await queryOne<{ person_id: string }>(
    `SELECT person_id FROM clients WHERE id = $1`,
    [id]
  )

  if (!client) throw new Error("Client not found")

  // Update person fields
  const personFields: string[] = []
  const personValues: any[] = []
  let paramIndex = 1

  if (updates.email !== undefined) {
    personFields.push(`email = $${paramIndex++}`)
    personValues.push(updates.email)
  }
  if (updates.phone !== undefined) {
    personFields.push(`phone = $${paramIndex++}`)
    personValues.push(updates.phone)
  }
  if (updates.address !== undefined) {
    personFields.push(`address = $${paramIndex++}`)
    personValues.push(updates.address)
  }
  if (updates.city !== undefined) {
    personFields.push(`city = $${paramIndex++}`)
    personValues.push(updates.city)
  }
  if (updates.postalCode !== undefined) {
    personFields.push(`postal_code = $${paramIndex++}`)
    personValues.push(updates.postalCode)
  }

  if (personFields.length > 0) {
    personValues.push(client.person_id)
    await execute(
      `UPDATE persons SET ${personFields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex}`,
      personValues
    )
  }

  // Update client fields
  if (updates.notes !== undefined) {
    await execute(
      `UPDATE clients SET notes = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [updates.notes, id]
    )
  }

  const updated = await getClientById(id)
  if (!updated) throw new Error("Failed to retrieve updated client")
  return updated
}

export async function deleteClient(id: string): Promise<void> {
  // This will cascade delete the person due to ON DELETE CASCADE
  await execute(`DELETE FROM clients WHERE id = $1`, [id])
}
