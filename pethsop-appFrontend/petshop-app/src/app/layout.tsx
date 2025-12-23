import "./globals.css";
import { AuthProvider } from "./context/authContext";
import type { Metadata } from "next";
import { Jost } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "./context/cartContext";
import { FavoriteProvider } from "./context/favoriteContext";
import { ConfirmProvider } from "./context/confirmContext";



const jost = Jost({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});
  
export const metadata: Metadata = {
  title: "Batu Petshop",
  description: "Next.js Petshop App",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`antialiased ${jost.className}`}>
        <AuthProvider>
          <CartProvider>
          <FavoriteProvider>
           <ConfirmProvider>
          {children}
        </ConfirmProvider>
        </FavoriteProvider>
          </CartProvider>
        </AuthProvider>
          <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  );
}
