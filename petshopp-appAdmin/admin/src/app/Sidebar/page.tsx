"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Logo from "./Logo";

const categories = [
  {
    slug: "Cat",
    label: "Cat",
    icon: "/cat_7721779.png",
    subCategories: ["Food", "Bed", "Toy", "Litter", "Accessory"],
  },
  {
    slug: "Dog",
    label: "Dog",
    icon: "/dog.png",
    subCategories: ["Food", "Bed", "Toy", "Leash", "Accessory"],
  },
  {
    slug: "Bird",
    label: "Bird",
    icon: "/bird.png",
    subCategories: ["Food", "Cage", "Toy", "Accessory"],
  },
  {
    slug: "Fish",
    label: "Fish",
    icon: "/fish.png",
    subCategories: ["Food", "Tank", "Filter", "Decoration"],
  },
  {
    slug: "Reptile",
    label: "Reptile",
    icon: "/reptile.png",
    subCategories: ["Food", "Habitat", "Lighting", "Accessory"],
  },
  {
    slug: "Rabbit",
    label: "Rabbit",
    icon: "/rabbit2.png",
    subCategories: ["Food", "Cage", "Toy", "Accessory"],
  },
  {
    slug: "Horse",
    label: "Horse",
    icon: "/horse.png",
    subCategories: ["Food", "Saddle", "Care", "Accessory"],
  },
];

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSub = searchParams.get("sub");

  const activeSlug =
    categories.find((c) => pathname.startsWith(`/category/${c.slug}`))?.slug ??
    null;

  const [openSlug, setOpenSlug] = useState<string | null>(activeSlug);
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const [hoveredSub, setHoveredSub] = useState<string | null>(null);
  const [contactHovered, setContactHovered] = useState(false);
  const [popupSlug, setPopupSlug] = useState<string | null>(null);
  const [popupTop, setPopupTop] = useState(0);
  const buttonRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const popupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setOpenSlug(activeSlug);
  }, [activeSlug]);

  useEffect(() => {
    if (!popupSlug) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopupSlug(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [popupSlug]);

  const handleLogoClick = () => {
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCatClick = (slug: string, href: string) => {
    const isTablet = window.innerWidth < 1024;

    if (isTablet) {
      const el = buttonRefs.current[slug];
      if (el) setPopupTop(el.getBoundingClientRect().top);
      setPopupSlug(popupSlug === slug ? null : slug);
      router.push(href);
    } else {
      if (openSlug === slug) {
        setOpenSlug(null);
      } else {
        setOpenSlug(slug);
        router.push(href);
      }
    }
  };

  return (
    <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:flex-col bg-white dark:bg-[#1a3d2a] md:w-24 lg:w-40 z-40">
      <div
        className="flex justify-center py-4 shrink-0 cursor-pointer"
        onClick={handleLogoClick}
      >
        <Logo />
      </div>

      <nav className="flex-1 overflow-y-auto px-2">
        <ul className="flex flex-col gap-3 py-4">
          {categories.map((cat) => {
            const href = `/category/${cat.slug}`;
            const active = pathname.startsWith(href);
            const isOpen = openSlug === cat.slug;
            const catHover = hoveredCat === cat.slug;

            return (
              <li
                key={cat.slug}
                ref={(el) => {
                  buttonRefs.current[cat.slug] = el;
                }}
              >
                <button
                  className="w-full text-left bg-transparent border-0 p-0 cursor-pointer"
                  onMouseEnter={() => setHoveredCat(cat.slug)}
                  onMouseLeave={() => setHoveredCat(null)}
                  onClick={() => handleCatClick(cat.slug, href)}
                >
                  <div
                    className={`flex items-center justify-center lg:justify-start
                      gap-3 px-3 py-2 rounded-2xl transition duration-300 ease-in-out
                      hover:scale-[1.05] active:scale-[0.97]
                      ${
                        active || catHover || popupSlug === cat.slug
                          ? "bg-[#DDEEDD] dark:bg-[#0b8457]"
                          : "bg-primary"
                      }`}
                  >
                    <div className="relative w-6 h-6 lg:w-8 lg:h-8 shrink-0">
                      <Image
                        src={cat.icon}
                        alt={cat.label}
                        fill
                        sizes="(min-width: 1024px) 32px, 24px"
                        className="object-contain"
                      />
                    </div>
                    <span
                      className={`hidden lg:block text-lg font-semibold transition duration-300
                        ${active || catHover ? "text-color2" : "text-white"}`}
                    >
                      {cat.label}
                    </span>
                  </div>
                </button>

                <div
                  className="hidden lg:block overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    maxHeight: isOpen
                      ? `${cat.subCategories.length * 36}px`
                      : "0px",
                  }}
                >
                  <ul className="flex flex-col gap-1 pt-1 pb-1 pl-2 pr-1">
                    {cat.subCategories.map((sub) => {
                      const subActive = active && activeSub === sub;
                      const subKey = `${cat.slug}-${sub}`;
                      const subHover = hoveredSub === subKey;

                      return (
                        <li key={sub}>
                          <button
                            onMouseEnter={() => setHoveredSub(subKey)}
                            onMouseLeave={() => setHoveredSub(null)}
                            onClick={() =>
                              router.push(`/category/${cat.slug}?sub=${sub}`)
                            }
                            className={`w-full flex items-center justify-between
                              px-3 py-[5px] rounded-xl
                              transition duration-200 ease-in-out
                              hover:scale-[1.03] active:scale-[0.97] cursor-pointer
                              ${
                                subActive || subHover
                                  ? "bg-[#DDEEDD] dark:bg-[#0b8457] opacity-100"
                                  : "bg-primary opacity-80"
                              }`}
                          >
                            <span
                              className={`text-sm font-semibold transition duration-200
                              ${subActive || subHover ? "text-color2" : "text-white"}`}
                            >
                              {sub}
                            </span>
                            <span
                              className={`text-[10px] font-bold transition duration-200
                              ${subActive || subHover ? "text-color2" : "text-white/60"}`}
                            >
                              ›
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 shrink-0">
        <Link href="/Contact">
          <div
            onMouseEnter={() => setContactHovered(true)}
            onMouseLeave={() => setContactHovered(false)}
            className={`flex justify-center lg:justify-start px-3 py-2 rounded-2xl
              transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97]
              ${
                pathname === "/Contact" || contactHovered
                  ? "bg-[#DDEEDD] dark:bg-[#0b8457]"
                  : "bg-primary dark:bg-primary"
              }`}
          >
            <span
              className={`text-lg font-semibold transition duration-300
              ${pathname === "/Contact" || contactHovered ? "text-color2" : "text-white"}`}
            >
              Contact
            </span>
          </div>
        </Link>
      </div>

      {/* ── TABLET FLOATING POPUP ── */}
      {popupSlug &&
        (() => {
          const cat = categories.find((c) => c.slug === popupSlug);
          if (!cat) return null;
          const active = pathname.startsWith(`/category/${cat.slug}`);

          return (
            <div
              ref={popupRef}
              className="lg:hidden fixed z-50"
              style={{ top: popupTop, left: "96px" }}
            >
              <div className="bg-white dark:bg-[#1a3d2a] rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden min-w-[160px]">
                <div
                  className={`flex items-center gap-2 px-4 py-3 font-bold text-sm
                border-b border-gray-100 dark:border-white/10
                ${
                  active
                    ? "bg-[#DDEEDD] dark:bg-[#0b8457] text-[#0b6e45] dark:text-white"
                    : "text-gray-700 dark:text-white"
                }`}
                >
                  <div className="relative w-5 h-5 shrink-0">
                    <Image
                      src={cat.icon}
                      alt={cat.label}
                      fill
                      className="object-contain"
                    />
                  </div>
                  {cat.label}
                </div>

                <div className="flex flex-col py-1">
                  {cat.subCategories.map((sub) => {
                    const subActive = active && activeSub === sub;
                    return (
                      <button
                        key={sub}
                        onClick={() => {
                          router.push(`/category/${cat.slug}?sub=${sub}`);
                          setPopupSlug(null);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium
                        transition duration-150 cursor-pointer text-left
                        ${
                          subActive
                            ? "bg-[#DDEEDD] dark:bg-[#0b8457]/60 text-[#0b6e45] dark:text-white font-semibold"
                            : "text-gray-600 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        <span
                          className={`w-[5px] h-[5px] rounded-full shrink-0
                        ${subActive ? "bg-[#0b8457]" : "bg-gray-300 dark:bg-white/20"}`}
                        />
                        {sub}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}
    </aside>
  );
};

export default Sidebar;
