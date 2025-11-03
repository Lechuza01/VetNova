"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { FaShoppingCart, FaPlus, FaMinus, FaTrash, FaSearch, FaStar, FaFilter, FaCreditCard, FaWallet, FaHistory, FaCheckCircle } from "react-icons/fa"
import { useCart } from "@/contexts/cart-context"
import { useOrders } from "@/contexts/orders-context"
import { marketplaceProducts } from "@/lib/marketplace-data"
import type { MarketplaceProduct, PaymentMethod } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import Image from "next/image"

const categories = [
  { value: "all", label: "Todas las categorías" },
  { value: "food", label: "Alimentos" },
  { value: "toys", label: "Juguetes" },
  { value: "accessories", label: "Accesorios" },
  { value: "medicine", label: "Medicina" },
  { value: "hygiene", label: "Higiene" },
  { value: "other", label: "Otros" },
]

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const { items, addToCart, removeFromCart, updateQuantity, getTotal, getItemCount } = useCart()
  const { orders } = useOrders()
  const { toast } = useToast()

  const filteredProducts = marketplaceProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleAddToCart = (product: MarketplaceProduct) => {
    if (product.stock <= 0) {
      toast({
        title: "Sin stock",
        description: "Este producto no está disponible",
        variant: "destructive",
      })
      return
    }
    addToCart(product, 1)
    toast({
      title: "Agregado al carrito",
      description: `${product.name} se agregó al carrito`,
    })
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Marketplace</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Productos para tus mascotas</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="relative">
                <FaHistory className="mr-2" />
                Historial
                {orders.length > 0 && (
                  <Badge className="ml-2 bg-primary text-primary-foreground">{orders.length}</Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Historial de Compras</DialogTitle>
                <DialogDescription>{orders.length} compras realizadas</DialogDescription>
              </DialogHeader>
              <OrdersHistory orders={orders} />
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="relative">
                <FaShoppingCart className="mr-2" />
                Carrito
                {getItemCount() > 0 && (
                  <Badge className="ml-2 bg-destructive text-destructive-foreground">{getItemCount()}</Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Carrito de Compras</DialogTitle>
                <DialogDescription>{getItemCount()} productos en tu carrito</DialogDescription>
              </DialogHeader>
              <CartContent
                items={items}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
                total={getTotal()}
                onClearCart={() => {}}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <FaFilter className="mr-2" />
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No se encontraron productos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ProductCard({
  product,
  onAddToCart,
}: {
  product: MarketplaceProduct
  onAddToCart: (product: MarketplaceProduct) => void
}) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative w-full h-48 bg-muted">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        {product.stock <= 5 && product.stock > 0 && (
          <Badge className="absolute top-2 right-2 bg-yellow-500">Pocas unidades</Badge>
        )}
        {product.stock === 0 && <Badge className="absolute top-2 right-2 bg-destructive">Sin stock</Badge>}
      </div>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{product.name}</CardTitle>
          {product.rating && (
            <div className="flex items-center gap-1 text-sm">
              <FaStar className="text-yellow-500 fill-yellow-500" />
              <span>{product.rating}</span>
              {product.reviews && <span className="text-muted-foreground">({product.reviews})</span>}
            </div>
          )}
        </div>
        <CardDescription className="line-clamp-2">{product.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-2xl font-bold text-primary">€{product.price.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Stock: {product.stock}</p>
          </div>
          <Badge variant="outline">{categories.find((c) => c.value === product.category)?.label}</Badge>
        </div>
        <Button
          className="w-full"
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
        >
          <FaShoppingCart className="mr-2" />
          Agregar al carrito
        </Button>
      </CardContent>
    </Card>
  )
}

function CartContent({
  items,
  onUpdateQuantity,
  onRemove,
  total,
  onClearCart,
}: {
  items: Array<{ productId: string; quantity: number; product?: MarketplaceProduct }>
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
  total: number
  onClearCart: () => void
}) {
  const { toast } = useToast()
  const { addOrder } = useOrders()
  const { clearCart } = useCart()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit_card")

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega productos al carrito antes de finalizar la compra",
        variant: "destructive",
      })
      return
    }

    // Crear la orden
    const orderItems = items.map((item) => ({
      productId: item.productId,
      productName: item.product?.name || "Producto desconocido",
      quantity: item.quantity,
      price: item.product?.price || 0,
    }))

    addOrder({
      items: orderItems,
      total,
      paymentMethod,
      status: "completed",
    })

    // Limpiar el carrito
    clearCart()
    onClearCart()

    const paymentMethodNames = {
      credit_card: "Tarjeta de Crédito",
      debit_card: "Tarjeta de Débito",
      mercadopago: "Mercadopago",
    }

    toast({
      title: "Compra realizada",
      description: `Total: €${total.toFixed(2)}. Método de pago: ${paymentMethodNames[paymentMethod]}. Gracias por tu compra!`,
    })
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FaShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>Tu carrito está vacío</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {items.map((item) => {
          if (!item.product) return null
          return (
            <div key={item.productId} className="flex gap-4 p-4 border rounded-lg">
              <div className="relative w-20 h-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={item.product.image}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{item.product.name}</h4>
                <p className="text-sm text-muted-foreground">€{item.product.price.toFixed(2)} c/u</p>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                  >
                    <FaMinus className="w-3 h-3" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                    disabled={item.quantity >= (item.product.stock || 0)}
                  >
                    <FaPlus className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(item.productId)}
                    className="ml-auto text-destructive"
                  >
                    <FaTrash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">€{(item.product.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          )
        })}
      </div>
      <Separator />
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold mb-3 block">Método de Pago</Label>
          <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="credit_card" id="credit_card" />
                <Label htmlFor="credit_card" className="flex items-center gap-2 cursor-pointer flex-1">
                  <FaCreditCard className="w-4 h-4" />
                  <span>Tarjeta de Crédito</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="debit_card" id="debit_card" />
                <Label htmlFor="debit_card" className="flex items-center gap-2 cursor-pointer flex-1">
                  <FaCreditCard className="w-4 h-4" />
                  <span>Tarjeta de Débito</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="mercadopago" id="mercadopago" />
                <Label htmlFor="mercadopago" className="flex items-center gap-2 cursor-pointer flex-1">
                  <FaWallet className="w-4 h-4" />
                  <span>Mercadopago</span>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>
        <Separator />
        <div className="flex justify-between text-lg font-bold">
          <span>Total:</span>
          <span className="text-primary">€{total.toFixed(2)}</span>
        </div>
        <Button className="w-full" size="lg" onClick={handleCheckout}>
          Finalizar Compra
        </Button>
      </div>
    </div>
  )
}

function OrdersHistory({ orders }: { orders: any[] }) {
  const paymentMethodNames = {
    credit_card: "Tarjeta de Crédito",
    debit_card: "Tarjeta de Débito",
    mercadopago: "Mercadopago",
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FaHistory className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>No hay compras registradas</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">Orden #{order.id.slice(-6)}</CardTitle>
                <CardDescription>
                  {new Date(order.date).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </CardDescription>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                <FaCheckCircle className="w-3 h-3" />
                {order.status === "completed" ? "Completada" : order.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      Cantidad: {item.quantity} x €{item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-bold">€{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Método de pago</p>
                <p className="font-medium">{paymentMethodNames[order.paymentMethod as keyof typeof paymentMethodNames]}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-bold text-primary">€{order.total.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

