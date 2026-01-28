"use client";
import React from "react";
import Image from "next/image";
import TextType from "@/components/TextType";

const Main = () => {
  return (
    <div className="w-full min-h-screen bg-primary overflow-hidden">
        {/* CONTENT */}
        <div className="relative lg:ml-10 px-4 lg:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-start lg:items-center mt-12 lg:mt-35">

            {/* LEFT TEXT */}
            <div className="font-bold lg:pr-10">
              <h1 className="text-3xl md:text-5xl lg:text-6xl">
                <TextType
                  text={["Welcome to your Admin Panel!"]}
                  typingSpeed={75}
                  pauseDuration={1500}
                  showCursor={true}
                  cursorCharacter=""
                />
              </h1>

              <h2 className="text-color text-4xl md:text-6xl lg:text-6xl xl:text-7xl mt-10">
                A <span className="text-white">fast</span> and{" "}
                <span className="text-white">secure</span>
              </h2>

              <h2 className="text-color text-4xl md:text-5xl lg:text-7xl xl:text-8xl mt-10">
                space to manage your site
              </h2>

              <h2 className="text-color text-4xl md:text-5xl lg:text-6xl xl:text-7xl mt-10">
                content, and users.
              </h2>
            </div>

            {/* RIGHT IMAGE */}
            <div className="flex justify-center lg:justify-end">
              <Image
                src="/main-banner-Photoroom.png"
                alt="main-banner"
                width={1400}
                height={900}
                priority
                className="
                  object-contain
                  w-full
                  max-w-md
                  md:max-w-xl
                  lg:max-w-[1100px]
                "
              />
            </div>

          </div>
        </div>
    </div>
  );
};

export default Main;
