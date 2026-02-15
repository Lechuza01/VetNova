/**
 * Inventory database queries
 */

import { query, queryOne, execute } from "@/lib/db"
import type { InventoryItem } from "@/lib/types"

export async function getInventoryItemById(id: string): Promise<InventoryItem | null> {
  const result = await queryOne<{
    id: string
    name: string
    description: string | null
    category: string
    inventory_category_id: number | null
    unit_of_measure: string | null
    current_stock: number
    min_stock: number | null
    price: number | null
    supplier: string | null
    expiry_date: string | null
    notes: string | null
  }>(
    `SELECT id, name, description, category, inventory_category_id, unit_of_measure, current_stock, min_stock, price, supplier, expiry_date, notes
     FROM inventory_items
     WHERE id = $1`,
    [id]
  )

  if (!result) return null

  return {
    id: result.id,
    name: result.name,
    category: result.category as InventoryItem["category"],
    quantity: Number(result.current_stock),
    minStock: Number(result.min_stock || 0),
    price: Number(result.price || 0),
    supplier: result.supplier || undefined,
    expiryDate: result.expiry_date || undefined,
    notes: result.notes || undefined,
  }
}

export async function getAllInventoryItems(filters?: {
  category?: InventoryItem["category"]
  search?: string
}): Promise<InventoryItem[]> {
  let sql = `SELECT id, name, description, category, inventory_category_id, unit_of_measure, current_stock, min_stock, price, supplier, expiry_date, notes
             FROM inventory_items
             WHERE 1=1`
  const params: any[] = []
  let paramIndex = 1

  if (filters?.category) {
    sql += ` AND category = $${paramIndex++}`
    params.push(filters.category)
  }
  if (filters?.search) {
    sql += ` AND name ILIKE $${paramIndex++}`
    params.push(`%${filters.search}%`)
  }

  sql += ` ORDER BY name`

  const results = await query<{
    id: string
    name: string
    description: string | null
    category: string
    inventory_category_id: number | null
    unit_of_measure: string | null
    current_stock: number
    min_stock: number | null
    price: number | null
    supplier: string | null
    expiry_date: string | null
    notes: string | null
  }>(sql, params)

  return results.map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category as InventoryItem["category"],
    quantity: Number(r.current_stock),
    minStock: Number(r.min_stock || 0),
    price: Number(r.price || 0),
    supplier: r.supplier || undefined,
    expiryDate: r.expiry_date || undefined,
    notes: r.notes || undefined,
  }))
}

export async function createInventoryItem(itemData: {
  name: string
  category: InventoryItem["category"]
  description?: string
  inventoryCategoryId?: number
  unitOfMeasure?: string
  minStock?: number
  price?: number
  supplier?: string
  expiryDate?: string
  notes?: string
}): Promise<InventoryItem> {
  const result = await queryOne<{
    id: string
    name: string
    description: string | null
    category: string
    inventory_category_id: number | null
    unit_of_measure: string | null
    current_stock: number
    min_stock: number | null
    price: number | null
    supplier: string | null
    expiry_date: string | null
    notes: string | null
  }>(
    `INSERT INTO inventory_items (name, description, category, inventory_category_id, unit_of_measure, min_stock, price, supplier, expiry_date, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id, name, description, category, inventory_category_id, unit_of_measure, current_stock, min_stock, price, supplier, expiry_date, notes`,
    [
      itemData.name,
      itemData.description || null,
      itemData.category,
      itemData.inventoryCategoryId || null,
      itemData.unitOfMeasure || null,
      itemData.minStock || null,
      itemData.price || null,
      itemData.supplier || null,
      itemData.expiryDate || null,
      itemData.notes || null,
    ]
  )

  if (!result) throw new Error("Failed to create inventory item")

  return {
    id: result.id,
    name: result.name,
    category: result.category as InventoryItem["category"],
    quantity: Number(result.current_stock),
    minStock: Number(result.min_stock || 0),
    price: Number(result.price || 0),
    supplier: result.supplier || undefined,
    expiryDate: result.expiry_date || undefined,
    notes: result.notes || undefined,
  }
}

export async function updateInventoryItem(id: string, updates: Partial<{
  name: string
  description: string
  category: InventoryItem["category"]
  unitOfMeasure: string
  minStock: number
  price: number
  supplier: string
  expiryDate: string
  notes: string
}>): Promise<InventoryItem> {
  const fields: string[] = []
  const values: any[] = []
  let paramIndex = 1

  if (updates.name !== undefined) {
    fields.push(`name = $${paramIndex++}`)
    values.push(updates.name)
  }
  if (updates.description !== undefined) {
    fields.push(`description = $${paramIndex++}`)
    values.push(updates.description)
  }
  if (updates.category !== undefined) {
    fields.push(`category = $${paramIndex++}`)
    values.push(updates.category)
  }
  if (updates.unitOfMeasure !== undefined) {
    fields.push(`unit_of_measure = $${paramIndex++}`)
    values.push(updates.unitOfMeasure)
  }
  if (updates.minStock !== undefined) {
    fields.push(`min_stock = $${paramIndex++}`)
    values.push(updates.minStock)
  }
  if (updates.price !== undefined) {
    fields.push(`price = $${paramIndex++}`)
    values.push(updates.price)
  }
  if (updates.supplier !== undefined) {
    fields.push(`supplier = $${paramIndex++}`)
    values.push(updates.supplier)
  }
  if (updates.expiryDate !== undefined) {
    fields.push(`expiry_date = $${paramIndex++}`)
    values.push(updates.expiryDate || null)
  }
  if (updates.notes !== undefined) {
    fields.push(`notes = $${paramIndex++}`)
    values.push(updates.notes)
  }

  if (fields.length === 0) {
    const item = await getInventoryItemById(id)
    if (!item) throw new Error("Inventory item not found")
    return item
  }

  values.push(id)

  await execute(
    `UPDATE inventory_items SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex}`,
    values
  )

  const updated = await getInventoryItemById(id)
  if (!updated) throw new Error("Failed to retrieve updated inventory item")
  return updated
}

export async function deleteInventoryItem(id: string): Promise<void> {
  await execute(`DELETE FROM inventory_items WHERE id = $1`, [id])
}

// Funciones para movimientos de inventario
export async function createInventoryMovement(movementData: {
  inventoryItemId: string
  movementType: "ingreso" | "egreso" | "ajuste"
  quantity: number
  reason?: string
  referenceId?: string
  referenceType?: string
  createdBy?: string
  notes?: string
}): Promise<void> {
  await execute(
    `INSERT INTO inventory_movements (inventory_item_id, movement_type, quantity, reason, reference_id, reference_type, created_by, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      movementData.inventoryItemId,
      movementData.movementType,
      movementData.quantity,
      movementData.reason || null,
      movementData.referenceId || null,
      movementData.referenceType || null,
      movementData.createdBy || null,
      movementData.notes || null,
    ]
  )
}

export async function getInventoryMovements(itemId?: string): Promise<any[]> {
  let sql = `SELECT id, inventory_item_id, movement_type, quantity, movement_date, reason, reference_id, reference_type, created_by, notes, created_at
             FROM inventory_movements`
  const params: any[] = []

  if (itemId) {
    sql += ` WHERE inventory_item_id = $1`
    params.push(itemId)
  }

  sql += ` ORDER BY created_at DESC`

  return await query(sql, params)
}
