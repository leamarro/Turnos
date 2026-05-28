import { DM_Sans } from "next/font/google";
import ClientLayout from "@/components/ClientLayout";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

export const dynamic = "force-dynamic";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={dmSans.className}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a1a1a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{
          __html: `"serviceWorker"in navigator&&navigator.serviceWorker.register("/sw.js").then(r=>{r.onupdatefound=()=>{const i=r.installing;i&&(i.onstatechange=()=>{i.state==="installed"&&navigator.serviceWorker.controller&&location.reload()})}}).catch(()=>{})`,
        }} />
        <ToastProvider>
          <ClientLayout>{children}</ClientLayout>
        </ToastProvider>
      </body>
    </html>
  );
}
