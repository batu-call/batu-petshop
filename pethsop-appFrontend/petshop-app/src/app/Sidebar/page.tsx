"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="hidden md:block absolute top-0">
      <div className="md:w-24 lg:w-40 h-screen bg-white fixed">
        <div className="mt-0">
        {/* Logo */}
        <Link href="/main" className="md:fixed">
          <Image
            src="/logo.png"
            alt="main-icon"
            width={500}
            height={500}
            className="hidden md:flex justify-center items-center w-16 h-16 sm:h-24 sm:w-24 md:w-24 md:h-24 lg:w-40 lg:h-40"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
        </div>

        {/* Cat */}
        <Link href={"/Cat"}>
          <div
            className={`group inline-block p-2 items-center md:mt-28 lg:mt-54 ml-3 rounded-2xl md:w-20 lg:w-36 hover:bg-[#DDEEDD] transition duration-300 ease-in-out hover:scale-105 ${
              pathname === "/Cat" ? "bg-[#DDEEDD]" : "bg-primary"
            }`}
          >
            <div
              className={`flex gap-2 lg:gap-9 items-center justify-center transition-colors duration-400 ${
                pathname === "/Cat" ? "bg-[#DDEEDD]" : "bg-primary"
              } group-hover:bg-[#DDEEDD]`}
            >
              <div className="relative md:w-7 md:h-7 lg:w-10 lg:h-10">
                <Image
                  src="/cat_7721779.png"
                  alt="cat-image"
                  fill
                  sizes="(max-width: 768px) 48px, (max-width: 1024px) 40px, 64px"
                  className="object-contain"
                />
              </div>
              <h2 className="text-md lg:text-2xl text-jost text-white p-1">
                Cat
              </h2>
            </div>
          </div>
        </Link>

        {/* Dog */}
        <Link href={"/Dog"}>
          <div
            className={`group inline-block p-2 items-center mt-6 ml-3 rounded-2xl md:w-20 lg:w-36 hover:bg-[#DDEEDD] transition duration-300 ease-in-out hover:scale-105 ${
              pathname === "/Dog" ? "bg-[#DDEEDD]" : "bg-primary"
            }`}
          >
            <div
              className={`flex gap-2 lg:gap-9 items-center justify-center transition-colors duration-400 ${
                pathname === "/Dog" ? "bg-[#DDEEDD]" : "bg-primary"
              } group-hover:bg-[#DDEEDD]`}
            >
              <div className="relative md:w-7 md:h-7 lg:w-10 lg:h-10">
                <Image
                  src="/dog.png"
                  alt="dog-image"
                  fill
                  sizes="(max-width: 768px) 48px, (max-width: 1024px) 40px, 64px"
                  className="object-contain"
                />
              </div>
              <h2 className="text-md lg:text-2xl text-jost text-white p-1">
                Dog
              </h2>
            </div>
          </div>
        </Link>

        {/* Bird */}
        <Link href={"/Bird"}>
          <div
            className={`group inline-block p-2 items-center mt-6 ml-3 rounded-2xl md:w-20 lg:w-36 hover:bg-[#DDEEDD] transition duration-300 ease-in-out hover:scale-105 ${
              pathname === "/Bird" ? "bg-[#DDEEDD]" : "bg-primary"
            }`}
          >
            <div
              className={`flex gap-2 lg:gap-9 items-center justify-center transition-colors duration-400 ${
                pathname === "/Bird" ? "bg-[#DDEEDD]" : "bg-primary"
              } group-hover:bg-[#DDEEDD]`}
            >
              <div className="relative md:w-7 md:h-7 lg:w-10 lg:h-10">
                <Image
                  src="/bird.png"
                  alt="bird-image"
                  fill
                  sizes="(max-width: 768px) 48px, (max-width: 1024px) 40px, 64px"
                  className="object-contain"
                />
              </div>
              <h2 className="text-md lg:text-2xl text-white p-1">Bird</h2>
            </div>
          </div>
        </Link>

        {/* Fish */}
        <Link href={"/Fish"}>
          <div
            className={`group inline-block p-2 items-center mt-6 ml-3 rounded-2xl md:w-20 lg:w-36 hover:bg-[#DDEEDD] transition duration-300 ease-in-out hover:scale-105 ${
              pathname === "/Fish" ? "bg-[#DDEEDD]" : "bg-primary"
            }`}
          >
            <div
              className={`flex gap-2 lg:gap-9 items-center justify-center transition-colors duration-400 ${
                pathname === "/Fish" ? "bg-[#DDEEDD]" : "bg-primary"
              } group-hover:bg-[#DDEEDD]`}
            >
              <div className="relative md:w-7 md:h-7 lg:w-10 lg:h-10">
                <Image
                  src="/fish.png"
                  alt="fish-image"
                  fill
                  sizes="(max-width: 768px) 48px, (max-width: 1024px) 40px, 64px"
                />
              </div>
              <h2 className="text-md lg:text-2xl text-jost text-white p-1">
                Fish
              </h2>
            </div>
          </div>
        </Link>

        {/* Reptile */}
        <Link href={"/Reptile"}>
          <div
            className={`group inline-block p-2 items-center mt-6 ml-3 rounded-2xl md:w-20 lg:w-36 hover:bg-[#DDEEDD] transition duration-300 ease-in-out hover:scale-105 ${
              pathname === "/Reptile" ? "bg-[#DDEEDD]" : "bg-primary"
            }`}
          >
            <div
              className={`flex md:gap-1 lg:gap-3 items-center justify-center transition-colors duration-400 ${
                pathname === "/Reptile" ? "bg-[#DDEEDD]" : "bg-primary"
              } group-hover:bg-[#DDEEDD]`}
            >
              <div className="relative md:w-7 md:h-7 lg:w-10 lg:h-10">
                <Image
                  src="/reptile.png"
                  alt="reptile-image"
                  fill
                  sizes="(max-width: 768px) 48px, (max-width: 1024px) 40px, 64px"
                  className="object-contain"
                />
              </div>
              <h2 className="text-[13px] lg:text-2xl text-jost text-white mr-2">
                Reptile
              </h2>
            </div>
          </div>
        </Link>

        {/* Rabbit */}
        <Link href={"/Rabbit"}>
          <div
            className={`group inline-block p-2 items-center mt-6 ml-3 rounded-2xl md:w-20 lg:w-36 hover:bg-[#DDEEDD] transition duration-300 ease-in-out hover:scale-105 ${
              pathname === "/Rabbit" ? "bg-[#DDEEDD]" : "bg-primary"
            }`}
          >
            <div
              className={`flex md:gap-2 lg:gap-3 items-center justify-center transition-colors duration-400 ${
                pathname === "/Rabbit" ? "bg-[#DDEEDD]" : "bg-primary"
              } group-hover:bg-[#DDEEDD]`}
            >
              <div className="relative md:w-7 md:h-7 lg:w-10 lg:h-10">
                <Image
                  src="/rabbit2.png"
                  alt="rabbit-image"
                  fill
                  sizes="(max-width: 768px) 48px, (max-width: 1024px) 40px, 64px"
                  className="object-contain"
                />
              </div>
              <h2 className="text-[12px] lg:text-2xl text-jost text-white p-1">
                Rabbit
              </h2>
            </div>
          </div>
        </Link>

        {/* Horse */}
        <Link href={"/Horse"}>
          <div
            className={`group inline-block p-2 items-center mt-6 ml-3 rounded-2xl md:w-20 lg:w-36 hover:bg-[#DDEEDD] transition duration-300 ease-in-out hover:scale-105 ${
              pathname === "/Horse" ? "bg-[#DDEEDD]" : "bg-primary"
            }`}
          >
            <div
              className={`flex lg:gap-3 items-center justify-center transition-colors duration-400 ${
                pathname === "/Horse" ? "bg-[#DDEEDD]" : "bg-primary"
              } group-hover:bg-[#DDEEDD]`}
            >
              <div className="relative md:w-7 md:h-7 lg:w-10 lg:h-10">
                <Image
                  src="/horse.png"
                  alt="horse-image"
                  fill
                  sizes="(max-width: 768px) 48px, (max-width: 1024px) 40px, 64px"
                  className="object-contain"
                />
              </div>
              <h2 className="text-[12px] lg:text-2xl text-jost text-white p-1">
                Horse
              </h2>
            </div>
          </div>
        </Link>

        {/* Contact */}
        <Link href={"/Contact"}>
          <div
            className={`group inline-block p-2 items-center mt-6 ml-3 rounded-2xl md:w-20 lg:w-36 hover:bg-[#DDEEDD] transition duration-300 ease-in-out hover:scale-105 ${
              pathname === "/Contact" ? "bg-[#DDEEDD]" : "bg-primary"
            }`}
          >
            <div
              className={`flex md:gap-2 lg:gap-3 items-center justify-center transition-colors duration-400 ${
                pathname === "/Contact" ? "bg-[#DDEEDD]" : "bg-primary"
              } group-hover:bg-[#DDEEDD]`}
            >
              <h2 className="text-md lg:text-2xl text-white p-1">Contact</h2>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
