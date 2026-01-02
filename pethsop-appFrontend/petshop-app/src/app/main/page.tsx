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
    <div className='min-h-screen flex flex-col'>
      <UserGuard requireAuth={false}>
    <Navbar />
    <Sidebar/>
    <div className='ml-0 md:ml-24 lg:ml-40 flex gap-120 xl:h-[848px]'>
  <div className="w-full relative aspect-[16/7] min-h-[200px]">
     <Image
    src="/Yellow Cute Pet Shop Banner (6).png"
    alt="main-banner-image"
    fill 
    priority
    className="object-cover"
  /> 

  {/* main text */}
  <div className='absolute right-1 md:absolute md:right-1 lg:absolute lg:top-2 lg:right-30 xl:absolute xl:top-20 xl:right-80'>
<div>
  <BlurText
  text="Pet Shop"
  delay={150}
  animateBy="words"
  direction="top"
  
  className="mb-2 xl:mb-8 text-color text-jost text-2xl sm:text-6xl xl:text-7xl flex items-center justify-center font-bold" 
/>

  <BlurText
  text="Whether it's a cat, dog, bird, fish, or reptile — we offer all the care and essential products your pets need, all in one place."
  delay={50}
  animateBy="words"
  direction="top"
  className="mb-8 text-color text-jost text-[8px] md:text-sm xl:text-xl flex items-center justify-center font-bold w-60 sm:w-70 xl:w-120" 
/>
</div>
</div>

<div className='absolute top-19 right-2 md:absolute md:top-31 md:right-8 lg:absolute lg:top-44 lg:right-42 xl:absolute xl:top-103 xl:right-100'> 
<div className='flex flex-col lg:gap-8 xl:gap-14 mt-5 text-[7px] md:text-xs xl:text-xl text-color font-bold py-2 px-3'>
  <div className="flex items-center gap-5">
  <div className="relative 
  w-8 h-8 
  sm:w-10 sm:h-10 
  md:w-12 md:h-12 
  lg:w-14 lg:h-14 
  xl:w-18 xl:h-18 
  2xl:w-20 2xl:h-20">
    <Image
      src="/banner-icon2.png"
      alt="banner-icon"
      fill
      className="object-contain"
    />
  </div>

  <h2 className="text-[10px] sm:text-sm xl:text-xl font-bold text-color">
    Pet wellness and grooming
  </h2>
</div>

 <div className="flex items-center gap-2">
  <div className="relative  w-8 h-8 
  sm:w-10 sm:h-10 
  md:w-12 md:h-12 
  lg:w-14 lg:h-14 
  xl:w-18 xl:h-18 
  2xl:w-20 2xl:h-20">
    <Image
      src="/banner-icon2.png"
      alt="banner-icon"
      fill
      className="object-contain"
    />
  </div>

  <h2 className="text-[10px] sm:text-sm xl:text-xl font-bold text-color">
    Best affordable pet accessories
  </h2>
</div>

 <div className="flex items-center gap-2">
  <div className="relative  w-8 h-8 
  sm:w-10 sm:h-10 
  md:w-12 md:h-12 
  lg:w-14 lg:h-14 
  xl:w-18 xl:h-18 
  2xl:w-20 2xl:h-20">
    <Image
      src="/banner-icon2.png"
      alt="banner-icon"
      fill
      className="object-contain"
    />
  </div>

  <h2 className="text-[10px] sm:text-sm xl:text-xl font-bold text-color">
    Best quality organic pet food
  </h2>
</div>
</div>
  </div>

{/* Button */}
  <div className='flex flex-col gap-20 px-2 py-3 mt-8 absolute right-5 bottom-0 lg:absolute lg:top-74 lg:right-5 xl:absolute xl:top-175 xl:right-40'>
    <ul className='flex gap-6'>
      <li>
        <Link href={"/AllProduct"}><Button
      className={sniglet.className}
      sx={{
       width: {xs: "2rem", sm: "16rem", md: "12rem",lg:"20rem" },
        height: {xs: "1.5rem", sm: "2rem", md: "2rem",lg:"3.5rem" },
        borderRadius: "1.5rem",
        bgcolor: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        fontSize: {xs: "0.5rem", sm:"1rem" , md:"1rem" ,lg:"1.75rem"},   
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
      <li className='hidden lg:block'><Link href={"/Contact"}><Button
      className={sniglet.className}
      sx={{
        width: {xs: "1rem", sm: "16rem", md: "12rem",lg:"20rem" },
        height: {xs: "1rem", sm: "2rem", md: "2rem" ,lg:"3.5rem"},
        borderRadius: "1.5rem",
        bgcolor: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        fontSize: {xs: "0.5rem", sm:"1rem" , md:"1rem",lg:"1.75rem"},    
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