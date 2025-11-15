import "./globals.css";
import Navbar from "@/components/Navbar";

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Navbar />
        <div className="pt-16">{children}</div>
      </body>
    </html>
  );
}
