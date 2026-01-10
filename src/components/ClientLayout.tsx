"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideNavbar = pathname === "/login";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <main className={!hideNavbar ? "pt-20" : ""}>
        {children}
      </main>
    </>
  );
}
