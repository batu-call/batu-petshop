"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FacebookIcon from "@mui/icons-material/Facebook";
import PhoneIcon from "@mui/icons-material/Phone";
import Lottie from "lottie-react";
import dogAnimation from "../../../public/animation/Cute Doggie.json";
import ballAnimation from "../../../public/animation/Tennis Ball.json"
import Link from "next/link";


const Footer = () => {
  const ballRef = useRef(null);
  const dogRef = useRef(null);

  useEffect(() => {
    const animate = () => {
      if (!ballRef.current || !dogRef.current) return;
      const screenWidth = window.innerWidth;
      const center = screenWidth / 2;

     
      gsap.fromTo(
        ballRef.current,
        { x: center },
        {
          x: -200,
          duration: 10,
          ease: "linear",
          onComplete: animate,
        }
      );

      // Ball rotation
      gsap.to(ballRef.current, {
        duration: 15,
        ease: "linear",
        repeat: -1,
      });

      // Dog movement
      gsap.fromTo(
        dogRef.current,
        { x: center + 50 },
        {
          x: -500,
          duration: 15,
          ease: "linear",
        }
      );
    };

    animate();
  }, []);

  return (
    <div className="md:ml-24 lg:ml-40">
      <div className="w-full flex relative overflow-hidden h-[200px] mb-4 border-b">
        {/* Ball */}
        <div
          ref={ballRef}
          style={{
            width: 200,
            height: 200,
            position: "absolute",
            bottom: 0,
            display: "flex",
            justifyItems: "center",
            alignItems: "center",
          }}
        >
          <Lottie animationData={ballAnimation} loop={true} />
        </div>

        {/* Dog */}
        <div
          ref={dogRef}
          style={{
            width: 400,
            height: 400,          
          }}
        >
          <Lottie animationData={dogAnimation} loop={true} />
        </div>
      </div>


      {/* Footer links */}
      <div className="lg:flex lg:flex-row flex flex-col space-y-2 w-full overflow-hidden p-2">
        <div className="h-10 sm:h-32 flex px-4 sm:px-20 lg:px-10">
          <ul className="flex gap-10 sm:gap-20 md:gap-15 lg:gap-16 xl:gap-30 2xl:gap-60 justify-center items-center text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-jost text-color font-bold">
            <Link href={"/Contact"}>
            <li className="transition duration-300 ease-in-out hover:scale-105">About</li>
            </Link>
            <Link href={"/Contact"}>
            <li className="transition duration-300 ease-in-out hover:scale-105">Customer Service</li>
            </Link>
            <Link href={"/AllProduct"}>
            <li className="transition duration-300 ease-in-out hover:scale-105">Shop</li>
            </Link>
            <Link href={"/my-profile"}>
            <li className="transition duration-300 ease-in-out hover:scale-105">Account</li>
            </Link>
          </ul>
        </div>
        <div className="flex gap-4 ml-4 sm:ml-24 md:ml-20 lg:ml-7 xl:ml-24">
          <div className="flex gap-7 md:gap-17 lg:gap-[16px] items-center">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <InstagramIcon fontSize="large" style={{ color: "#E1306C" }} className="transition duration-300 ease-in-out hover:scale-105"/>
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer">
              <XIcon fontSize="large" style={{ color: "black" }} className="transition duration-300 ease-in-out hover:scale-105" />
            </a>
            <a href="https://wa.me/905555555555" target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon fontSize="large" style={{ color: "#25D366" }} className="transition duration-300 ease-in-out hover:scale-105"/>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FacebookIcon fontSize="large" style={{ color: "#1877F2" }} className="transition duration-300 ease-in-out hover:scale-105"/>
            </a>
            <a href="tel:+905555555555">
              <PhoneIcon fontSize="large" style={{ color: "#333" }} className="transition duration-300 ease-in-out hover:scale-105"/>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
