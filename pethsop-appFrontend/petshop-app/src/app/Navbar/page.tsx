"use client";

import React from "react";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileMenu from "@/app/components/mobile";

import { NavbarProps } from "./components/navbarTypes";
import { useNavbar } from "./components/useNavbar";
import NavbarTitle from "./components/NavbarTitle";
import NavbarSearch from "./components/NavbarSearch";
import NavbarFilterDropdown from "./components/NavbarFilterDropdown";
import NavbarUserActions from "./components/NavbarUserActions";

const Navbar: React.FC<NavbarProps> = ({
  showFilters,
  setShowFilters,
  priceRange,
  setPriceRange,
  tempPriceRange,
  setTempPriceRange,
  priceStats,
  sortBy,
  setSortBy,
  showOnSale,
  setShowOnSale,
  minRating,
  setMinRating,
  hasActiveFilters,
  clearAllFilters,
  handlePriceChange,
  handlePriceChangeCommitted,
}) => {
  const {
    isFilterablePage,
    pageTitle,
    searchQuery,
    searchResults,
    loading,
    handleEnterSearch,
    isSearchFocused,
    setIsSearchFocused,
    setSearchQuery,
    setSearchResults,
    searchRef,
    filterButtonRef,
    filterTitleRef,
    filterDropdownRef,
    
    handleLogout,
    handleSearch,
    handleMinPriceInputChange,
    handleMaxPriceInputChange,
    applyManualPriceInput,
  } = useNavbar(
    showFilters,
    setShowFilters,
    tempPriceRange,
    setTempPriceRange,
    setPriceRange,
    handlePriceChangeCommitted,
  );

  return (
    <div
      className={`
         w-full opacity-95 lg:opacity-100 sticky md:relative top-0 z-50
        ${isFilterablePage
          ? ""
          : "fixed top-0 md:ml-24 lg:ml-40 md:w-[calc(100%-6rem)] lg:w-[calc(100%-10rem)]"
        }
      `}
    >
      <div className="w-full h-14 sm:h-16 lg:h-18 bg-primary relative flex items-center justify-between">

        <div className="md:hidden flex items-center justify-center">
          <MobileMenu anchor="left" />
        </div>

        <NavbarTitle
          pageTitle={pageTitle}
          filterTitleRef={filterTitleRef}
        />

        <div className="flex items-center gap-2 mr-1 lg:gap-5 lg:mr-2">

          {isFilterablePage && setShowFilters && hasActiveFilters && (
            <div className="relative hidden md:block" ref={filterButtonRef}>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                className={`
                  transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] cursor-pointer
                  ${showFilters
                    ? "bg-white dark:bg-white/15 dark:border dark:border-white/40 text-color dark:text-white hover:bg-[#D6EED6] dark:hover:bg-white/25"
                    : "bg-[#D6EED6] dark:bg-white/10 dark:border dark:border-white/30 hover:bg-white dark:hover:bg-white/20 text-color dark:text-white"
                  }
                `}
              >
                <p className="text-color">Filter</p>
                <Filter size={16} className="text-color" />
                {hasActiveFilters() && (
                  <span className="bg-secondary dark:bg-white/20 text-primary dark:text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
                    !
                  </span>
                )}
                {showFilters
                  ? <ChevronUp size={14} className="text-color dark:text-white transition-all" />
                  : <ChevronDown size={14} className="text-color dark:text-white transition-all" />
                }
              </Button>

              {showFilters && (
                <NavbarFilterDropdown
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  priceStats={priceStats}
                  tempPriceRange={tempPriceRange}
                  setTempPriceRange={setTempPriceRange}
                  setPriceRange={setPriceRange}
                  handleMinPriceInputChange={handleMinPriceInputChange}
                  handleMaxPriceInputChange={handleMaxPriceInputChange}
                  applyManualPriceInput={applyManualPriceInput}
                  handlePriceChange={handlePriceChange}
                  handlePriceChangeCommitted={handlePriceChangeCommitted}
                  showOnSale={showOnSale}
                  setShowOnSale={setShowOnSale}
                  minRating={minRating}
                  setMinRating={setMinRating}
                  hasActiveFilters={hasActiveFilters}
                  clearAllFilters={clearAllFilters}
                  setShowFilters={setShowFilters}
                  filterDropdownRef={filterDropdownRef}
                />
              )}
            </div>
          )}

          <NavbarSearch
            searchQuery={searchQuery}
            searchResults={searchResults}
            loading={loading}
            handleEnterSearch={handleEnterSearch}
            isSearchFocused={isSearchFocused}
            setIsSearchFocused={setIsSearchFocused}
            setSearchQuery={setSearchQuery}
            setSearchResults={setSearchResults}
            handleSearch={handleSearch}
            searchRef={searchRef}
          />

          <NavbarUserActions handleLogout={handleLogout} />

        </div>
      </div>
    </div>
  );
};

export default Navbar;