"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const menuItems = [
  { href: "/Cat", label: "Cat", icon: "/cat_7721779.png" },
  { href: "/Dog", label: "Dog", icon: "/dog.png" },
  { href: "/Bird", label: "Bird", icon: "/bird.png" },
  { href: "/Fish", label: "Fish", icon: "/fish.png" },
  { href: "/Reptile", label: "Reptile", icon: "/reptile.png" },
  { href: "/Rabbit", label: "Rabbit", icon: "/rabbit2.png" },
  { href: "/Horse", label: "Horse", icon: "/horse.png" },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:flex-col bg-white
      md:w-24 lg:w-40 z-40">

      {/* LOGO */}
      <div className="flex justify-center py-4 shrink-0">
        <Link href="/main">
          <Image
            src="/logo.png"
            alt="logo"
            width={160}
            height={160}
            className="w-16 md:w-20 lg:w-28 object-contain"
            priority
          />
        </Link>
      </div>

      {/* MENU */}
      <nav className="flex-1 overflow-y-auto px-2">
        <ul className="flex flex-col gap-3 py-4">
          {menuItems.map((item) => {
            const active = pathname === item.href;

            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <div
                    className={`flex items-center justify-center lg:justify-start
                    gap-3 px-3 py-2 rounded-2xl transition-all
                    ${active ? "bg-[#DDEEDD]" : "bg-primary"}
                    hover:bg-[#DDEEDD] hover:scale-105`}
                  >
                    <div className="relative w-6 h-6 lg:w-8 lg:h-8 shrink-0">
                      <Image
                        src={item.icon}
                        alt={item.label}
                        fill
                        className="object-contain"
                      />
                    </div>

                    <span className="hidden lg:block text-white text-lg font-semibold">
                      {item.label}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* CONTACT */}
      <div className="p-3 shrink-0">
        <Link href="/Contact">
          <div
            className={`flex justify-center lg:justify-start px-3 py-2 rounded-2xl
            transition-all hover:scale-105
            ${pathname === "/Contact" ? "bg-[#DDEEDD]" : "bg-primary"}`}
          >
            <span className="text-white text-lg font-semibold">
              Contact
            </span>
          </div>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
