"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";


const Sidebar = () => {
  
  const pathname = usePathname();



  return (
    <div>
      <div className="w-40 h-screen bg-white hidden md:block fixed">
        {/* Cat */}
        <Link href={"/Cat"}>
          <div className={`group inline-block p-2 items-center mt-24 ml-3 rounded-2xl w-35 hover:bg-[#DDEEDD] transition duration-300 ease-in-out hover:scale-105 ${pathname === "/Cat" ? "bg-[#DDEEDD]" : "bg-primary"}`}>
            <div className={`flex gap-9 items-center justify-center transition-colors duration-400 ${pathname === "/Cat" ? "bg-[#DDEEDD]" : "bg-primary"} group-hover:bg-[#DDEEDD]`}>
              <Image src="/cat_7721779.png" alt='cat-image' height={40} width={40} />
              <h2 className='text-2xl text-jost text-white p-1'>Cat</h2>
            </div>
          </div>
        </Link>

        {/* Dog */}
        <Link href={"/Dog"}>
          <div className={`group inline-block p-2 items-center mt-6 ml-3 rounded-2xl w-35 hover:bg-[#DDEEDD] transition duration-300 ease-in-out hover:scale-105 ${pathname === "/Dog" ? "bg-[#DDEEDD]" : "bg-primary"}`}>
            <div className={`flex gap-9 items-center justify-center transition-colors duration-400 ${pathname === "/Dog" ? "bg-[#DDEEDD]" : "bg-primary"} group-hover:bg-[#DDEEDD]`}>
              <Image src="/dog.png" alt='dog-image' height={40} width={40} />
              <h2 className='text-2xl text-jost text-white p-1'>Dog</h2>
            </div>
          </div>
        </Link>

        {/* Bird */}
        <Link href={"/Bird"}>
          <div className={`group inline-block p-2 items-center mt-6 ml-3 rounded-2xl w-35 hover:bg-[#DDEEDD] transition duration-300 ease-in-out hover:scale-105 ${pathname === "/Bird" ? "bg-[#DDEEDD]" : "bg-primary"}`}>
            <div className={`flex gap-9 items-center justify-center transition-colors duration-400 ${pathname === "/Bird" ? "bg-[#DDEEDD]" : "bg-primary"} group-hover:bg-[#DDEEDD]`}>
              <Image src="/bird.png" alt='bird-image' height={40} width={40} />
              <h2 className='text-2xl text-jost text-white p-1'>Bird</h2>
            </div>
          </div>
        </Link>

        {/* Fish */}
        <Link href={"/Fish"}>
          <div className={`group inline-block p-2 items-center mt-6 ml-3 rounded-2xl w-35 hover:bg-[#DDEEDD] transition duration-300 ease-in-out hover:scale-105 ${pathname === "/Fish" ? "bg-[#DDEEDD]" : "bg-primary"}`}>
            <div className={`flex gap-9 items-center justify-center transition-colors duration-400 ${pathname === "/Fish" ? "bg-[#DDEEDD]" : "bg-primary"} group-hover:bg-[#DDEEDD]`}>
              <Image src="/fish.png" alt='fish-image' height={40} width={40} />
              <h2 className='text-2xl text-jost text-white p-1'>Fish</h2>
            </div>
          </div>
        </Link>

        {/* Reptile */}
        <Link href={"/Reptile"}>
          <div className={`group inline-block p-2 items-center mt-6 ml-3 rounded-2xl w-35 hover:bg-[#DDEEDD] transition duration-300 ease-in-out hover:scale-105 ${pathname === "/Reptile" ? "bg-[#DDEEDD]" : "bg-primary"}`}>
            <div className={`flex gap-3 items-center justify-center transition-colors duration-400 ${pathname === "/Reptile" ? "bg-[#DDEEDD]" : "bg-primary"} group-hover:bg-[#DDEEDD]`}>
              <Image src="/reptile.png" alt='reptile-image' height={40} width={40} />
              <h2 className='text-2xl text-jost text-white mr-2'>Reptile</h2>
            </div>
          </div>
        </Link>

        {/* Rabbit */}
        <Link href={"/Rabbit"}>
          <div className={`group inline-block p-2 items-center mt-6 ml-3 rounded-2xl w-35 hover:bg-[#DDEEDD] transition duration-300 ease-in-out hover:scale-105 ${pathname === "/Rabbit" ? "bg-[#DDEEDD]" : "bg-primary"}`}>
            <div className={`flex gap-3 items-center justify-center transition-colors duration-400 ${pathname === "/Rabbit" ? "bg-[#DDEEDD]" : "bg-primary"} group-hover:bg-[#DDEEDD]`}>
              <Image src="/rabbit2.png" alt='rabbit-image' height={40} width={40} />
              <h2 className='text-2xl text-jost text-white p-1'>Rabbit</h2>
            </div>
          </div>
        </Link>

        {/* Horse */}
        <Link href={"/Horse"}>
          <div className={`group inline-block p-2 items-center mt-6 ml-3 rounded-2xl w-35 hover:bg-[#DDEEDD] transition duration-300 ease-in-out hover:scale-105 ${pathname === "/Horse" ? "bg-[#DDEEDD]" : "bg-primary"}`}>
            <div className={`flex gap-3 items-center justify-center transition-colors duration-400 ${pathname === "/Horse" ? "bg-[#DDEEDD]" : "bg-primary"} group-hover:bg-[#DDEEDD]`}>
              <Image src="/horse.png" alt='horse-image' height={40} width={40} />
              <h2 className='text-2xl text-jost text-white p-1'>Horse</h2>
            </div>
          </div>
        </Link>

        {/* Contact */}
        <Link href={"/Contact"}>
          <div className={`group inline-block p-2 items-center mt-6 ml-3 rounded-2xl w-35 hover:bg-[#DDEEDD] transition duration-300 ease-in-out hover:scale-105 ${pathname === "/Contact" ? "bg-[#DDEEDD]" : "bg-primary"}`}>
            <div className={`flex gap-3 items-center justify-center transition-colors duration-400 ${pathname === "/Contact" ? "bg-[#DDEEDD]" : "bg-primary"} group-hover:bg-[#DDEEDD]`}>
              <h2 className='text-2xl text-jost text-white p-1'>Contact</h2>
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
};

export default Sidebar;
