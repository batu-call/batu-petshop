import React from 'react'
import Navbar from '../../Navbar/page'
import Sidebar from '../../Sidebar/page'
import Image from 'next/image'

//1743
const Main = () => {  
  return (
    <div className='w-full h-screen bg-primary'>
      {/* Navbar */}
      <Navbar />
      {/* Catgeory */}
      <Sidebar />
       <div className="relative w-full h-[300px] sm:h-[300px] md:h-[400px] lg:h-[600px] ml-40">
      <Image
        src="/admin-banner3.png"
        alt="Admin Banner"
        fill
        className="object-cover rounded-lg"
        priority
      />
    </div>
    </div>
  )
}

export default Main