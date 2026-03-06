"use client";

import RotatingText from "@/components/RotatingText";
import { CATEGORY_TITLES, ROTATING_TEXTS } from "./navbarTypes";

type Props = {
  pageTitle: string | undefined;
  filterTitleRef: React.RefObject<HTMLDivElement | null>;
};

const NavbarTitle = ({ pageTitle, filterTitleRef }: Props) => {
  if (!pageTitle) return <div className="hidden md:block" />;

  const rotatingTexts = ROTATING_TEXTS[pageTitle];
  const isCategoryPage = CATEGORY_TITLES.includes(pageTitle);

  return (
    <div className="hidden md:flex ml-7">
      <div className="relative flex items-center gap-3" ref={filterTitleRef}>
        <h1 className="text-xl sm:text-xl font-bold mb-4 text-white flex items-center mt-4">
          {pageTitle}
        </h1>

        {isCategoryPage && rotatingTexts && (
          <RotatingText
            texts={rotatingTexts}
            mainClassName="hidden xl:block px-4 sm:px-6 md:px-8 py-1 sm:py-2 md:py-3 rounded-lg text-white font-bold text-lg sm:text-xl md:text-2xl bg-gradient-to-r from-[#97cba9] via-[#79bfa1] to-[#57b394] overflow-hidden flex justify-center items-center"
            staggerFrom="last"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-120%" }}
            staggerDuration={0.05}
            splitLevelClassName="overflow-hidden"
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            rotationInterval={3000}
          />
        )}
      </div>
    </div>
  );
};

export default NavbarTitle;