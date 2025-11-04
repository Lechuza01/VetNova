// Core data types for the veterinary clinic system

export interface User {
  id: string
  username: string
  email: string
  name: string
  role: "admin" | "veterinarian" | "receptionist"
  phone?: string
  address?: string
  birthDate?: string
  createdAt: string
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  registrationDate: string
  notes?: string
}

export interface Pet {
  id: string
  name: string
  species: string
  breed: string
  birthDate: string
  weight: number
  color: string
  clientId: string
  microchipNumber?: string
  notes?: string
  photo?: string
  status?: "active" | "deceased" | "transferred" | "adopted"
  statusDate?: string
  statusNotes?: string
}

export interface MedicalRecord {
  id: string
  petId: string
  date: string
  veterinarianId: string
  reason: string
  diagnosis: string
  treatment: string
  observations: string
  nextVisit?: string
  attachments?: string[]
}

export interface Appointment {
  id: string
  petId: string
  clientId: string
  veterinarianId: string
  date: string
  time: string
  reason: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  notes?: string
}

export interface InventoryItem {
  id: string
  name: string
  category: "medicine" | "supply" | "equipment" | "food"
  quantity: number
  minStock: number
  price: number
  supplier?: string
  expiryDate?: string
  notes?: string
}

export interface Report {
  id: string
  type: "income" | "appointments" | "inventory" | "clients"
  dateFrom: string
  dateTo: string
  generatedBy: string
  generatedAt: string
  data: any
}

export interface MarketplaceProduct {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: "food" | "toys" | "accessories" | "medicine" | "hygiene" | "other"
  stock: number
  rating?: number
  reviews?: number
}

export interface CartItem {
  productId: string
  quantity: number
  product?: MarketplaceProduct
}

export type PaymentMethod = "credit_card" | "debit_card" | "mercadopago"

export interface Order {
  id: string
  date: string
  items: Array<{
    productId: string
    productName: string
    quantity: number
    price: number
  }>
  total: number
  paymentMethod: PaymentMethod
  status: "completed" | "pending" | "cancelled"
}

export interface CommunityPost {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  petId?: string
  petName?: string
  petPhoto?: string
  content: string
  images?: string[]
  date: string
  likes: number
  comments: number
  likedBy: string[]
  commentsList: Array<{
    id: string
    userId: string
    userName: string
    userAvatar?: string
    content: string
    date: string
  }>
}

export interface Story {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  petId?: string
  petName?: string
  image: string
  date: string
  expiresAt: string
  viewedBy: string[]
}

export interface Study {
  id: string
  hospitalizationId: string
  type: "blood_test" | "xray" | "ultrasound" | "ecg" | "biopsy" | "other"
  name: string
  date: string
  results: string
  attachments?: string[]
  performedBy: string
}

export interface Hospitalization {
  id: string
  petId: string
  clientId: string
  admissionDate: string
  dischargeDate?: string
  reason: string
  diagnosis: string
  treatment: string
  status: "active" | "discharged" | "transferred"
  veterinarianId: string
  room?: string
  notes?: string
  studies: Study[]
  vitalSigns?: Array<{
    date: string
    temperature?: number
    heartRate?: number
    respiratoryRate?: number
    weight?: number
    notes?: string
  }>
}
