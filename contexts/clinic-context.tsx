"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import type { Client, Pet, MedicalRecord, Appointment, InventoryItem, Hospitalization, Branch, SpaGroomingAppointment } from "@/lib/types"
import { mockClients, mockPets, mockMedicalRecords, mockAppointments, mockInventory } from "@/lib/mock-data"
import { mockHospitalizations } from "@/lib/hospitalization-data"
import { mockBranches } from "@/lib/branches-data"

interface ClinicContextType {
  clients: Client[]
  pets: Pet[]
  medicalRecords: MedicalRecord[]
  appointments: Appointment[]
  spaGroomingAppointments: SpaGroomingAppointment[]
  inventory: InventoryItem[]
  hospitalizations: Hospitalization[]
  branches: Branch[]
  addClient: (client: Client) => void
  updateClient: (id: string, client: Partial<Client>) => void
  deleteClient: (id: string) => void
  addPet: (pet: Pet) => void
  updatePet: (id: string, pet: Partial<Pet>) => void
  deletePet: (id: string) => void
  addMedicalRecord: (record: MedicalRecord) => void
  addAppointment: (appointment: Appointment) => void
  updateAppointment: (id: string, appointment: Partial<Appointment>) => void
  deleteAppointment: (id: string) => void
  addSpaGroomingAppointment: (appointment: SpaGroomingAppointment) => void
  updateSpaGroomingAppointment: (id: string, appointment: Partial<SpaGroomingAppointment>) => void
  deleteSpaGroomingAppointment: (id: string) => void
  addInventoryItem: (item: InventoryItem) => void
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => void
  deleteInventoryItem: (id: string) => void
  addHospitalization: (hospitalization: Hospitalization) => void
  updateHospitalization: (id: string, hospitalization: Partial<Hospitalization>) => void
  dischargeHospitalization: (id: string, dischargeDate: string) => void
  addStudy: (hospitalizationId: string, study: Omit<Hospitalization["studies"][0], "id">) => void
  addVitalSigns: (hospitalizationId: string, vitalSigns: Hospitalization["vitalSigns"][0]) => void
  updateBranch: (id: string, branch: Partial<Branch>) => void
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined)

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>(mockClients)
  const [pets, setPets] = useState<Pet[]>(mockPets)
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(mockMedicalRecords)
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments)
  const [spaGroomingAppointments, setSpaGroomingAppointments] = useState<SpaGroomingAppointment[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory)
  const [hospitalizations, setHospitalizations] = useState<Hospitalization[]>(mockHospitalizations)
  const [branches, setBranches] = useState<Branch[]>(mockBranches)

  const addClient = (client: Client) => {
    setClients((prev) => [...prev, client])
  }

  const updateClient = (id: string, updatedClient: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updatedClient } : c)))
  }

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id))
  }

  const addPet = (pet: Pet) => {
    setPets((prev) => [...prev, pet])
  }

  const updatePet = (id: string, updatedPet: Partial<Pet>) => {
    setPets((prev) => prev.map((p) => (p.id === id ? { ...p, ...updatedPet } : p)))
  }

  const deletePet = (id: string) => {
    setPets((prev) => prev.filter((p) => p.id !== id))
  }

  const addMedicalRecord = (record: MedicalRecord) => {
    setMedicalRecords((prev) => [...prev, record])
  }

  const addAppointment = (appointment: Appointment) => {
    setAppointments((prev) => [...prev, appointment])
  }

  const updateAppointment = (id: string, updatedAppointment: Partial<Appointment>) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...updatedAppointment } : a)))
  }

  const deleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id))
  }

  const addSpaGroomingAppointment = (appointment: SpaGroomingAppointment) => {
    setSpaGroomingAppointments((prev) => [...prev, appointment])
  }

  const updateSpaGroomingAppointment = (id: string, updatedAppointment: Partial<SpaGroomingAppointment>) => {
    setSpaGroomingAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...updatedAppointment } : a)))
  }

  const deleteSpaGroomingAppointment = (id: string) => {
    setSpaGroomingAppointments((prev) => prev.filter((a) => a.id !== id))
  }

  const addInventoryItem = (item: InventoryItem) => {
    setInventory((prev) => [...prev, item])
  }

  const updateInventoryItem = (id: string, updatedItem: Partial<InventoryItem>) => {
    setInventory((prev) => prev.map((i) => (i.id === id ? { ...i, ...updatedItem } : i)))
  }

  const deleteInventoryItem = (id: string) => {
    setInventory((prev) => prev.filter((i) => i.id !== id))
  }

  const addHospitalization = (hospitalization: Hospitalization) => {
    setHospitalizations((prev) => [...prev, hospitalization])
  }

  const updateHospitalization = (id: string, updatedHospitalization: Partial<Hospitalization>) => {
    setHospitalizations((prev) => prev.map((h) => (h.id === id ? { ...h, ...updatedHospitalization } : h)))
  }

  const dischargeHospitalization = (id: string, dischargeDate: string) => {
    setHospitalizations((prev) =>
      prev.map((h) => (h.id === id ? { ...h, dischargeDate, status: "discharged" as const } : h)),
    )
  }

  const addStudy = (hospitalizationId: string, study: Omit<Hospitalization["studies"][0], "id">) => {
    setHospitalizations((prev) =>
      prev.map((h) => {
        if (h.id === hospitalizationId) {
          return {
            ...h,
            studies: [
              ...h.studies,
              {
                ...study,
                id: Date.now().toString(),
              },
            ],
          }
        }
        return h
      }),
    )
  }

  const addVitalSigns = (hospitalizationId: string, vitalSigns: Hospitalization["vitalSigns"][0]) => {
    setHospitalizations((prev) =>
      prev.map((h) => {
        if (h.id === hospitalizationId) {
          return {
            ...h,
            vitalSigns: [...(h.vitalSigns || []), vitalSigns],
          }
        }
        return h
      }),
    )
  }

  const updateBranch = (id: string, updatedBranch: Partial<Branch>) => {
    setBranches((prev) => prev.map((b) => (b.id === id ? { ...b, ...updatedBranch } : b)))
  }

  return (
    <ClinicContext.Provider
      value={{
        clients,
        pets,
        medicalRecords,
        appointments,
        spaGroomingAppointments,
        inventory,
        hospitalizations,
        branches,
        addClient,
        updateClient,
        deleteClient,
        addPet,
        updatePet,
        deletePet,
        addMedicalRecord,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        addSpaGroomingAppointment,
        updateSpaGroomingAppointment,
        deleteSpaGroomingAppointment,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        addHospitalization,
        updateHospitalization,
        dischargeHospitalization,
        addStudy,
        addVitalSigns,
        updateBranch,
      }}
    >
      {children}
    </ClinicContext.Provider>
  )
}

export function useClinic() {
  const context = useContext(ClinicContext)
  if (context === undefined) {
    throw new Error("useClinic must be used within a ClinicProvider")
  }
  return context
}
