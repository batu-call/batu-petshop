import React from 'react'
import Navbar from '../../Navbar/page'
import Sidebar from '../../Sidebar/page'
import Image from 'next/image'


const Main = () => {  
  return (
    <div className='w-full h-screen bg-primary'>
      {/* Navbar */}
      <Navbar />
      {/* Catgeory */}
      <Sidebar />
      <Image src={"/admin-banner.png"} alt='admin-banner' width={1743} height={400} className='ml-40'/>
    </div>
  )
}

export default Main