/**
 * Medical Record database queries
 */

import { query, queryOne, execute } from "../db"
import type { MedicalRecord } from "@/lib/types"

export async function getMedicalRecordById(id: string): Promise<MedicalRecord | null> {
  const result = await queryOne<{
    id: string
    pet_id: string
    veterinarian_id: string | null
    record_date: string
    service_type: string
    reason: string | null
    diagnosis: string | null
    treatment: string | null
    observations: string | null
    next_visit_date: string | null
    attachments: string[] | null
  }>(
    `SELECT id, pet_id, veterinarian_id, record_date, service_type, reason, diagnosis, treatment, observations, next_visit_date, attachments
     FROM medical_records
     WHERE id = $1`,
    [id]
  )

  if (!result) return null

  return {
    id: result.id,
    petId: result.pet_id,
    date: result.record_date,
    veterinarianId: result.veterinarian_id || "",
    reason: result.reason || "",
    diagnosis: result.diagnosis || "",
    treatment: result.treatment || "",
    observations: result.observations || "",
    nextVisit: result.next_visit_date || undefined,
    attachments: result.attachments || undefined,
  }
}

export async function getMedicalRecordsByPetId(petId: string): Promise<MedicalRecord[]> {
  const results = await query<{
    id: string
    pet_id: string
    veterinarian_id: string | null
    record_date: string
    service_type: string
    reason: string | null
    diagnosis: string | null
    treatment: string | null
    observations: string | null
    next_visit_date: string | null
    attachments: string[] | null
  }>(
    `SELECT id, pet_id, veterinarian_id, record_date, service_type, reason, diagnosis, treatment, observations, next_visit_date, attachments
     FROM medical_records
     WHERE pet_id = $1
     ORDER BY record_date DESC`,
    [petId]
  )

  return results.map((r) => ({
    id: r.id,
    petId: r.pet_id,
    date: r.record_date,
    veterinarianId: r.veterinarian_id || "",
    reason: r.reason || "",
    diagnosis: r.diagnosis || "",
    treatment: r.treatment || "",
    observations: r.observations || "",
    nextVisit: r.next_visit_date || undefined,
    attachments: r.attachments || undefined,
  }))
}

export async function getAllMedicalRecords(filters?: {
  petId?: string
  veterinarianId?: string
  serviceType?: "consulta" | "estudio"
  dateFrom?: string
  dateTo?: string
}): Promise<MedicalRecord[]> {
  let sql = `SELECT id, pet_id, veterinarian_id, record_date, service_type, reason, diagnosis, treatment, observations, next_visit_date, attachments
             FROM medical_records
             WHERE 1=1`
  const params: any[] = []
  let paramIndex = 1

  if (filters?.petId) {
    sql += ` AND pet_id = $${paramIndex++}`
    params.push(filters.petId)
  }
  if (filters?.veterinarianId) {
    sql += ` AND veterinarian_id = $${paramIndex++}`
    params.push(filters.veterinarianId)
  }
  if (filters?.serviceType) {
    sql += ` AND service_type = $${paramIndex++}`
    params.push(filters.serviceType)
  }
  if (filters?.dateFrom) {
    sql += ` AND record_date >= $${paramIndex++}`
    params.push(filters.dateFrom)
  }
  if (filters?.dateTo) {
    sql += ` AND record_date <= $${paramIndex++}`
    params.push(filters.dateTo)
  }

  sql += ` ORDER BY record_date DESC`

  const results = await query<{
    id: string
    pet_id: string
    veterinarian_id: string | null
    record_date: string
    service_type: string
    reason: string | null
    diagnosis: string | null
    treatment: string | null
    observations: string | null
    next_visit_date: string | null
    attachments: string[] | null
  }>(sql, params)

  return results.map((r) => ({
    id: r.id,
    petId: r.pet_id,
    date: r.record_date,
    veterinarianId: r.veterinarian_id || "",
    reason: r.reason || "",
    diagnosis: r.diagnosis || "",
    treatment: r.treatment || "",
    observations: r.observations || "",
    nextVisit: r.next_visit_date || undefined,
    attachments: r.attachments || undefined,
  }))
}

export async function createMedicalRecord(recordData: {
  petId: string
  veterinarianId: string
  serviceType?: "consulta" | "estudio"
  reason?: string
  diagnosis?: string
  treatment?: string
  observations?: string
  nextVisitDate?: string
  attachments?: string[]
}): Promise<MedicalRecord> {
  const result = await queryOne<{
    id: string
    pet_id: string
    veterinarian_id: string | null
    record_date: string
    service_type: string
    reason: string | null
    diagnosis: string | null
    treatment: string | null
    observations: string | null
    next_visit_date: string | null
    attachments: string[] | null
  }>(
    `INSERT INTO medical_records (pet_id, veterinarian_id, service_type, reason, diagnosis, treatment, observations, next_visit_date, attachments)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, pet_id, veterinarian_id, record_date, service_type, reason, diagnosis, treatment, observations, next_visit_date, attachments`,
    [
      recordData.petId,
      recordData.veterinarianId,
      recordData.serviceType || "consulta",
      recordData.reason || null,
      recordData.diagnosis || null,
      recordData.treatment || null,
      recordData.observations || null,
      recordData.nextVisitDate || null,
      recordData.attachments || null,
    ]
  )

  if (!result) throw new Error("Failed to create medical record")

  return {
    id: result.id,
    petId: result.pet_id,
    date: result.record_date,
    veterinarianId: result.veterinarian_id || "",
    reason: result.reason || "",
    diagnosis: result.diagnosis || "",
    treatment: result.treatment || "",
    observations: result.observations || "",
    nextVisit: result.next_visit_date || undefined,
    attachments: result.attachments || undefined,
  }
}

export async function updateMedicalRecord(id: string, updates: Partial<{
  veterinarianId: string
  serviceType: "consulta" | "estudio"
  reason: string
  diagnosis: string
  treatment: string
  observations: string
  nextVisitDate: string
  attachments: string[]
}>): Promise<MedicalRecord> {
  const fields: string[] = []
  const values: any[] = []
  let paramIndex = 1

  if (updates.veterinarianId !== undefined) {
    fields.push(`veterinarian_id = $${paramIndex++}`)
    values.push(updates.veterinarianId)
  }
  if (updates.serviceType !== undefined) {
    fields.push(`service_type = $${paramIndex++}`)
    values.push(updates.serviceType)
  }
  if (updates.reason !== undefined) {
    fields.push(`reason = $${paramIndex++}`)
    values.push(updates.reason)
  }
  if (updates.diagnosis !== undefined) {
    fields.push(`diagnosis = $${paramIndex++}`)
    values.push(updates.diagnosis)
  }
  if (updates.treatment !== undefined) {
    fields.push(`treatment = $${paramIndex++}`)
    values.push(updates.treatment)
  }
  if (updates.observations !== undefined) {
    fields.push(`observations = $${paramIndex++}`)
    values.push(updates.observations)
  }
  if (updates.nextVisitDate !== undefined) {
    fields.push(`next_visit_date = $${paramIndex++}`)
    values.push(updates.nextVisitDate || null)
  }
  if (updates.attachments !== undefined) {
    fields.push(`attachments = $${paramIndex++}`)
    values.push(updates.attachments)
  }

  if (fields.length === 0) {
    const record = await getMedicalRecordById(id)
    if (!record) throw new Error("Medical record not found")
    return record
  }

  values.push(id)

  await execute(
    `UPDATE medical_records SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex}`,
    values
  )

  const updated = await getMedicalRecordById(id)
  if (!updated) throw new Error("Failed to retrieve updated medical record")
  return updated
}

export async function deleteMedicalRecord(id: string): Promise<void> {
  await execute(`DELETE FROM medical_records WHERE id = $1`, [id])
}
