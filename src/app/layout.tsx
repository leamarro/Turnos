"use client";

export const dynamic = "force-dynamic";

import "./globals.css";
import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hideNavbar = pathname === "/login";

  return (
    <html lang="es">
      <body>
        {!hideNavbar && <Navbar />}
        <main className={!hideNavbar ? "pt-20" : ""}>
          {children}
        </main>
      </body>
    </html>
  );
}
