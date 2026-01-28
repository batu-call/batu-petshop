"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import NewArrivals from "../NewArrivals/page";
import Deals from "../Deals/page";
import Footer from "../Footer/page";
import Link from "next/link";
import { Button } from "@mui/material";
import BlurText from "@/components/BlurText";
import CircularText from "@/components/CircularText";
import PetsIcon from "@mui/icons-material/Pets";
import FeaturedProducts from "../FeaturedProducts/page";

const Main = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = requestAnimationFrame(() => setLoading(false));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {loading ? (
        <div className="md:ml-24 lg:ml-40 fixed inset-0 flex items-center justify-center bg-primary z-50">
          <CircularText
            text="LOADING"
            spinDuration={20}
            className="text-white text-4xl"
          />
        </div>
      ) : (
        <main className="bg-primary pb-8 lg:pb-16">
          {/* Hero Banner Section */}
          <section className="relative w-full lg:h-[calc(100vh-64px)]">
            {/* Mobile Layout */}
            <div className="lg:hidden">
              {/* Mobile Banner Image */}
              <div className="w-full h-auto">
                <Image
                  src="/mobile-banner.png"
                  alt="Pet Shop Banner Mobile"
                  width={1080}
                  height={500}
                  priority
                  sizes="100vw"
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Mobile Content */}
              <div className="bg-primary px-4 py-6">
                <div className="flex flex-col gap-4">
                  <BlurText
                    text="Pet Shop"
                    animateBy="words"
                    direction="top"
                    className="text-color font-bold text-3xl sm:text-4xl"
                  />

                  {/* Mobile short description */}
                  <p className="block sm:hidden text-color font-semibold text-xs max-w-sm">
                    Everything your pet needs, in one place.
                  </p>

                  {/* Desktop / tablet longer description */}
                  <BlurText
                    text="Whether it's a cat, dog, bird, fish, or reptile — we offer all the care and essential products your pets need."
                    animateBy="words"
                    direction="top"
                    className="hidden sm:block text-color font-semibold text-sm max-w-md"
                  />

                  <div className="flex flex-col gap-3">
                    {[
                      "Pet wellness and grooming",
                      "Best affordable pet accessories",
                    ].map((text, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="relative w-8 h-8 flex-shrink-0">
                          <Image
                            src="/banner-icon2.png"
                            alt="icon"
                            fill
                            sizes="32px"
                            className="object-contain"
                          />
                        </div>
                        <p className="text-color font-bold text-xs leading-tight">
                          {text}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Link href="/AllProduct" className="w-fit">
                    <Button
                      sx={{
                        width: "10rem",
                        height: "2.5rem",
                        borderRadius: "2rem",
                        bgcolor: "white",
                        fontWeight: 800,
                        fontSize: "0.9rem",
                        color: "#393E46",
                        transition: "transform 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.05)",
                        },
                        "&:active": {
                          transform: "scale(0.97)",
                        },
                      }}
                    >
                      Shop Now
                    </Button>
                  </Link>

                  {/* Scroll indicator */}
                  <div className="flex justify-center mt-6 animate-bounce">
                    <PetsIcon className="text-color opacity-70" />
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block relative h-full">
              <Image
                src="/Yellow Cute Pet Shop Banner (6).png"
                alt="Pet Shop Banner"
                fill
                priority
                sizes="100vw"
                className="object-cover object-center"
              />

              <div className="absolute inset-0 grid grid-cols-2 items-center px-20">
                <div />

                <div className="flex flex-col gap-10">
                  <BlurText
                    text="Pet Shop"
                    animateBy="words"
                    direction="top"
                    className="text-color font-bold text-6xl xl:text-7xl"
                  />

                  <BlurText
                    text="Whether it's a cat, dog, bird, fish, or reptile — we offer all the care and essential products your pets need."
                    animateBy="words"
                    direction="top"
                    className="text-color font-semibold text-lg max-w-md xl:max-w-xl"
                  />

                  <div className="flex flex-col gap-4">
                    {[
                      "Pet wellness and grooming",
                      "Best affordable pet accessories",
                      "Best quality organic pet food",
                    ].map((text, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="relative flex-shrink-0">
                          <Image
                            src="/banner-icon2.png"
                            alt="icon"
                            width={56}
                            height={56}
                            className="object-contain"
                          />
                        </div>
                        <p className="text-color font-bold text-lg">{text}</p>
                      </div>
                    ))}
                  </div>

                  <Link href="/AllProduct" className="w-fit">
                    <Button
                      sx={{
                        width: "18rem",
                        height: "3.5rem",
                        borderRadius: "2rem",
                        bgcolor: "white",
                        fontWeight: 800,
                        fontSize: "1.6rem",
                        color: "#393E46",
                        transition: "transform 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.05)",
                        },
                        "&:active": {
                          transform: "scale(0.97)",
                        },
                      }}
                    >
                      Shop Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      <FeaturedProducts />
      <NewArrivals />
      <Deals />
      <Footer />
    </div>
  );
};

export default Main;
