import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"



const page = () => {
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
        {/* <div className='w-50 h-7 rounded-xl bg-secondary '>
        <h3 className='items-center flex justify-center text-color text-jost'>Users</h3>
        </div> */}
        <div className="relative inline-block">
          {/* Buton */}
          <div className="w-50 h-7 rounded-xl bg-secondary flex items-center justify-center cursor-pointer">
            <h3 className="text-color text-jost">Users</h3>
          </div>

          {/* Dropdown */}
          <div className="absolute hidden group-hover:block mt-1 w-48 bg-white shadow-lg rounded-xl z-10">
            <ul className="flex flex-col">
              <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer">All Users</li>
              <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer">User Activity</li>
              <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer">Add Admin</li>
            </ul>
          </div>
        </div>

        <div className='w-50 h-7 rounded-xl bg-secondary'>
        <h3 className='items-center flex justify-center text-color text-jost'>Products</h3>
        </div>
        <div className='w-50 h-7 rounded-xl bg-secondary'>
        <h3 className='items-center flex justify-center text-color text-jost'>Orders</h3>
        </div>
      </div>
    </div>
  )
}

export default page