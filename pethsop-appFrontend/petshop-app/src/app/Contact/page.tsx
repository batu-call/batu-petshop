import React from 'react'
import Sidebar from '../Sidebar/page'
import Navbar from '../Navbar/page'
import Image from 'next/image'


const Contact = () => {
  return (
   <div className='relative'>
   <Navbar/>
    <Sidebar/>
   <div className='lg:ml-40'>
    <div className='h-full relative'>
    <Image src={"/contact.png"} alt='contact-image' fill className='object-cover'/>
    </div>
   </div>
   </div>
  )
}

export default Contact