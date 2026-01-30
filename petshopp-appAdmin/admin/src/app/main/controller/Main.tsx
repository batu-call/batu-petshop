"use client";
import React from "react";
import Image from "next/image";
import TextType from "@/components/TextType";

const Main = () => {
  return (
    <div className="w-full h-full bg-primary overflow-hidden flex items-center">
      {/* CONTENT CONTAINER */}
      <div className="container mx-auto px-4 lg:px-8 xl:px-12 py-8 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
          
          {/* LEFT TEXT */}
          <div className="font-bold space-y-6 lg:space-y-8 order-2 lg:order-1">
            {/* Animated Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl leading-tight">
              <TextType
                text={["Welcome to your Admin Panel!"]}
                typingSpeed={75}
                pauseDuration={1500}
                showCursor={true}
                cursorCharacter=""
              />
            </h1>

            {/* Subtitle Lines */}
            <div className="space-y-4 lg:space-y-6">
              <h2 className="text-color text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight">
                A <span className="text-white">fast</span> and{" "}
                <span className="text-white">secure</span>
              </h2>

              <h2 className="text-color text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight">
                space to manage your site
              </h2>

              <h2 className="text-color text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight">
                content, and users.
              </h2>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="flex justify-center lg:justify-end order-1 lg:order-2">
            <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl">
              <Image
                src="/main-banner-Photoroom.png"
                alt="main-banner"
                width={1400}
                height={900}
                priority
                className="w-full h-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Main;