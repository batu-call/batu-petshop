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
      <Image src={"/admin-banner.png"} alt='admin-banner' width={1000} height={1000} className='ml-40'/>
    </div>
  )
}

export default Main