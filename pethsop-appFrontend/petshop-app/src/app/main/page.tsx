"use client"
import React from 'react'
import Navbar from '../Navbar/page'
import Sidebar from '../Sidebar/page'
import Image from 'next/image'
import NewArrivals from '../NewArrivals/page'
import { Sniglet } from 'next/font/google'
import { Button } from '@mui/material'
import BlurText from "../../components/BlurText";
import Link from 'next/link'
import Deals from '../Deals/page'
import Footer from '../Footer/page'
import { UserGuard } from '../context/UserGuard'


const sniglet = Sniglet({
  subsets: ['latin'],
  weight: ['400','800'],
});


const Main = () => {
  
  return (
    <div>
      <UserGuard requireAuth={false}>
    <Navbar />
    <Sidebar/>
    <div className='ml-0 md:ml-30 lg:ml-40 flex gap-120 h-full'>
  <div className="w-full px-2 py-3 relative ">
     <Image
    src="/Yellow Cute Pet Shop Banner (4).png"
    alt="main-banner-image"
    fill 
    priority
    className="object-cover"
  /> 

  {/* main text */}
  <div className='absolute right-4 lg:absolute lg:top-20 lg:right-80'>
<div>
  <BlurText
  text="Pet Shop"
  delay={150}
  animateBy="words"
  direction="top"
  
  className="mb-8 text-color text-jost text-sm lg:text-9xl flex items-center justify-center font-bold" 
/>

  <BlurText
  text="Whether it's a cat, dog, bird, fish, or reptile — we offer all the care and essential products your pets need, all in one place."
  delay={50}
  animateBy="words"
  direction="top"
  className="mb-8 text-color text-jost text-sm lg:text-xl flex items-center justify-center font-bold w-60 sm:w-70 lg:w-120" 
/>
</div>
</div>

<div className='lg:absolute lg:top-95 lg:right-100 absolute top-5 right-5'> 
<div className='flex flex-col gap-20 mt-5 lg:text-xl text-xs text-color font-bold py-2 px-3'>
  <h2>Pet wellness and grooming</h2>
  <h2>Best affordable pet accessories</h2>
  <h2>Best quality organic pet food</h2>
</div>
  </div>

{/* Button */}
  <div className='flex flex-col gap-20 px-2 py-3 mt-8 absolute bottom-3 right-50'>
    <ul className='flex gap-6'>
      <li>
        <Link href={"/AllProduct"}><Button
      className={sniglet.className}
      sx={{
        width: {xs: "3rem", sm: "16rem", md: "20rem" },
        height: {xs: "1rem", sm: "2rem", md: "3.5rem" },
        borderRadius: "1.5rem",
        bgcolor: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        fontSize: {xs: "0.3rem", sm:"1rem" , md:"1.75rem"},   
        fontWeight:800,
        color:"#393E46",
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          transform: "scale(1.05)",
        },
      }}
    >
          Shop Now
    </Button></Link></li>
      <li><Link href={"/Contact"}><Button
      className={sniglet.className}
      sx={{
        width: {xs: "3rem", sm: "16rem", md: "20rem" },
        height: {xs: "1rem", sm: "2rem", md: "3.5rem" },
        borderRadius: "1.5rem",
        bgcolor: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        fontSize: {xs: "0.3rem", sm:"1rem" , md:"1.75rem"},    
        fontWeight:800,
        color:"#393E46",
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          transform: "scale(1.05)",
        },
      }}
    >
      24/7 Online Shop
    </Button></Link></li>
    </ul>
  </div>
</div>


    </div>

        <NewArrivals/>
        <Deals />
        <Footer />
        </UserGuard>
    </div>

  )
}

export default Main