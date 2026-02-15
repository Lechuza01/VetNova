/**
 * Custom hooks for API calls
 * These hooks provide a clean interface for calling the API routes from React components
 */

import { useState, useEffect, useCallback } from "react"
import { dbAvailable } from "@/lib/db"

// Fallback to mock data if DB is not available
const USE_MOCK_DATA = !dbAvailable

export function useApi<T>(
  endpoint: string,
  options?: {
    method?: "GET" | "POST" | "PUT" | "DELETE"
    body?: any
    enabled?: boolean
  }
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (options?.enabled === false) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      if (USE_MOCK_DATA) {
        // Fallback to mock data
        console.warn(`Using mock data for ${endpoint} - Database not available`)
        setData(null)
        setLoading(false)
        return
      }

      const response = await fetch(endpoint, {
        method: options?.method || "GET",
        headers: {
          "Content-Type": "application/json",
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"))
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [endpoint, options?.method, options?.body, options?.enabled])

  useEffect(() => {
    if (options?.method === "GET" || !options?.method) {
      fetchData()
    }
  }, [fetchData])

  const mutate = useCallback(
    async (newData?: any) => {
      try {
        setLoading(true)
        setError(null)

        if (USE_MOCK_DATA) {
          console.warn(`Using mock data for ${endpoint} - Database not available`)
          setLoading(false)
          return
        }

        const response = await fetch(endpoint, {
          method: options?.method || "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newData || options?.body),
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`)
        }

        const result = await response.json()
        setData(result)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error")
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [endpoint, options?.method, options?.body]
  )

  return { data, loading, error, refetch: fetchData, mutate }
}

// Specific hooks for common entities
export function useUsers() {
  return useApi<any[]>("/api/users")
}

export function useUser(id: string) {
  return useApi<any>(`/api/users/${id}`, { enabled: !!id })
}

export function useClients() {
  return useApi<any[]>("/api/clients")
}

export function useClient(id: string) {
  return useApi<any>(`/api/clients/${id}`, { enabled: !!id })
}

export function usePets(clientId?: string) {
  const endpoint = clientId ? `/api/pets?clientId=${clientId}` : "/api/pets"
  return useApi<any[]>(endpoint)
}

export function usePet(id: string) {
  return useApi<any>(`/api/pets/${id}`, { enabled: !!id })
}

// Appointments hooks
export function useAppointments(filters?: { clientId?: string; veterinarianId?: string; status?: string }) {
  const params = new URLSearchParams()
  if (filters?.clientId) params.append("clientId", filters.clientId)
  if (filters?.veterinarianId) params.append("veterinarianId", filters.veterinarianId)
  if (filters?.status) params.append("status", filters.status)
  const queryString = params.toString()
  const endpoint = queryString ? `/api/appointments?${queryString}` : "/api/appointments"
  return useApi<any[]>(endpoint)
}

export function useAppointment(id: string) {
  return useApi<any>(`/api/appointments/${id}`, { enabled: !!id })
}

// Emergencies hooks
export function useEmergencies(filters?: { clientId?: string; status?: string; priority?: string }) {
  const params = new URLSearchParams()
  if (filters?.clientId) params.append("clientId", filters.clientId)
  if (filters?.status) params.append("status", filters.status)
  if (filters?.priority) params.append("priority", filters.priority)
  const queryString = params.toString()
  const endpoint = queryString ? `/api/emergencies?${queryString}` : "/api/emergencies"
  return useApi<any[]>(endpoint)
}

export function useEmergency(id: string) {
  return useApi<any>(`/api/emergencies/${id}`, { enabled: !!id })
}

// Medical Records hooks
export function useMedicalRecords(filters?: { petId?: string; veterinarianId?: string; serviceType?: string }) {
  const params = new URLSearchParams()
  if (filters?.petId) params.append("petId", filters.petId)
  if (filters?.veterinarianId) params.append("veterinarianId", filters.veterinarianId)
  if (filters?.serviceType) params.append("serviceType", filters.serviceType)
  const queryString = params.toString()
  const endpoint = queryString ? `/api/medical-records?${queryString}` : "/api/medical-records"
  return useApi<any[]>(endpoint)
}

export function useMedicalRecord(id: string) {
  return useApi<any>(`/api/medical-records/${id}`, { enabled: !!id })
}

// Inventory hooks
export function useInventory(filters?: { category?: string; search?: string }) {
  const params = new URLSearchParams()
  if (filters?.category) params.append("category", filters.category)
  if (filters?.search) params.append("search", filters.search)
  const queryString = params.toString()
  const endpoint = queryString ? `/api/inventory?${queryString}` : "/api/inventory"
  return useApi<any[]>(endpoint)
}

export function useInventoryItem(id: string) {
  return useApi<any>(`/api/inventory/${id}`, { enabled: !!id })
}

// Orders hooks
export function useOrders(filters?: { clientId?: string; status?: string }) {
  const params = new URLSearchParams()
  if (filters?.clientId) params.append("clientId", filters.clientId)
  if (filters?.status) params.append("status", filters.status)
  const queryString = params.toString()
  const endpoint = queryString ? `/api/orders?${queryString}` : "/api/orders"
  return useApi<any[]>(endpoint)
}

export function useOrder(id: string) {
  return useApi<any>(`/api/orders/${id}`, { enabled: !!id })
}
