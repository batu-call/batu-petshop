"use client"
import React, { useState } from "react"
import Link from "next/link"

const Dropdown = () => {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative inline-block">
      {/* Buton */}
      <button
        onClick={() => setOpen(!open)}
        className="w-40 h-10 rounded-xl bg-secondary flex items-center justify-center cursor-pointer"
      >
        <h3 className="text-color text-jost">Users</h3>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-xl z-50">
          <ul className="flex flex-col">
            <li>
              <Link
                href="/AddProduct"
                className="block px-4 py-2 hover:bg-gray-200 border-b-2 border-secondary"
              >
                Add Product
              </Link>
            </li>
            <li>
              <Link
                href="/AllProducts"
                className="block px-4 py-2 hover:bg-gray-200 border-b-2 border-secondary"
              >
                All Products
              </Link>
            </li>
            <li>
              <a className="block px-4 py-2 hover:bg-gray-200">Product Stats</a>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default Dropdown
