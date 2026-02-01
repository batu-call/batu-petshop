import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/">
      <Image
        src="/logo.png"
        alt="Pet Shop Logo"
        width={160}
        height={160}
        priority
        sizes="(min-width: 1024px) 128px, (min-width: 768px) 96px, 64px"
        className="w-16 md:w-24 lg:w-32 h-auto object-contain"
      />
    </Link>
  );
}
