"use client"
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Image from 'next/image'
import Navbar from '@/app/Navbar/page'
import Sidebar from '@/app/Sidebar/page'

type OrderItems = {
 product:
    | string
    | { _id: string; product_name: string; image: { url: string }[] };
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type ShippingAddress = {
  fullName: string;
  email: string;
  phoneNumber: string;
  city: string;
  address: string;
  postalCode: string;
};

type User = { 
  _id: string;
  firstName:string
  lastName:string
  email: string;
};

export type OrdersType = {
  _id: string;
  user: User | null;
  items: OrderItems[];
  shippingAddress: ShippingAddress;
  totalAmount: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
};

const Orders = () => {
  const [orders, setOrders] = useState<OrdersType[]>([])

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/order/meOrders`, { withCredentials: true })
        setOrders(response.data.orders)
      } catch (error) {
        console.error("Error fetching orders:", error)
      }
    }
    fetchOrders()
  }, [])

  return (
    <div>
      <Navbar />
      <Sidebar />
      <Box ml={40} mt={5} mr={5}>
        <Typography variant="h4" gutterBottom>
          Order History
        </Typography>

        {orders.length === 0 ? (
          <Typography>No orders found.</Typography>
        ) : (
          orders.map(order => (
            <Accordion key={order._id} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight="bold">
                  Order ID: {order._id} | Date: {new Date(order.createdAt).toLocaleDateString()} | Total: {order.totalAmount} USD
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {/* Customer Info */}
                <Box mb={2}>
                  <Typography variant="subtitle1" fontWeight="bold">Customer Info:</Typography>
                  <Typography>Name: {order.user ? `${order.user.firstName} ${order.user.lastName}` : "N/A"} </Typography>
                  <Typography>Email: {order.user?.email || "N/A"}</Typography>
                </Box>

                {/* Shipping Address */}
                <Box mb={2}>
                  <Typography variant="subtitle1" fontWeight="bold">Shipping Address:</Typography>
                  <Typography>{order.shippingAddress.fullName}</Typography>
                  <Typography>{order.shippingAddress.address}, {order.shippingAddress.city}</Typography>
                  <Typography>{order.shippingAddress.postalCode}</Typography>
                  <Typography>Email: {order.shippingAddress.email}</Typography>
                  <Typography>Phone: {order.shippingAddress.phoneNumber}</Typography>
                </Box>

                {/* Items */}
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Items:</Typography>
                  <Box display="flex" flexWrap="wrap" gap={2}>
                    {order.items.map((item, idx) => (
                      <Box
                        key={idx}
                        display="flex"
                        alignItems="center"
                        gap={2}
                        p={1}
                        border="1px solid #e0e0e0"
                        borderRadius={2}
                        width={{ xs: '100%', sm: '48%', md: '30%' }}
                      >
                        <Image
  src={
    typeof item.product !== "string" 
      ? item.product.image?.[0]?.url 
      : '/default-product.png'
  }
  alt={typeof item.product !== "string" ? item.product.product_name : 'product image'}

                          width={60}
                          height={60}
                          unoptimized
                        />
                        <Box>
                          <Typography fontWeight="bold">{item.name}</Typography>
                          <Typography variant="body2">Quantity: {item.quantity}</Typography>
                          <Typography variant="body2">Price: {item.price} USD</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Box>
    </div>
  )
}

export default Orders
