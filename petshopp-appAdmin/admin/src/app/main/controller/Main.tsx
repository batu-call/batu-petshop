"use client"
import React from 'react'
import Navbar from '../../Navbar/page'
import Sidebar from '../../Sidebar/page'
import Image from 'next/image'
import { AdminGuard } from '@/app/Context/AdminGuard'
import TextType from '@/components/TextType'



const Main = () => {  
  
  return (
    <div className='w-full relative bg-primary h-screen'>
    <AdminGuard>
      {/* Navbar */}
      <Navbar />
      {/* Catgeory */}
      <Sidebar />
      <div>
      <div className='ml-50 absolute w-200 font-bold mt-12'>
        <h1 className='text-6xl mt-24 font-bold'>
        <TextType 
        text={["Welcome to your Admin Panel!"]}
        typingSpeed={75}
        pauseDuration={1500}
        showCursor={true}
        cursorCharacter=""
/>
        </h1>
        <h2 className='text-color text-7xl mt-12'>A <span className='text-white'>fast</span> and <span className='text-white'>secure</span></h2>
        <h2 className='text-color text-8xl text-jost mt-12'>space to manage your site</h2>
        <h2 className='text-color text-7xl text-jost mt-12'>content, and users.</h2>
      </div>
      <div className='w-280 ml-200'>
      <Image 
      src={"/main-banner-Photoroom.png"} 
      alt='main-banner' 
      width={1200} 
      height={800} 
      className='object-cover w-280 h-197'
      priority
      />
        
      </div>
      </div>
    </AdminGuard>
    </div>
  )
}

export default Main