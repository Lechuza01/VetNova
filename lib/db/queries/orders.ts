/**
 * Order database queries
 */

import { query, queryOne, execute } from "../db"
import type { Order } from "@/lib/types"

export async function getOrderById(id: string): Promise<Order | null> {
  const result = await queryOne<{
    id: string
    client_id: string | null
    user_id: string | null
    order_date: string
    total_amount: number
    payment_method: string
    payment_details: any
    status: string
    shipping_address: string | null
    notes: string | null
  }>(
    `SELECT id, client_id, user_id, order_date, total_amount, payment_method, payment_details, status, shipping_address, notes
     FROM orders
     WHERE id = $1`,
    [id]
  )

  if (!result) return null

  // Obtener items de la orden
  const items = await query<{
    product_id: string
    product_name: string
    quantity: number
    unit_price: number
    subtotal: number
  }>(
    `SELECT product_id, product_name, quantity, unit_price, subtotal
     FROM order_items
     WHERE order_id = $1`,
    [id]
  )

  return {
    id: result.id,
    date: result.order_date,
    items: items.map((i) => ({
      productId: i.product_id,
      productName: i.product_name,
      quantity: i.quantity,
      price: Number(i.unit_price),
    })),
    total: Number(result.total_amount),
    paymentMethod: result.payment_method as Order["paymentMethod"],
    status: result.status as Order["status"],
  }
}

export async function getOrdersByClientId(clientId: string): Promise<Order[]> {
  const results = await query<{
    id: string
    client_id: string | null
    user_id: string | null
    order_date: string
    total_amount: number
    payment_method: string
    payment_details: any
    status: string
    shipping_address: string | null
    notes: string | null
  }>(
    `SELECT id, client_id, user_id, order_date, total_amount, payment_method, payment_details, status, shipping_address, notes
     FROM orders
     WHERE client_id = $1
     ORDER BY order_date DESC`,
    [clientId]
  )

  const orders: Order[] = []

  for (const order of results) {
    const items = await query<{
      product_id: string
      product_name: string
      quantity: number
      unit_price: number
      subtotal: number
    }>(
      `SELECT product_id, product_name, quantity, unit_price, subtotal
       FROM order_items
       WHERE order_id = $1`,
      [order.id]
    )

    orders.push({
      id: order.id,
      date: order.order_date,
      items: items.map((i) => ({
        productId: i.product_id,
        productName: i.product_name,
        quantity: i.quantity,
        price: Number(i.unit_price),
      })),
      total: Number(order.total_amount),
      paymentMethod: order.payment_method as Order["paymentMethod"],
      status: order.status as Order["status"],
    })
  }

  return orders
}

export async function getAllOrders(filters?: {
  status?: Order["status"]
  clientId?: string
  dateFrom?: string
  dateTo?: string
}): Promise<Order[]> {
  let sql = `SELECT id, client_id, user_id, order_date, total_amount, payment_method, payment_details, status, shipping_address, notes
             FROM orders
             WHERE 1=1`
  const params: any[] = []
  let paramIndex = 1

  if (filters?.status) {
    sql += ` AND status = $${paramIndex++}`
    params.push(filters.status)
  }
  if (filters?.clientId) {
    sql += ` AND client_id = $${paramIndex++}`
    params.push(filters.clientId)
  }
  if (filters?.dateFrom) {
    sql += ` AND order_date >= $${paramIndex++}`
    params.push(filters.dateFrom)
  }
  if (filters?.dateTo) {
    sql += ` AND order_date <= $${paramIndex++}`
    params.push(filters.dateTo)
  }

  sql += ` ORDER BY order_date DESC`

  const results = await query<{
    id: string
    client_id: string | null
    user_id: string | null
    order_date: string
    total_amount: number
    payment_method: string
    payment_details: any
    status: string
    shipping_address: string | null
    notes: string | null
  }>(sql, params)

  const orders: Order[] = []

  for (const order of results) {
    const items = await query<{
      product_id: string
      product_name: string
      quantity: number
      unit_price: number
      subtotal: number
    }>(
      `SELECT product_id, product_name, quantity, unit_price, subtotal
       FROM order_items
       WHERE order_id = $1`,
      [order.id]
    )

    orders.push({
      id: order.id,
      date: order.order_date,
      items: items.map((i) => ({
        productId: i.product_id,
        productName: i.product_name,
        quantity: i.quantity,
        price: Number(i.unit_price),
      })),
      total: Number(order.total_amount),
      paymentMethod: order.payment_method as Order["paymentMethod"],
      status: order.status as Order["status"],
    })
  }

  return orders
}

export async function createOrder(orderData: {
  clientId?: string
  userId: string
  items: Array<{
    productId: string
    productName: string
    quantity: number
    unitPrice: number
  }>
  totalAmount: number
  paymentMethod: Order["paymentMethod"]
  paymentDetails?: any
  shippingAddress?: string
  notes?: string
}): Promise<Order> {
  // Crear la orden
  const orderResult = await queryOne<{
    id: string
    order_date: string
    total_amount: number
    payment_method: string
    status: string
  }>(
    `INSERT INTO orders (client_id, user_id, total_amount, payment_method, payment_details, shipping_address, notes, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, order_date, total_amount, payment_method, status`,
    [
      orderData.clientId || null,
      orderData.userId,
      orderData.totalAmount,
      orderData.paymentMethod,
      orderData.paymentDetails ? JSON.stringify(orderData.paymentDetails) : null,
      orderData.shippingAddress || null,
      orderData.notes || null,
      "completed", // Las órdenes se crean como completadas
    ]
  )

  if (!orderResult) throw new Error("Failed to create order")

  // Crear los items de la orden
  for (const item of orderData.items) {
    await execute(
      `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        orderResult.id,
        item.productId,
        item.productName,
        item.quantity,
        item.unitPrice,
        item.quantity * item.unitPrice,
      ]
    )
  }

  const created = await getOrderById(orderResult.id)
  if (!created) throw new Error("Failed to retrieve created order")
  return created
}

export async function updateOrderStatus(id: string, status: Order["status"]): Promise<Order> {
  await execute(
    `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
    [status, id]
  )

  const updated = await getOrderById(id)
  if (!updated) throw new Error("Failed to retrieve updated order")
  return updated
}

export async function deleteOrder(id: string): Promise<void> {
  // Los order_items se eliminan automáticamente por CASCADE
  await execute(`DELETE FROM orders WHERE id = $1`, [id])
}
