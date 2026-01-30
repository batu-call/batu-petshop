import "./globals.css";
import type { Metadata } from "next";
import { Jost } from "next/font/google";
import Providers from "./providers";

const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Batu Petshop",
  description: "Next.js Petshop App",
  icons: { icon: "/favicon.ico" },
  themeColor: "#97cba9",
  colorScheme: "light",
  appleWebApp: {
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#97cba9" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`antialiased ${jost.className}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}