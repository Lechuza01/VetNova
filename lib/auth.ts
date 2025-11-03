// Authentication utilities and mock data
export interface User {
  id: string
  username: string
  email: string
  name: string
  role: "admin" | "veterinarian" | "receptionist"
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
}

export function validateCredentials(username: string, password: string): User | null {
  const userRecord = mockUsers[username]
  if (userRecord && userRecord.password === password) {
    return userRecord.user
  }
  return null
}

export function generate2FACode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
