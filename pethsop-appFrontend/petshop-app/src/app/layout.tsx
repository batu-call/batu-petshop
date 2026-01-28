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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`antialiased ${jost.className}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
