"use client";
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import dynamic from "next/dynamic";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FacebookIcon from "@mui/icons-material/Facebook";
import PhoneIcon from "@mui/icons-material/Phone";
import Link from "next/link";
import { footerConfigs } from "./footerConfig";
import { usePathname } from "next/navigation";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const animationPaths: Record<string, string> = {
  dog: "/animation/dog.json",
  cat: "/animation/cat.json",
  bird: "/animation/bird.json",
  fish: "/animation/fish.json",
  reptile: "/animation/reptile.json",
  rabbit: "/animation/Conejo.json",
  horse: "/animation/horse.json",
};

const Footer = () => {
  const pathname = usePathname();
  const config = footerConfigs[pathname] || footerConfigs["/"];
  const ballRef = useRef(null);
  const animalRef = useRef(null);

  const [animalData, setAnimalData] = useState<object | null>(null);
  const [ballData, setBallData] = useState<object | null>(null);

  useEffect(() => {
    const path = animationPaths[config.animal];
    if (!path) return;
    fetch(path)
      .then((r) => r.json())
      .then(setAnimalData)
      .catch(() => {});
  }, [config.animal]);

  useEffect(() => {
    if (!config.showBall) return;
    fetch("/animation/ball.json")
      .then((r) => r.json())
      .then(setBallData)
      .catch(() => {});
  }, [config.showBall]);

  useEffect(() => {
    if (!animalData) return;

    const screenWidth = window.innerWidth;
    const isMobile = screenWidth < 768;
    const ballWidth = 200;
    const animalWidth = config.animal === "dog" ? 400 : 200;
    const startX = screenWidth + 50;
    const endX = -Math.max(ballWidth, animalWidth) - 100;
    const isDogWithBall = config.animal === "dog" && config.showBall;

    const ctx = gsap.context(() => {
      if (isDogWithBall && config.animalMoves && ballData) {
        const lead = isMobile ? 60 : 120;
        const tl = gsap.timeline({
          repeat: -1,
          defaults: { ease: "linear", duration: isMobile ? 22 : 18 },
        });
        tl.fromTo(ballRef.current, { x: startX }, { x: endX }, 0)
          .fromTo(animalRef.current, { x: startX + lead }, { x: endX + lead }, 0);
      }

      if (!isDogWithBall && config.animalMoves && animalRef.current) {
        gsap.fromTo(animalRef.current, { x: startX }, {
          x: endX,
          duration: isMobile ? 20 : 16,
          ease: "linear",
          repeat: -1,
        });
      }
    });

    return () => ctx.revert();
  }, [config, animalData, ballData]);

  return (
    <div>
      <div
        className="w-full flex relative overflow-hidden h-[200px] mb-4 border-b"
        style={{ backgroundColor: config.animal === "fish" ? "#eff6ff" : "transparent" }}
      >
        {config.showBall && ballData && (
          <div
            ref={ballRef}
            style={{
              width: 200, height: 200,
              position: "absolute", bottom: 0,
              display: "flex", justifyItems: "center", alignItems: "center",
            }}
          >
            <Lottie animationData={ballData} loop={true} />
          </div>
        )}

        <div
          ref={animalRef}
          style={{
            width: config.animal === "dog" ? 400 : 200,
            height: config.animal === "dog" ? 400 : 200,
          }}
        >
          {animalData && <Lottie animationData={animalData} loop={true} />}
        </div>
      </div>

      <div className="lg:flex lg:flex-row flex flex-col space-y-2 w-full overflow-hidden p-2 justify-between">
        <div className="h-10 sm:h-32 flex px-2 sm:px-20 lg:px-10 justify-center items-center">
          <ul className="flex gap-4 sm:gap-8 md:gap-15 lg:gap-12 xl:gap-30 2xl:gap-52 justify-center items-center text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-jost text-color dark:text-[#0b8457]! font-bold">
            <Link href="/AboutUs">
              <li className="transition duration-300 ease-in-out hover:scale-105">About Us</li>
            </Link>
            <Link href="/Contact">
              <li className="transition duration-300 ease-in-out hover:scale-105">Customer Service</li>
            </Link>
            <Link href="/AllProduct">
              <li className="transition duration-300 ease-in-out hover:scale-105">Shop</li>
            </Link>
            <Link href="/my-profile">
              <li className="transition duration-300 ease-in-out hover:scale-105">Account</li>
            </Link>
          </ul>
        </div>
        <div className="flex justify-center items-center gap-4 lg:pr-20">
          <div className="flex gap-7 md:gap-17 lg:gap-4 items-center">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <InstagramIcon fontSize="large" style={{ color: "#E1306C" }} className="transition duration-300 ease-in-out hover:scale-105" />
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer">
              <XIcon fontSize="large" style={{ color: "black" }} className="transition duration-300 ease-in-out hover:scale-105" />
            </a>
            <a href="https://wa.me/905555555555" target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon fontSize="large" style={{ color: "#25D366" }} className="transition duration-300 ease-in-out hover:scale-105" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FacebookIcon fontSize="large" style={{ color: "#1877F2" }} className="transition duration-300 ease-in-out hover:scale-105" />
            </a>
            <a href="tel:+905555555555">
              <PhoneIcon fontSize="large" style={{ color: "#333" }} className="transition duration-300 ease-in-out hover:scale-105" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;