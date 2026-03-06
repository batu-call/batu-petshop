"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@mui/material";
import BlurText from "@/components/BlurText";
import CircularText from "@/components/CircularText";
import PetsIcon from "@mui/icons-material/Pets";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import axios from "axios";


const FeaturedProducts = dynamic(() => import("../FeaturedProducts/page"), { ssr: false });
const NewArrivals = dynamic(() => import("../NewArrivals/page"), { ssr: false });
const Deals = dynamic(() => import("../Deals/page"), { ssr: false });
const Footer = dynamic(() => import("../Footer/page"), { ssr: false });

type ReviewStats = { [productId: string]: { count: number; avgRating: number } };

const Main = () => {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({});
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const mobileBanner = "/mobil_banner1.webp";
  const desktopBanner = "/banner_transparent (1).webp";

  useEffect(() => {
    if (!mounted) return;
    const isMobile = window.innerWidth < 1024;
    const src = isMobile ? mobileBanner : desktopBanner;
    const img = new window.Image();
    img.onload = () => setLoading(false);
    img.onerror = () => setLoading(false);
    img.src = src;
  }, [mounted, mobileBanner, desktopBanner]);


  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/stats`)
      .then((r) => setReviewStats(r.data.stats))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {loading ? (
        <div className="md:ml-24 lg:ml-40 fixed inset-0 flex items-center justify-center bg-primary z-50">
          <CircularText text="LOADING" spinDuration={20} className="text-white text-4xl" />
        </div>
      ) : (
        <main className="bg-primary dark:bg-[#0d1f18] pb-8 lg:pb-16">
          <section className="relative w-full lg:h-[calc(100vh-64px)]">

            {/* Mobile Layout */}
            <div className="lg:hidden">
              <div className="w-full h-auto">
                <Image
                  src={mobileBanner}
                  alt="Pet Shop Banner Mobile"
                  width={1080}
                  height={500}
                  priority
                  quality={95}
                  sizes="100vw"
                  className="w-full h-auto object-cover"
                />
              </div>

              <div className="bg-primary dark:bg-[#0d1f18] px-4 py-6">
                <div className="flex flex-col gap-4">
                  <BlurText
                    text="Pet Shop"
                    animateBy="words"
                    direction="top"
                    className="text-color font-bold text-3xl sm:text-4xl"
                  />
                  <p className="block sm:hidden text-color font-semibold text-xs max-w-sm">
                    Everything your pet needs, in one place.
                  </p>
                  <BlurText
                    text="Whether it's a cat, dog, bird, fish, or reptile — we offer all the care and essential products your pets need."
                    animateBy="words"
                    direction="top"
                    className="hidden sm:block text-color font-semibold text-sm max-w-md"
                  />
                  <div className="flex flex-col gap-3">
                    {["Pet wellness and grooming", "Best affordable pet accessories"].map((text, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="relative w-8 h-8 flex-shrink-0">
                          <Image src="/banner-icon2.png" alt="icon" fill sizes="32px" className="object-contain" />
                        </div>
                        <p className="text-color font-bold text-xs leading-tight">{text}</p>
                      </div>
                    ))}
                  </div>
                  <Link href="/AllProduct" className="w-fit">
                    <Button
                      sx={{
                        width: "10rem",
                        height: "2.5rem",
                        borderRadius: "2rem",
                        bgcolor: isDark ? "#1e3d2a" : "white",
                        fontWeight: 800,
                        fontSize: "0.9rem",
                        color: isDark ? "#c8e6d0" : "#393E46",
                        transition: "transform 0.3s ease",
                        "&:hover": { transform: "scale(1.05)", bgcolor: isDark ? "#2d5a3d" : "#f5f5f5" },
                        "&:active": { transform: "scale(0.97)" },
                      }}
                    >
                      Shop Now
                    </Button>
                  </Link>
                  <div className="flex justify-center mt-6 animate-bounce">
                    <PetsIcon className="text-color opacity-70" />
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block relative h-full">
              <Image
                src={desktopBanner}
                alt="Pet Shop Banner"
                fill
                priority
                quality={95}
                sizes="(min-width: 1280px) calc(100vw - 10rem), (min-width: 768px) calc(100vw - 6rem), 100vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 grid grid-cols-2 items-center px-20 z-10">
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
                          <Image src="/banner-icon2.png" alt="icon" width={56} height={56} className="object-contain" />
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
                        bgcolor: isDark ? "#1e3d2a" : "white",
                        fontWeight: 800,
                        fontSize: "1.6rem",
                        color: isDark ? "#c8e6d0" : "#393E46",
                        transition: "transform 0.3s ease",
                        "&:hover": { transform: "scale(1.05)", bgcolor: isDark ? "#2d5a3d" : "#f5f5f5" },
                        "&:active": { transform: "scale(0.97)" },
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

      <FeaturedProducts reviewStats={reviewStats} />
      <NewArrivals reviewStats={reviewStats} />
      <Deals reviewStats={reviewStats} />
      <Footer />
    </div>
  );
};

export default Main;