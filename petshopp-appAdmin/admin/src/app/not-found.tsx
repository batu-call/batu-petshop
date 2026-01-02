import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary px-4">
        <div className="absolute top-20 text-color3 text-6xl">
            Page Not Found!
        </div>
      <div className="text-center max-w-md w-full">
        <div className="relative w-full h-64 mb-6">
          <Image
            src="/404.webp"
            alt="404 illustration"
            fill
            className="object-contain rounded-md"
            priority
          />
        </div>
        <div className="text-6xl text-color mt-2 z-40">
            404
        </div>
        <Link
          href="/main"
          className="inline-block rounded-lg bg-[#D6EED6] px-6 py-3 text-[#393E46] transition hover:bg-[#393E46] hover:text-[#eaeff7] font-semibold mt-20"
          >
          Go back home
        </Link>
      </div>
    </div>
  );
}