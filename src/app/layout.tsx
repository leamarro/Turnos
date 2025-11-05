import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "BeatMakeup",
  description: "Gestión de turnos de maquillaje y perfilado",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#f5f3ef] text-[#111] font-sans">
        <Navbar />
        <main className="container mx-auto p-4 sm:p-6">{children}</main>
      </body>
    </html>
  );
}
