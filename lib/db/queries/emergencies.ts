/**
 * Emergency database queries
 */

import { query, queryOne, execute } from "@/lib/db"

export interface Emergency {
  id: string
  petId: string
  clientId: string
  reportedBy: string
  reportedAt: string
  priority: "low" | "medium" | "high" | "critical"
  description: string
  symptoms?: string
  status: "pending" | "in_progress" | "resolved" | "cancelled"
  assignedTo?: string
  assignedBranchId?: string
  notes?: string
  resolvedAt?: string
}

export async function getEmergencyById(id: string): Promise<Emergency | null> {
  const result = await queryOne<{
    id: string
    pet_id: string
    client_id: string
    reported_by: string
    reported_at: string
    priority: string
    description: string
    symptoms: string | null
    status: string
    assigned_to: string | null
    assigned_branch_id: string | null
    notes: string | null
    resolved_at: string | null
  }>(
    `SELECT id, pet_id, client_id, reported_by, reported_at, priority, description, symptoms, status, assigned_to, assigned_branch_id, notes, resolved_at
     FROM emergencies
     WHERE id = $1`,
    [id]
  )

  if (!result) return null

  return {
    id: result.id,
    petId: result.pet_id,
    clientId: result.client_id,
    reportedBy: result.reported_by,
    reportedAt: result.reported_at,
    priority: result.priority as Emergency["priority"],
    description: result.description,
    symptoms: result.symptoms || undefined,
    status: result.status as Emergency["status"],
    assignedTo: result.assigned_to || undefined,
    assignedBranchId: result.assigned_branch_id || undefined,
    notes: result.notes || undefined,
    resolvedAt: result.resolved_at || undefined,
  }
}

export async function getEmergenciesByClientId(clientId: string): Promise<Emergency[]> {
  const results = await query<{
    id: string
    pet_id: string
    client_id: string
    reported_by: string
    reported_at: string
    priority: string
    description: string
    symptoms: string | null
    status: string
    assigned_to: string | null
    assigned_branch_id: string | null
    notes: string | null
    resolved_at: string | null
  }>(
    `SELECT id, pet_id, client_id, reported_by, reported_at, priority, description, symptoms, status, assigned_to, assigned_branch_id, notes, resolved_at
     FROM emergencies
     WHERE client_id = $1
     ORDER BY reported_at DESC`,
    [clientId]
  )

  return results.map((r) => ({
    id: r.id,
    petId: r.pet_id,
    clientId: r.client_id,
    reportedBy: r.reported_by,
    reportedAt: r.reported_at,
    priority: r.priority as Emergency["priority"],
    description: r.description,
    symptoms: r.symptoms || undefined,
    status: r.status as Emergency["status"],
    assignedTo: r.assigned_to || undefined,
    assignedBranchId: r.assigned_branch_id || undefined,
    notes: r.notes || undefined,
    resolvedAt: r.resolved_at || undefined,
  }))
}

export async function getAllEmergencies(filters?: {
  status?: Emergency["status"]
  priority?: Emergency["priority"]
  branchId?: string
}): Promise<Emergency[]> {
  let sql = `SELECT id, pet_id, client_id, reported_by, reported_at, priority, description, symptoms, status, assigned_to, assigned_branch_id, notes, resolved_at
             FROM emergencies
             WHERE 1=1`
  const params: any[] = []
  let paramIndex = 1

  if (filters?.status) {
    sql += ` AND status = $${paramIndex++}`
    params.push(filters.status)
  }
  if (filters?.priority) {
    sql += ` AND priority = $${paramIndex++}`
    params.push(filters.priority)
  }
  if (filters?.branchId) {
    sql += ` AND assigned_branch_id = $${paramIndex++}`
    params.push(filters.branchId)
  }

  sql += ` ORDER BY 
    CASE priority
      WHEN 'critical' THEN 1
      WHEN 'high' THEN 2
      WHEN 'medium' THEN 3
      WHEN 'low' THEN 4
    END,
    reported_at DESC`

  const results = await query<{
    id: string
    pet_id: string
    client_id: string
    reported_by: string
    reported_at: string
    priority: string
    description: string
    symptoms: string | null
    status: string
    assigned_to: string | null
    assigned_branch_id: string | null
    notes: string | null
    resolved_at: string | null
  }>(sql, params)

  return results.map((r) => ({
    id: r.id,
    petId: r.pet_id,
    clientId: r.client_id,
    reportedBy: r.reported_by,
    reportedAt: r.reported_at,
    priority: r.priority as Emergency["priority"],
    description: r.description,
    symptoms: r.symptoms || undefined,
    status: r.status as Emergency["status"],
    assignedTo: r.assigned_to || undefined,
    assignedBranchId: r.assigned_branch_id || undefined,
    notes: r.notes || undefined,
    resolvedAt: r.resolved_at || undefined,
  }))
}

export async function createEmergency(emergencyData: {
  petId: string
  clientId: string
  reportedBy: string
  priority?: Emergency["priority"]
  description: string
  symptoms?: string
  assignedTo?: string
  assignedBranchId?: string
  notes?: string
}): Promise<Emergency> {
  const result = await queryOne<{
    id: string
    pet_id: string
    client_id: string
    reported_by: string
    reported_at: string
    priority: string
    description: string
    symptoms: string | null
    status: string
    assigned_to: string | null
    assigned_branch_id: string | null
    notes: string | null
    resolved_at: string | null
  }>(
    `INSERT INTO emergencies (pet_id, client_id, reported_by, priority, description, symptoms, assigned_to, assigned_branch_id, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, pet_id, client_id, reported_by, reported_at, priority, description, symptoms, status, assigned_to, assigned_branch_id, notes, resolved_at`,
    [
      emergencyData.petId,
      emergencyData.clientId,
      emergencyData.reportedBy,
      emergencyData.priority || "medium",
      emergencyData.description,
      emergencyData.symptoms || null,
      emergencyData.assignedTo || null,
      emergencyData.assignedBranchId || null,
      emergencyData.notes || null,
    ]
  )

  if (!result) throw new Error("Failed to create emergency")

  return {
    id: result.id,
    petId: result.pet_id,
    clientId: result.client_id,
    reportedBy: result.reported_by,
    reportedAt: result.reported_at,
    priority: result.priority as Emergency["priority"],
    description: result.description,
    symptoms: result.symptoms || undefined,
    status: result.status as Emergency["status"],
    assignedTo: result.assigned_to || undefined,
    assignedBranchId: result.assigned_branch_id || undefined,
    notes: result.notes || undefined,
    resolvedAt: result.resolved_at || undefined,
  }
}

export async function updateEmergency(id: string, updates: Partial<{
  priority: Emergency["priority"]
  description: string
  symptoms: string
  status: Emergency["status"]
  assignedTo: string
  assignedBranchId: string
  notes: string
  resolvedAt: string
}>): Promise<Emergency> {
  const fields: string[] = []
  const values: any[] = []
  let paramIndex = 1

  if (updates.priority !== undefined) {
    fields.push(`priority = $${paramIndex++}`)
    values.push(updates.priority)
  }
  if (updates.description !== undefined) {
    fields.push(`description = $${paramIndex++}`)
    values.push(updates.description)
  }
  if (updates.symptoms !== undefined) {
    fields.push(`symptoms = $${paramIndex++}`)
    values.push(updates.symptoms)
  }
  if (updates.status !== undefined) {
    fields.push(`status = $${paramIndex++}`)
    values.push(updates.status)
    if (updates.status === "resolved" && !updates.resolvedAt) {
      fields.push(`resolved_at = CURRENT_TIMESTAMP`)
    }
  }
  if (updates.assignedTo !== undefined) {
    fields.push(`assigned_to = $${paramIndex++}`)
    values.push(updates.assignedTo || null)
  }
  if (updates.assignedBranchId !== undefined) {
    fields.push(`assigned_branch_id = $${paramIndex++}`)
    values.push(updates.assignedBranchId || null)
  }
  if (updates.notes !== undefined) {
    fields.push(`notes = $${paramIndex++}`)
    values.push(updates.notes)
  }
  if (updates.resolvedAt !== undefined) {
    fields.push(`resolved_at = $${paramIndex++}`)
    values.push(updates.resolvedAt)
  }

  if (fields.length === 0) {
    const emergency = await getEmergencyById(id)
    if (!emergency) throw new Error("Emergency not found")
    return emergency
  }

  values.push(id)

  await execute(
    `UPDATE emergencies SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex}`,
    values
  )

  const updated = await getEmergencyById(id)
  if (!updated) throw new Error("Failed to retrieve updated emergency")
  return updated
}

export async function deleteEmergency(id: string): Promise<void> {
  await execute(`DELETE FROM emergencies WHERE id = $1`, [id])
}
