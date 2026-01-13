"use client"
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, Divider } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Image from 'next/image'
import Navbar from '@/app/Navbar/page'
import Sidebar from '@/app/Sidebar/page'
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import CircularText from '@/components/CircularText'
import Footer from '@/app/Footer/page'

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
  firstName: string;
  lastName: string;
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
  const [loading,setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/order/meOrders`,
          { withCredentials: true }
        )
        setOrders(response.data.orders)
      } catch (error) {
        console.error("Error fetching orders:", error)
      }
      finally{
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)

    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <>
    <div className='bg-[#f6f7f9] min-h-screen'>
      <Navbar />
      <Sidebar />
     {loading ? (
        <div className="md:ml-24 lg:ml-40 fixed inset-0 flex justify-center items-center bg-primary z-50">
          <CircularText
            text="LOADING"
            spinDuration={20}
            className="text-white text-4xl"
          />
        </div>
      ) : (
      <Box ml={{ xs: 0, sm: 24 }} mt={5} mr={{ xs: 0, md: 5 }} p={{ xs: 2, md: 0 }}>
        {
          orders.length === 0 ? (
          <div className="mt-20 flex flex-col items-center justify-center w-full">
            <p className="text-gray-500 text-lg font-semibold mb-4">
              No orders found.
            </p>
          </div>
        ) : (
          orders.map(order => (
            <Accordion
              key={order._id}
              sx={{
                mb: 2,
                borderRadius: 2,
                border: "1px solid #ddd",
                backgroundColor: "white",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box>
                  <Typography fontWeight="bold" color="#929aab" sx={{ fontSize: 16 }}>
                    Order ID: {order._id}
                  </Typography>

                  <Typography sx={{ fontSize: 14, color: "#555" }}>
                    {formatDate(order.createdAt)} • Total:{" "}
                    <span style={{ fontWeight: 600 }}>{order.totalAmount} USD</span>
                  </Typography>
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                <Divider sx={{ mb: 2 }} />

                {/* Customer Info */}
                <Box mb={2}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }} className='text-[#929aab]'>
                    Customer Information
                  </Typography>

                  <Typography sx={{ color: "#444" }}>
                    <strong className='text-[#929aab]'>Name :</strong>{" "}
                    {order.user
                      ? `${order.user.firstName} ${order.user.lastName}`
                      : "N/A"}
                  </Typography>

                  <Typography sx={{ color: "#444" }}>
                    <strong className='text-[#929aab]'>Email :</strong> {order.user?.email || "N/A"}
                  </Typography>
                </Box>

                {/* Shipping Address */}
                <Box mb={2}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }} className='text-[#929aab]'>
                    Shipping Address
                  </Typography>

                  <Typography>{order.shippingAddress.fullName}</Typography>
                  <Typography className='overflow-hidden break-words'>
                    {order.shippingAddress.address}, {order.shippingAddress.city}
                  </Typography>
                  <Typography>{order.shippingAddress.postalCode}</Typography>
                  <Typography className='text-[#929aab]'>Email: {order.shippingAddress.email}</Typography>
                    <div className='overflow-hidden break-words'>
                    <span className='text-color'>Phone:</span> 
                    <PhoneInput
                  country={"us"}
                  value={order.shippingAddress.phoneNumber}
                  buttonStyle={{
                    border: "none",
                    background: "transparent",
                  }}
                  dropdownStyle={{
                    borderRadius: "8px",
                  }}
                  specialLabel="Phone"
                  inputProps={{
                    readOnly: true,
                  }}
                  disabled={true}
                />
                    
                    </div>
                </Box>

                {/* Items */}
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={{ mb: 2 }}
                  >
                    Items
                  </Typography>

                  <Box display="flex" flexWrap="wrap" gap={2}>
                    {order.items.map((item, idx) => (
                      <Box
                        key={idx}
                        display="flex"
                        alignItems="center"
                        gap={2}
                        p={2}
                        sx={{
                          border: "1px solid #e2e2e2",
                          borderRadius: 2,
                          width: { xs: "100%", sm: "48%", md: "30%" },
                          backgroundColor: "#fafafa",
                        }}
                      >
                        <Image
                          src={
                            typeof item.product !== "string"
                              ? item.product.image?.[0]?.url
                              : "/default-product.png"
                          }
                          alt={
                            typeof item.product !== "string"
                              ? item.product.product_name
                              : "product image"
                          }
                          width={60}
                          height={60}
                          unoptimized
                          style={{
                            borderRadius: 8,
                            objectFit: "cover",
                          }}
                        />

                        <Box>
                          <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                            {item.name}
                          </Typography>
                          <Typography sx={{ fontSize: 13, color: "#555" }}>
                            Quantity: {item.quantity}
                          </Typography>
                          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                            Price: {item.price} USD
                          </Typography>
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
      )}
    </div>
      <Footer/>
    </>
  )
}

export default Orders
