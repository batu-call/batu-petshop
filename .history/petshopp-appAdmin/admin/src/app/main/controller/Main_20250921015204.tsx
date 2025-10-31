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
      <Image src={"/admin-banner3.png"} alt='admin-banner' width={1760} height={600} className='ml-40 h-[791px] w-[2000]' priority/>
    </div>
  )
}

export default Main