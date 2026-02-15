/**
 * Appointment database queries
 */

import { query, queryOne, execute } from "../db"
import type { Appointment } from "@/lib/types"

export async function getAppointmentById(id: string): Promise<Appointment | null> {
  const result = await queryOne<{
    id: string
    pet_id: string
    client_id: string
    veterinarian_id: string | null
    branch_id: string
    appointment_date: string
    appointment_time: string
    reason: string | null
    status: string
    notes: string | null
    created_at: string
    updated_at: string
  }>(
    `SELECT id, pet_id, client_id, veterinarian_id, branch_id, appointment_date, appointment_time, reason, status, notes, created_at, updated_at
     FROM appointments
     WHERE id = $1`,
    [id]
  )

  if (!result) return null

  return {
    id: result.id,
    petId: result.pet_id,
    clientId: result.client_id,
    veterinarianId: result.veterinarian_id || "",
    branchId: result.branch_id,
    date: result.appointment_date,
    time: result.appointment_time,
    reason: result.reason || "",
    status: result.status as Appointment["status"],
    notes: result.notes || undefined,
  }
}

export async function getAppointmentsByClientId(clientId: string): Promise<Appointment[]> {
  const results = await query<{
    id: string
    pet_id: string
    client_id: string
    veterinarian_id: string | null
    branch_id: string
    appointment_date: string
    appointment_time: string
    reason: string | null
    status: string
    notes: string | null
    created_at: string
    updated_at: string
  }>(
    `SELECT id, pet_id, client_id, veterinarian_id, branch_id, appointment_date, appointment_time, reason, status, notes, created_at, updated_at
     FROM appointments
     WHERE client_id = $1
     ORDER BY appointment_date DESC, appointment_time DESC`,
    [clientId]
  )

  return results.map((r) => ({
    id: r.id,
    petId: r.pet_id,
    clientId: r.client_id,
    veterinarianId: r.veterinarian_id || "",
    branchId: r.branch_id,
    date: r.appointment_date,
    time: r.appointment_time,
    reason: r.reason || "",
    status: r.status as Appointment["status"],
    notes: r.notes || undefined,
  }))
}

export async function getAppointmentsByVeterinarianId(veterinarianId: string): Promise<Appointment[]> {
  const results = await query<{
    id: string
    pet_id: string
    client_id: string
    veterinarian_id: string | null
    branch_id: string
    appointment_date: string
    appointment_time: string
    reason: string | null
    status: string
    notes: string | null
    created_at: string
    updated_at: string
  }>(
    `SELECT id, pet_id, client_id, veterinarian_id, branch_id, appointment_date, appointment_time, reason, status, notes, created_at, updated_at
     FROM appointments
     WHERE veterinarian_id = $1
     ORDER BY appointment_date DESC, appointment_time DESC`,
    [veterinarianId]
  )

  return results.map((r) => ({
    id: r.id,
    petId: r.pet_id,
    clientId: r.client_id,
    veterinarianId: r.veterinarian_id || "",
    branchId: r.branch_id,
    date: r.appointment_date,
    time: r.appointment_time,
    reason: r.reason || "",
    status: r.status as Appointment["status"],
    notes: r.notes || undefined,
  }))
}

export async function getAllAppointments(filters?: {
  status?: Appointment["status"]
  branchId?: string
  dateFrom?: string
  dateTo?: string
}): Promise<Appointment[]> {
  let sql = `SELECT id, pet_id, client_id, veterinarian_id, branch_id, appointment_date, appointment_time, reason, status, notes, created_at, updated_at
             FROM appointments
             WHERE 1=1`
  const params: any[] = []
  let paramIndex = 1

  if (filters?.status) {
    sql += ` AND status = $${paramIndex++}`
    params.push(filters.status)
  }
  if (filters?.branchId) {
    sql += ` AND branch_id = $${paramIndex++}`
    params.push(filters.branchId)
  }
  if (filters?.dateFrom) {
    sql += ` AND appointment_date >= $${paramIndex++}`
    params.push(filters.dateFrom)
  }
  if (filters?.dateTo) {
    sql += ` AND appointment_date <= $${paramIndex++}`
    params.push(filters.dateTo)
  }

  sql += ` ORDER BY appointment_date DESC, appointment_time DESC`

  const results = await query<{
    id: string
    pet_id: string
    client_id: string
    veterinarian_id: string | null
    branch_id: string
    appointment_date: string
    appointment_time: string
    reason: string | null
    status: string
    notes: string | null
    created_at: string
    updated_at: string
  }>(sql, params)

  return results.map((r) => ({
    id: r.id,
    petId: r.pet_id,
    clientId: r.client_id,
    veterinarianId: r.veterinarian_id || "",
    branchId: r.branch_id,
    date: r.appointment_date,
    time: r.appointment_time,
    reason: r.reason || "",
    status: r.status as Appointment["status"],
    notes: r.notes || undefined,
  }))
}

export async function createAppointment(appointmentData: {
  petId: string
  clientId: string
  veterinarianId?: string
  branchId: string
  date: string
  time: string
  reason?: string
  status?: Appointment["status"]
  notes?: string
}): Promise<Appointment> {
  const result = await queryOne<{
    id: string
    pet_id: string
    client_id: string
    veterinarian_id: string | null
    branch_id: string
    appointment_date: string
    appointment_time: string
    reason: string | null
    status: string
    notes: string | null
    created_at: string
    updated_at: string
  }>(
    `INSERT INTO appointments (pet_id, client_id, veterinarian_id, branch_id, appointment_date, appointment_time, reason, status, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, pet_id, client_id, veterinarian_id, branch_id, appointment_date, appointment_time, reason, status, notes, created_at, updated_at`,
    [
      appointmentData.petId,
      appointmentData.clientId,
      appointmentData.veterinarianId || null,
      appointmentData.branchId,
      appointmentData.date,
      appointmentData.time,
      appointmentData.reason || null,
      appointmentData.status || "pending",
      appointmentData.notes || null,
    ]
  )

  if (!result) throw new Error("Failed to create appointment")

  return {
    id: result.id,
    petId: result.pet_id,
    clientId: result.client_id,
    veterinarianId: result.veterinarian_id || "",
    branchId: result.branch_id,
    date: result.appointment_date,
    time: result.appointment_time,
    reason: result.reason || "",
    status: result.status as Appointment["status"],
    notes: result.notes || undefined,
  }
}

export async function updateAppointment(id: string, updates: Partial<{
  veterinarianId: string
  branchId: string
  date: string
  time: string
  reason: string
  status: Appointment["status"]
  notes: string
}>): Promise<Appointment> {
  const fields: string[] = []
  const values: any[] = []
  let paramIndex = 1

  if (updates.veterinarianId !== undefined) {
    fields.push(`veterinarian_id = $${paramIndex++}`)
    values.push(updates.veterinarianId || null)
  }
  if (updates.branchId !== undefined) {
    fields.push(`branch_id = $${paramIndex++}`)
    values.push(updates.branchId)
  }
  if (updates.date !== undefined) {
    fields.push(`appointment_date = $${paramIndex++}`)
    values.push(updates.date)
  }
  if (updates.time !== undefined) {
    fields.push(`appointment_time = $${paramIndex++}`)
    values.push(updates.time)
  }
  if (updates.reason !== undefined) {
    fields.push(`reason = $${paramIndex++}`)
    values.push(updates.reason)
  }
  if (updates.status !== undefined) {
    fields.push(`status = $${paramIndex++}`)
    values.push(updates.status)
  }
  if (updates.notes !== undefined) {
    fields.push(`notes = $${paramIndex++}`)
    values.push(updates.notes)
  }

  if (fields.length === 0) {
    const appointment = await getAppointmentById(id)
    if (!appointment) throw new Error("Appointment not found")
    return appointment
  }

  values.push(id)

  await execute(
    `UPDATE appointments SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex}`,
    values
  )

  const updated = await getAppointmentById(id)
  if (!updated) throw new Error("Failed to retrieve updated appointment")
  return updated
}

export async function deleteAppointment(id: string): Promise<void> {
  await execute(`DELETE FROM appointments WHERE id = $1`, [id])
}
