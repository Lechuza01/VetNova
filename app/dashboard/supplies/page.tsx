"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { FaPlus, FaEdit, FaTrash, FaSearch, FaExclamationTriangle } from "react-icons/fa"
import { useClinic } from "@/contexts/clinic-context"

export default function SuppliesPage() {
  const { inventory, addInventoryItem, deleteInventoryItem } = useClinic()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")

  const supplies = inventory.filter((item) => ["supply", "food"].includes(item.category))

  const filteredSupplies = supplies.filter((item) => {
    if (filterCategory !== "all" && item.category !== filterCategory) return false
    return item.name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const lowStockSupplies = supplies.filter((item) => item.quantity <= item.minStock)

  const getCategoryBadge = (category: string) => {
    const variants: Record<string, { variant: "default" | "secondary"; label: string }> = {
      supply: { variant: "default", label: "Insumo" },
      food: { variant: "secondary", label: "Alimento" },
    }
    const config = variants[category] || variants.supply
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Insumos</h1>
          <p className="text-muted-foreground mt-1">Gestión de insumos y alimentos</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <FaPlus className="mr-2" />
              Nuevo Insumo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Insumo</DialogTitle>
              <DialogDescription>Completa los datos del insumo</DialogDescription>
            </DialogHeader>
            <InventoryForm onSubmit={addInventoryItem} categories={["supply", "food"]} />
          </DialogContent>
        </Dialog>
      </div>

      {lowStockSupplies.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <FaExclamationTriangle />
              Alerta de Stock Bajo
            </CardTitle>
            <CardDescription>{lowStockSupplies.length} insumos necesitan reposición</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockSupplies.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-destructive/10 rounded">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-sm text-muted-foreground">
                    Stock: {item.quantity} / Mínimo: {item.minStock}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Insumos</CardTitle>
              <CardDescription>Total de {filteredSupplies.length} insumos</CardDescription>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="supply">Insumos</SelectItem>
                <SelectItem value="food">Alimentos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Buscar insumos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Stock Mínimo</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSupplies.map((item) => (
                  <TableRow key={item.id} className={item.quantity <= item.minStock ? "bg-destructive/5" : ""}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{getCategoryBadge(item.category)}</TableCell>
                    <TableCell>
                      <span className={item.quantity <= item.minStock ? "text-destructive font-bold" : ""}>
                        {item.quantity}
                      </span>
                    </TableCell>
                    <TableCell>{item.minStock}</TableCell>
                    <TableCell>€{item.price.toFixed(2)}</TableCell>
                    <TableCell>{item.supplier || "-"}</TableCell>
                    <TableCell>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <FaEdit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteInventoryItem(item.id)}>
                          <FaTrash className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function InventoryForm({ onSubmit, categories }: { onSubmit: (item: any) => void; categories: string[] }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const item = {
      id: Date.now().toString(),
      name: formData.get("name") as string,
      category: formData.get("category") as any,
      quantity: Number.parseInt(formData.get("quantity") as string),
      minStock: Number.parseInt(formData.get("minStock") as string),
      price: Number.parseFloat(formData.get("price") as string),
      supplier: formData.get("supplier") as string,
      expiryDate: formData.get("expiryDate") as string,
      notes: formData.get("notes") as string,
    }
    onSubmit(item)
  }

  return <form onSubmit={handleSubmit} className="space-y-4"></form>
}
