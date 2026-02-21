// Authentication utilities and mock data
export interface User {
  id: string
  username: string
  email: string
  name: string
  role: "admin" | "veterinarian" | "receptionist" | "cliente"
  phone?: string
  address?: string
  birthDate?: string
}

// Mock users for demo
export const mockUsers: Record<string, { password: string; user: User }> = {
  admin: {
    password: "admin123",
    user: {
      id: "1",
      username: "admin",
      email: "admin@vetnova.com",
      name: "Dr. María González",
      role: "admin",
      phone: "+34 600 123 456",
      birthDate: "1985-03-15",
    },
  },
  veterinario: {
    password: "vet123",
    user: {
      id: "2",
      username: "veterinario",
      email: "vet@vetnova.com",
      name: "Dr. Carlos Ruiz",
      role: "veterinarian",
      phone: "+34 600 654 321",
      birthDate: "1990-07-22",
    },
  },
  cliente: {
    password: "cliente123",
    user: {
      id: "3",
      username: "cliente",
      email: "ana.martinez@email.com",
      name: "Ana Martínez",
      role: "cliente",
      phone: "+34 600 111 222",
      birthDate: "1992-05-20",
    },
  },
}

// Synchronous version for backward compatibility (uses mock data)
export function validateCredentials(username: string, password: string): User | null {
  const userRecord = mockUsers[username]
  if (userRecord && userRecord.password === password) {
    return userRecord.user
  }
  return null
}

// Async version that checks database first, falls back to mock data
export async function validateCredentialsAsync(username: string, password: string): Promise<User | null> {
  try {
    // Try to authenticate via API (which uses database)
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })

    if (response.ok) {
      const user = await response.json()
      return user as User
    }

    // If API fails (DB not available), fall back to mock data
    return validateCredentials(username, password)
  } catch (error) {
    console.warn("Database authentication failed, using mock data:", error)
    // Fallback to mock data
    return validateCredentials(username, password)
  }
}

export function generate2FACode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
