import "./globals.css";
import type { Metadata } from "next";
import { Jost } from "next/font/google";
import Providers from "./providers";
import { Suspense } from "react";

const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Batu Petshop",
  description: "Next.js Petshop App",
  icons: { icon: "/favicon.ico" },
  appleWebApp: {
    statusBarStyle: "black-translucent",
  },
};

export const viewport = {
  themeColor: "#97cba9",
  colorScheme: "light only",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`antialiased ${jost.className}`}>
        <Suspense fallback={null}> 
        <Providers>{children}</Providers>
         </Suspense>
      </body>
    </html>
  );
}
