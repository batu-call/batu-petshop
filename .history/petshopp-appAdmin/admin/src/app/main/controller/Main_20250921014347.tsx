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
      <Image src={"/admin-banner.png"} alt='admin-banner' width={1743} height={100} className='ml-40 h-120'/>
    </div>
  )
}

export default Main