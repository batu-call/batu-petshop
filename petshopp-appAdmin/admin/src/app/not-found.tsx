import Link from "next/link";
import Image from "next/image";
import { Dog, House, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-primary relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.15) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6 py-12 text-center">
        {/* Image section */}
        <div className="relative mb-8">
          <div className="absolute -inset-4 bg-color3/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="relative w-72 h-72 sm:w-80 sm:h-80">
            <Image
              src="/404.webp"
              alt="Confused dog looking at empty bowl"
              fill
              sizes="(max-width: 640px) 288px, (max-width: 768px) 320px, 320px"
              className="object-contain rounded-xl shadow-2xl transform rotate-2"
              priority
            />
          </div>
          <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg border-2 border-color3/30">
            <span className="text-color2 text-4xl">
              <Dog />
            </span>
          </div>
        </div>

        {/* Text content */}
        <div className="max-w-2xl space-y-6">
          <div className="space-y-2">
            <h1 className="text-7xl md:text-8xl font-black text-color3 tracking-tighter">
              404
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-color3 leading-tight">
              Page Not Found
            </h2>
          </div>

          <p className="text-lg md:text-xl text-color font-medium max-w-md mx-auto">
            Oops! This page seems to have wandered off. Let’s get you back on
            track.
          </p>

          {/* Action buttons */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/main"
              className="bg-[#D6EED6] hover:bg-[#393E46] text-[#393E46] hover:text-[#eaeff7] px-8 py-4 rounded-full font-bold text-lg shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span className="text-color2">
                <House />
              </span>
              Go Back Home
            </Link>
            <Link
              href="/AllProduct?page=1"
              className="bg-white text-[#393E46] px-8 py-4 rounded-full font-bold text-lg border-2 border-color3/20 hover:border-color3/50 transition-all flex items-center gap-2"
            >
              <span className="text-color2">
                <Search />
              </span>
              Browse Shop
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
