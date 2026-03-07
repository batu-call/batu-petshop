import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Suspense } from "react";

const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Batu Petshop Admin Panel",
  description: "Batu Petshop Admin Panel",
  icons: {
    icon: "/favicon.ico",
  },
  appleWebApp: {
    statusBarStyle: "black-translucent",
  },
};

export const viewport = {
  themeColor: "#97cba9",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased ${jost.className}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}