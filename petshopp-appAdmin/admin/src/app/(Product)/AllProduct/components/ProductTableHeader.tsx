"use client";

const COLUMNS = ["Product", "Description", "Price", "Stock", "Sold", "Category", "Created", "Updated", "Status"];

const ProductTableHeader = () => {
  return (
    <div className="hidden lg:flex flex-row bg-secondary dark:bg-[#1e3d2a] py-2 text-color dark:text-[#a8d4b8] font-semibold sticky top-0 z-10 border-b dark:border-[#2d5a3d] gap-3 rounded-t-lg px-3 items-center">
      <div className="w-16 shrink-0" />
      {COLUMNS.map((col) => (
        <div key={col} className="flex-1 lg:flex lg:justify-center">
          {col}
        </div>
      ))}
      <div className="w-8 shrink-0 ml-1" />
    </div>
  );
};

export default ProductTableHeader;