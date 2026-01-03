"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "../Navbar/page";
import Sidebar from "../Sidebar/page";
import NewArrivals from "../NewArrivals/page";
import Deals from "../Deals/page";
import Footer from "../Footer/page";
import Link from "next/link";
import { Button } from "@mui/material";
import BlurText from "@/components/BlurText";
import CircularText from "@/components/CircularText";

const Main = () => {

  const [loading, setLoading] = useState(true);

    useEffect(() => {
    const id = requestAnimationFrame(() => setLoading(false));
    return () => cancelAnimationFrame(id);
  }, []);


  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Sidebar />
       {loading ? (
        <div className="md:ml-24 lg:ml-40 fixed inset-0 flex items-center justify-center bg-primary z-50">
          <CircularText text="LOADING" spinDuration={20} className="text-white text-4xl" />
        </div>
      ) : (
      <main className="ml-0 md:ml-24 lg:ml-40">

        <section
          className="relative w-full"
          style={{ height: "calc(100vh - 64px)" }}
        >
     
          <Image
            src="/Yellow Cute Pet Shop Banner (6).png"
            alt="Pet Shop Banner"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />

       
          <div className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2 items-center px-4 sm:px-10 lg:px-20">
            <div />
           
            <div className="flex flex-col gap-6 lg:gap-10">
           
              <BlurText
                text="Pet Shop"
                animateBy="words"
                direction="top"
                className="
                  text-color font-bold
                  text-3xl sm:text-5xl lg:text-6xl xl:text-7xl
                "
              />

        
              <BlurText
                text="Whether it's a cat, dog, bird, fish, or reptile — we offer all the care and essential products your pets need."
                animateBy="words"
                direction="top"
                className="
                  text-color font-semibold
                  text-xs sm:text-sm lg:text-lg
                  max-w-md xl:max-w-xl
                "
              />

         
              <div className="flex flex-col gap-4">
                {[
                  "Pet wellness and grooming",
                  "Best affordable pet accessories",
                  "Best quality organic pet food",
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div
                      className="
                        relative
                        w-8 h-8
                        sm:w-10 sm:h-10
                        lg:w-14 lg:h-14
                      "
                    >
                      <Image
                        src="/banner-icon2.png"
                        alt="icon"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <p
                      className="
                        text-color font-bold
                        text-xs sm:text-sm lg:text-lg
                      "
                    >
                      {text}
                    </p>
                  </div>
                ))}
              </div>

              <Link href="/AllProduct" className="w-fit">
                <Button
                  sx={{
                    width: { xs: "10rem", lg: "18rem" },
                    height: { xs: "2.5rem", lg: "3.5rem" },
                    borderRadius: "2rem",
                    bgcolor: "white",
                    fontWeight: 800,
                    fontSize: { xs: "0.9rem", lg: "1.6rem" },
                    color: "#393E46",
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                >
                  Shop Now
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      )}

      <NewArrivals />
      <Deals />
      <Footer />
    </div>
  );
};

export default Main;
