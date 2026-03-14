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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FaPlus, FaEdit, FaTrash, FaSearch, FaExclamationTriangle } from "react-icons/fa"
import { useToast } from "@/hooks/use-toast"
import { useInventory } from "@/lib/hooks/use-api"

export default function SuppliesPage() {
  const { toast } = useToast()
  const { data: inventory = [], loading: inventoryLoading, mutate: refreshInventory } = useInventory()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [dialogOpen, setDialogOpen] = useState(false)

  // Ensure inventory is always an array
  const safeInventory = Array.isArray(inventory) ? inventory : []
  const supplies = safeInventory.filter((item: any) => item && ["supply", "food"].includes(item.category))

  // Wrapper functions for API calls
  const addInventoryItem = async (item: any) => {
    try {
      // Primero crear el item de inventario
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: item.name,
          category: item.category,
          description: item.description || undefined,
          unitOfMeasure: item.unitOfMeasure || undefined,
          minStock: item.minStock,
          price: item.price,
          supplier: item.supplier || undefined,
          expiryDate: item.expiryDate || undefined,
          notes: item.notes || undefined,
        }),
      })
      
      if (response.ok) {
        const createdItem = await response.json()
        
        // Si hay cantidad inicial, crear un movimiento de inventario tipo "ingreso"
        if (item.quantity && item.quantity > 0) {
          const movementResponse = await fetch(`/api/inventory/${createdItem.id}/movements`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              movementType: "ingreso",
              quantity: item.quantity,
              reason: "Stock inicial",
              notes: "Stock inicial al crear el item",
            }),
          })
          
          if (!movementResponse.ok) {
            console.warn("Item creado pero no se pudo registrar el movimiento de stock inicial")
          }
        }
        
        toast({
          title: "Insumo registrado",
          description: "El insumo se ha registrado correctamente",
        })
        refreshInventory()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "No se pudo registrar el insumo",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo conectar con el servidor",
        variant: "destructive",
      })
    }
  }

  const deleteInventoryItem = async (id: string) => {
    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: "DELETE",
      })
      
      if (response.ok) {
        toast({
          title: "Insumo eliminado",
          description: "El insumo se ha eliminado correctamente",
        })
        refreshInventory()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "No se pudo eliminar el insumo",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo conectar con el servidor",
        variant: "destructive",
      })
    }
  }

  const filteredSupplies = supplies.filter((item: any) => {
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
            <InventoryForm
              onSubmit={async (item) => {
                await addInventoryItem(item)
                setDialogOpen(false)
              }}
              onCancel={() => setDialogOpen(false)}
              categories={["supply", "food"]}
            />
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

function InventoryForm({
  onSubmit,
  onCancel,
  categories,
}: {
  onSubmit: (item: any) => void
  onCancel?: () => void
  categories: string[]
}) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const item = {
      name: formData.get("name") as string,
      category: formData.get("category") as any,
      description: formData.get("description") as string || undefined,
      unitOfMeasure: formData.get("unitOfMeasure") as string || undefined,
      quantity: Number.parseInt(formData.get("quantity") as string) || 0,
      minStock: Number.parseInt(formData.get("minStock") as string) || 0,
      price: Number.parseFloat(formData.get("price") as string) || 0,
      supplier: formData.get("supplier") as string || undefined,
      expiryDate: formData.get("expiryDate") as string || undefined,
      notes: formData.get("notes") as string || undefined,
    }
    onSubmit(item)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre *</Label>
          <Input id="name" name="name" required placeholder="Nombre del insumo" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Categoría *</Label>
          <Select name="category" required>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.includes("supply") && <SelectItem value="supply">Insumo</SelectItem>}
              {categories.includes("food") && <SelectItem value="food">Alimento</SelectItem>}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" name="description" placeholder="Descripción del insumo..." rows={2} />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Cantidad Inicial *</Label>
          <Input id="quantity" name="quantity" type="number" required placeholder="0" defaultValue="0" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unitOfMeasure">Unidad de Medida</Label>
          <Input id="unitOfMeasure" name="unitOfMeasure" placeholder="kg, litros, unidades..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minStock">Stock Mínimo *</Label>
          <Input id="minStock" name="minStock" type="number" required placeholder="0" defaultValue="0" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Precio (€) *</Label>
          <Input id="price" name="price" type="number" step="0.01" required placeholder="0.00" defaultValue="0" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="supplier">Proveedor</Label>
          <Input id="supplier" name="supplier" placeholder="Nombre del proveedor" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expiryDate">Fecha de Vencimiento</Label>
          <Input id="expiryDate" name="expiryDate" type="date" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea id="notes" name="notes" placeholder="Información adicional..." rows={3} />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Registrar Insumo</Button>
      </div>
    </form>
  )
}
