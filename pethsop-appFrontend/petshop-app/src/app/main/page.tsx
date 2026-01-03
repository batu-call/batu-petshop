"use client"
import React, { useEffect, useState } from 'react'
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
import CircularText from '@/components/CircularText'

const sniglet = Sniglet({
  subsets: ['latin'],
  weight: ['400','800'],
});

const Main = () => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Sidebar />

      {loading ? (
        <div className="md:ml-24 lg:ml-40 fixed inset-0 flex justify-center items-center bg-primary z-50">
          <CircularText text="LOADING" spinDuration={20} className="text-white text-4xl" />
        </div>
      ) : (
        <div className="ml-0 md:ml-24 lg:ml-40">

          {/* BANNER */}
          <div className="relative w-full aspect-[16/7] min-h-[200px]">
            <Image
              src="/Yellow Cute Pet Shop Banner (6).png"
              alt="main-banner-image"
              fill
              priority
              className="object-cover"
            />

            <div className="
              absolute right-0 top-20
              flex flex-col justify-center
              px-4 sm:px-10 lg:px-20 xl:px-32
              gap-6
            ">

  
              <BlurText
                text="Pet Shop"
                delay={150}
                animateBy="words"
                direction="top"
                className="
                  text-color text-jost font-bold
                  text-2xl sm:text-5xl xl:text-7xl
                "
              />

              <BlurText
                text="Whether it's a cat, dog, bird, fish, or reptile — we offer all the care and essential products your pets need, all in one place."
                delay={50}
                animateBy="words"
                direction="top"
                className="
                  text-color text-jost font-bold
                  text-[10px] sm:text-sm xl:text-xl
                  max-w-xs sm:max-w-md xl:max-w-xl
                "
              />

  
              <div className="
                flex flex-col gap-3 sm:gap-4 xl:gap-6
                text-color font-bold
                short:scale-90
              ">
                {[
                  "Pet wellness and grooming",
                  "Best affordable pet accessories",
                  "Best quality organic pet food",
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="
                      relative
                      w-8 h-8
                      sm:w-10 sm:h-10
                      md:w-12 md:h-12
                      xl:w-16 xl:h-16
                    ">
                      <Image src="/banner-icon2.png" alt="icon" fill className="object-contain" />
                    </div>
                    <span className="text-[10px] sm:text-sm xl:text-xl">
                      {text}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link href="/AllProduct">
                  <Button
                    className={sniglet.className}
                    sx={{
                      width: { xs: "8rem", sm: "12rem", lg: "20rem" },
                      height: { xs: "2rem", lg: "3.5rem" },
                      borderRadius: "1.5rem",
                      bgcolor: "white",
                      fontSize: { xs: "0.75rem", sm: "1rem", lg: "1.75rem" },
                      fontWeight: 800,
                      color: "#393E46",
                      transition: "all 0.3s ease-in-out",
                      "&:hover": { transform: "scale(1.05)" },
                    }}
                  >
                    Shop Now
                  </Button>
                </Link>
              </div>

            </div>
          </div>
        </div>
      )}

      <NewArrivals />
      <Deals />
      <Footer />
    </div>
  )
}

export default Main
