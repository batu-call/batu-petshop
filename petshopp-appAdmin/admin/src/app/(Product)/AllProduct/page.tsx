"use client"
import React, { useEffect, useState } from 'react'
import Navbar from "@/app/Navbar/page";
import Sidebar from "@/app/Sidebar/page";
import { AdminGuard } from "@/app/Context/AdminGuard";
import axios from 'axios'
import toast from 'react-hot-toast'
import Image from 'next/image'
import Link from 'next/link'
import CircularText from '@/components/CircularText'



type ProductImage = {
  url: string;
  publicId: string;
  _id: string;
};


type Product = {
    _id: string;
    product_name: string;
    description : string;
    price: string;
    image:ProductImage[];
    category : string;
    slug:string
}

const Page = () => {

  const [product,setProduct] = useState<Product[]>([]);
  const [loading,setLoading] = useState(true);



 const handlerRemove = async(id:string) =>{
  const confirm = window.confirm("Are you sure you want to delete this product?")
  if(!confirm) return;
    try {
      const response = await axios.delete(`http://localhost:5000/api/v1/product/products/${id}`, {
        withCredentials:true
      })
      if(response.data.success){
        toast.success("Product deleted ✅")
        setProduct(prev => prev.filter(p => p._id !== id))
      }
    } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      toast.error(error.response.data.message || "Unexpected error");
    } else if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error("Unexpected error!");
    }
  }
 }

  useEffect(() =>{
    const fetchProducts = async() =>{
      setLoading(true)
      try {
        const response = await axios.get("http://localhost:5000/api/v1/product/products")
        if(response.data.success){
          setProduct(response.data.products);
        }
      } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("xfghdxfgjdxfg!");
      }
    }
    finally {
      setLoading(false)
    }
    } 
    fetchProducts()
  },[])



   if (loading) {
    return (
      <>
        <Navbar />
        <Sidebar />
        <div className="ml-40 fixed inset-0 flex justify-center items-center bg-primary z-50">
          <CircularText
            text="LOADING"
            spinDuration={20}
            className="text-white text-4xl"
          />
        </div>
      </>
    );
  }


  return (
    <div className='bg-primary'>
    <AdminGuard>
      <Navbar />
      <Sidebar/>
      <div className='ml-40  flex-1 h-screen'>
        <div className='w-full h-screen bg-white'>
        <div className='w-full bg-secondary flex gap-2 mt-12 text-color justify-between'>
          <div className='bg-secondary h-10 w-16'></div>
           <div className='text-xl p-1 w-120 h-9 flex ml-12 items-center justify-center'>Product Name</div>
              <div className='text-xl p-1 w-120 h-9 flex ml-12 items-center justify-center'>Description</div>
              <div className='text-xl p-1 w-120 h-9 flex ml-12 items-center justify-center'>Price</div>
              <div className='text-xl p-1 w-120 h-9 ml-12 flex items-center justify-center' >Category</div>
        </div>
        {product.length === 0 ? (
          <p className='text-bold text-2xl text-color'>No Product!</p>
        ) : (
          product.map((p) =>(
            <Link href={`Products/${p.slug}`} key={p._id} className='flex items-center justify-center gap-2 border-1 border-y-teal-900 relative h-16 shadow-xl border-shadow'>
              <div className='w-10 h-10 relative'>
              <Image src={p.image[0].url} alt='product' fill className='object-cover flex items-center justify-center'/>
              </div>
              <div className='text-xl p-1 w-120 h-9 flex items-center justify-center ml-12 text-jost truncate  text-left'>{p.product_name}</div>
              <div className='text-xl p-1 w-120 h-9  ml-12 text-jost line-clamp-2 text-left'>{p.description}</div>
              <div className='text-xl p-1 w-120 h-9 flex items-center justify-center ml-12 text-jost'>{p.price}</div>
              <div className='text-xl p-1 w-120 h-9 flex item-center justify-center ml-12 text-jost'>{p.category}</div>
              <p className='hover:translate-y-1 cursor-pointer absolute right-0' 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlerRemove(p._id)}}><Image src={"/trash.png"} alt='trash-button' width={30} height={30}/></p>
            </Link>
          ))
        )}
      </div>
      </div>

    </AdminGuard>
    </div>
  )
}

export default Page