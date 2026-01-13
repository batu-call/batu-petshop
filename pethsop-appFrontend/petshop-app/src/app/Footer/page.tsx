"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FacebookIcon from "@mui/icons-material/Facebook";
import PhoneIcon from "@mui/icons-material/Phone";
import Lottie from "lottie-react";
import dogAnimation from "../../../public/animation/dog.json";
import catAnimation from "../../../public/animation/cat.json";
import birdAnimation from "../../../public/animation/bird.json";
import fishAnimation from "../../../public/animation/fish.json";
import reptileAnimation from "../../../public/animation/reptile.json";
import rabbitAnimation from "../../../public/animation/rabbit.json";
import horseAnimation from "../../../public/animation/horse.json";
import ballAnimation from "../../../public/animation/ball.json"
import Link from "next/link";
import { footerConfigs } from "./footerConfig";
import { usePathname } from "next/navigation";



const animalsMap = {
  dog: dogAnimation,
  cat: catAnimation,
  bird: birdAnimation,
  fish: fishAnimation,
  reptile: reptileAnimation,
  rabbit: rabbitAnimation,
  horse: horseAnimation,
};


const Footer = () => {
  const pathname = usePathname();

  const config = footerConfigs[pathname] || footerConfigs["/"]
  const ballRef = useRef(null);
  const animalRef = useRef(null);

  const animalAnimation =
  animalsMap[config.animal] || dogAnimation;

  useEffect(() => {
    const screenWidth = window.innerWidth;

    let ctx = gsap.context(() => {
      if (config.showBall && ballRef.current) {
        gsap.fromTo(
          ballRef.current,
          { x: screenWidth },
          {
            x: -200,
            duration: 10,
            ease: "linear",
            repeat: -1,
          }
        );
      }
      if (config.animalMoves && animalRef.current) {
        gsap.fromTo(
          animalRef.current,
          { x: screenWidth + 100 },
          {
            x: -400,
            duration: 14,
            ease: "linear",
            repeat: -1,
          }
        );
      }
    });

    return () => ctx.revert(); 
  }, [config]);


  return (
    <div className="md:ml-24 lg:ml-40">
      <div className="w-full flex relative overflow-hidden h-[200px] mb-4 border-b" 
      style={{backgroundColor:config.animal === "fish" ? "#eff6ff" : "transparent"}}>
        {/* Ball */}
        {config.showBall && (
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
      )}

        {/* Dog */}
        <div
          ref={animalRef}
          style={{            
            width : config.animal === "dog" ? 400 : 200,   
            height : config.animal === "dog" ? 400 : 200   
          }}
        >
          <Lottie animationData={animalAnimation} loop={true} />
        </div>
      </div>


      {/* Footer links */}
      <div className="lg:flex lg:flex-row flex flex-col space-y-2 w-full overflow-hidden p-2 lg:gap-20">
        <div className="h-10 sm:h-32 flex px-4 sm:px-20 lg:px-10 justify-center items-center">
          <ul className="flex gap-10 sm:gap-20 md:gap-15 lg:gap-16 xl:gap-30 2xl:gap-60 justify-center items-center text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-jost text-color font-bold">
            <Link href={"/AboutUs"}>
            <li className="transition duration-300 ease-in-out hover:scale-105">About Us</li>
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
        <div className="flex justify-center items-center gap-4">
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
