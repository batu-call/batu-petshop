import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"





const Page = () => {

  const [open, setOpen] = useState(false)

  return (
    <div>
      <div className='w-full h-30 bg-primary shadow-xl relative'>
        {/* Image */}
        <Link href={"/main"}>
      <div className='fixed'>
        <Image  src={"/logo.png"} alt='main-icon' width={500} height={500} className='flex justify-center items-center w-40 h-40'/>
      </div>
      </Link>
      {/* Image */}

      {/* Button */}
      <div className='absolute top-10 right-45'>
        <Button className='absolute cursor-pointer bg-secondary text-color w-40 text-base hover:bg-secondary'>Login</Button>
      </div>

      </div>
      <div className='flex gap-20 items-center justify-center absolute right-20'>       
      {/* Buton + dropdown*/}
     <div
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Buton */}
      <div className="w-50 h-7 rounded-xl bg-secondary flex items-center justify-center cursor-pointer">
        <h3 className="text-color text-jost">Products</h3>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 mt-1 w-50 bg-white shadow-lg rounded-xl z-10">
          <ul className="flex flex-col">
            <Link href="/AddProduct">
              <li>
                <a className="block px-4 py-2 hover:bg-gray-200 border-b-2 border-secondary">
                  Add Product
                </a>
              </li>
            </Link>
            <Link href="/AllProducts">
              <li>
                <a className="block px-4 py-2 hover:bg-gray-200 border-b-2 border-secondary">
                  All Products
                </a>
              </li>
            </Link>
            <Link href="/ProductStats">
              <li>
                <a className="block px-4 py-2 hover:bg-gray-200">Product Stats</a>
              </li>
            </Link>
          </ul>
        </div>
      )}
    </div>

           <div className="relative inline-block">
      {/* Buton + dropdown*/}
      <div className="group relative">
        <div className="w-50 h-7 rounded-xl bg-secondary flex items-center justify-center cursor-pointer">
          <h3 className="text-color text-jost">Products</h3>
        </div>

        {/* Dropdown */}
        <div className="absolute left-0 hidden group-hover:block mt-1 w-50 bg-white shadow-lg rounded-xl z-10">
          <ul className="flex flex-col">
            <Link href={"/AddProduct"}>
            <li>   
                <a className="block px-4 py-2 hover:bg-gray-200 border-secondary border-b-2">Add Product</a>  
            </li>
            </Link>
            <li>
             
                <a className="block px-4 py-2 hover:bg-gray-200 border-secondary border-b-2">All Products</a>
           
            </li>
            <li>
             
                <a className="block px-4 py-2 hover:bg-gray-200">Product Stats</a>
            
            </li>
          </ul>
        </div>
      </div>
    </div>

           <div className="relative inline-block">
      {/* Buton + dropdown*/}
      <div className="group relative">
        <div className="w-50 h-7 rounded-xl bg-secondary flex items-center justify-center cursor-pointer">
          <h3 className="text-color text-jost">Orders</h3>
        </div>

        {/* Dropdown */}
        <div className="absolute left-0 hidden group-hover:block mt-1 w-50 bg-white shadow-lg rounded-xl z-10">
          <ul className="flex flex-col">
            <li>        
                <a className="block px-4 py-2 hover:bg-gray-200 border-secondary border-b-2">All Orders</a>
         
            </li>
            <li>
             
                <a className="block px-4 py-2 hover:bg-gray-200 border-secondary border-b-2">Processing Orders</a>
           
            </li>
            <li>
             
                <a className="block px-4 py-2 hover:bg-gray-200">Completed Orders</a>
            
            </li>
             <li>
             
                <a className="block px-4 py-2 hover:bg-gray-200">Order Stats</a>
            
            </li>
          </ul>
        </div>
      </div>
    </div>
      </div>
    </div>
  )
}

export default Page