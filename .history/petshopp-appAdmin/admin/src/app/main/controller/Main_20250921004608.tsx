import React from 'react'
import Navbar from '../../Navbar/page'
import Sidebar from '../../Sidebar/page'
import Image from 'next/image'


const Main = () => {  
  return (
    <div className='w-full h-screen'>
      {/* Navbar */}
      <Navbar />
      {/* Catgeory */}
      <Sidebar />
      <Image src={"/admin-banner.png"} alt='admin-banner' width={240} height={240}/>
    </div>
  )
}

export default Main