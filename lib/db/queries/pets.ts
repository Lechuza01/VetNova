/**
 * Pet database queries
 */

import { query, queryOne, execute } from "../db"
import type { Pet } from "@/lib/types"

export async function getPetById(id: string): Promise<Pet | null> {
  const result = await queryOne<{
    id: string
    name: string
    animal_name: string | null
    breed_name: string | null
    birth_date: string | null
    weight: number | null
    color: string | null
    microchip_number: string | null
    photo_url: string | null
    status: string
    notes: string | null
    client_id: string
  }>(
    `SELECT 
      p.id,
      p.name,
      a.name AS animal_name,
      b.name AS breed_name,
      p.birth_date,
      p.weight,
      p.color,
      p.microchip_number,
      p.photo_url,
      p.status,
      p.notes,
      cp.client_id
     FROM pets p
     LEFT JOIN animals a ON p.animal_id = a.id
     LEFT JOIN breeds b ON p.breed_id = b.id
     LEFT JOIN client_pets cp ON p.id = cp.pet_id AND cp.is_primary_owner = TRUE
     WHERE p.id = $1`,
    [id]
  )

  if (!result) return null

  return {
    id: result.id,
    name: result.name,
    species: result.animal_name || "",
    breed: result.breed_name || "",
    birthDate: result.birth_date || "",
    weight: result.weight || 0,
    color: result.color || "",
    clientId: result.client_id,
    microchipNumber: result.microchip_number || undefined,
    notes: result.notes || undefined,
    photo: result.photo_url || undefined,
    status: result.status as Pet["status"],
  }
}

export async function getPetsByClientId(clientId: string): Promise<Pet[]> {
  const results = await query<{
    id: string
    name: string
    animal_name: string | null
    breed_name: string | null
    birth_date: string | null
    weight: number | null
    color: string | null
    microchip_number: string | null
    photo_url: string | null
    status: string
    notes: string | null
    client_id: string
  }>(
    `SELECT 
      p.id,
      p.name,
      a.name AS animal_name,
      b.name AS breed_name,
      p.birth_date,
      p.weight,
      p.color,
      p.microchip_number,
      p.photo_url,
      p.status,
      p.notes,
      cp.client_id
     FROM pets p
     LEFT JOIN animals a ON p.animal_id = a.id
     LEFT JOIN breeds b ON p.breed_id = b.id
     JOIN client_pets cp ON p.id = cp.pet_id
     WHERE cp.client_id = $1
     ORDER BY p.name`,
    [clientId]
  )

  return results.map((r) => ({
    id: r.id,
    name: r.name,
    species: r.animal_name || "",
    breed: r.breed_name || "",
    birthDate: r.birth_date || "",
    weight: r.weight || 0,
    color: r.color || "",
    clientId: r.client_id,
    microchipNumber: r.microchip_number || undefined,
    notes: r.notes || undefined,
    photo: r.photo_url || undefined,
    status: r.status as Pet["status"],
  }))
}

export async function getAllPets(): Promise<Pet[]> {
  const results = await query<{
    id: string
    name: string
    animal_name: string | null
    breed_name: string | null
    birth_date: string | null
    weight: number | null
    color: string | null
    microchip_number: string | null
    photo_url: string | null
    status: string
    notes: string | null
    client_id: string
  }>(
    `SELECT 
      p.id,
      p.name,
      a.name AS animal_name,
      b.name AS breed_name,
      p.birth_date,
      p.weight,
      p.color,
      p.microchip_number,
      p.photo_url,
      p.status,
      p.notes,
      cp.client_id
     FROM pets p
     LEFT JOIN animals a ON p.animal_id = a.id
     LEFT JOIN breeds b ON p.breed_id = b.id
     LEFT JOIN client_pets cp ON p.id = cp.pet_id AND cp.is_primary_owner = TRUE
     ORDER BY p.name`
  )

  return results.map((r) => ({
    id: r.id,
    name: r.name,
    species: r.animal_name || "",
    breed: r.breed_name || "",
    birthDate: r.birth_date || "",
    weight: r.weight || 0,
    color: r.color || "",
    clientId: r.client_id || "",
    microchipNumber: r.microchip_number || undefined,
    notes: r.notes || undefined,
    photo: r.photo_url || undefined,
    status: r.status as Pet["status"],
  }))
}

export async function createPet(petData: {
  name: string
  clientId: string
  animalId?: number
  breedId?: number
  birthDate?: string
  weight?: number
  color?: string
  microchipNumber?: string
  photo?: string
  notes?: string
}): Promise<Pet> {
  // Get or create animal
  let animalId = petData.animalId
  if (!animalId) {
    // Default to "Perro" or create if needed
    const animal = await queryOne<{ id: number }>(
      `SELECT id FROM animals WHERE name = 'Perro' LIMIT 1`
    )
    if (animal) {
      animalId = animal.id
    } else {
      const newAnimal = await queryOne<{ id: number }>(
        `INSERT INTO animals (name) VALUES ('Perro') RETURNING id`
      )
      animalId = newAnimal?.id
    }
  }

  // Create pet
  const petResult = await queryOne<{
    id: string
    name: string
    birth_date: string | null
    weight: number | null
    color: string | null
    microchip_number: string | null
    photo_url: string | null
    status: string
    notes: string | null
  }>(
    `INSERT INTO pets (name, animal_id, breed_id, birth_date, weight, color, microchip_number, photo_url, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, name, birth_date, weight, color, microchip_number, photo_url, status, notes`,
    [
      petData.name,
      animalId || null,
      petData.breedId || null,
      petData.birthDate || null,
      petData.weight || null,
      petData.color || null,
      petData.microchipNumber || null,
      petData.photo || null,
      petData.notes || null,
    ]
  )

  if (!petResult) throw new Error("Failed to create pet")

  // Link pet to client
  await execute(
    `INSERT INTO client_pets (client_id, pet_id, is_primary_owner) VALUES ($1, $2, TRUE)
     ON CONFLICT (client_id, pet_id) DO NOTHING`,
    [petData.clientId, petResult.id]
  )

  const created = await getPetById(petResult.id)
  if (!created) throw new Error("Failed to retrieve created pet")
  return created
}

export async function updatePet(id: string, updates: Partial<{
  name: string
  birthDate: string
  weight: number
  color: string
  microchipNumber: string
  photo: string
  status: Pet["status"]
  statusDate: string
  statusNotes: string
  notes: string
}>): Promise<Pet> {
  const fields: string[] = []
  const values: any[] = []
  let paramIndex = 1

  if (updates.name !== undefined) {
    fields.push(`name = $${paramIndex++}`)
    values.push(updates.name)
  }
  if (updates.birthDate !== undefined) {
    fields.push(`birth_date = $${paramIndex++}`)
    values.push(updates.birthDate)
  }
  if (updates.weight !== undefined) {
    fields.push(`weight = $${paramIndex++}`)
    values.push(updates.weight)
  }
  if (updates.color !== undefined) {
    fields.push(`color = $${paramIndex++}`)
    values.push(updates.color)
  }
  if (updates.microchipNumber !== undefined) {
    fields.push(`microchip_number = $${paramIndex++}`)
    values.push(updates.microchipNumber)
  }
  if (updates.photo !== undefined) {
    fields.push(`photo_url = $${paramIndex++}`)
    values.push(updates.photo)
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
    const pet = await getPetById(id)
    if (!pet) throw new Error("Pet not found")
    return pet
  }

  values.push(id)

  await execute(
    `UPDATE pets SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex}`,
    values
  )

  const updated = await getPetById(id)
  if (!updated) throw new Error("Failed to retrieve updated pet")
  return updated
}

export async function deletePet(id: string): Promise<void> {
  await execute(`DELETE FROM pets WHERE id = $1`, [id])
}
