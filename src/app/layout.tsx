import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Stay Composed",
  description: "Campus lost & found and blood donation alerts",
  icons: {
    icon: "/stay_composed.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col bg-paper text-ink font-body antialiased">
        <Providers>
          <Navbar />
          <main className="flex-1 w-full max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 lg:py-10">{children}</main>
          <footer className="border-t border-paperDark bg-paper/80 py-6">
            <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink/60">
              <div className="flex items-center gap-2">
                <img src="/stay_composed.png" alt="Stay Composed" className="w-6 h-6 object-contain rounded-md" />
                <span className="font-display font-semibold text-ink">Stay Composed</span>
                <span>&bull; AI Lost &amp; Found &amp; Emergency Blood Network</span>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="/downloads/stay-composed-app.apk"
                  download="StayComposed-v1.0.apk"
                  className="inline-flex items-center gap-1.5 bg-white border border-paperDark px-3 py-1.5 rounded-full text-ink hover:text-purple hover:border-purple transition-all shadow-2xs font-medium"
                >
                  <img
                    src="https://img.shields.io/badge/Android-v1.0.0-3DDC84?style=flat&logo=android&logoColor=white"
                    alt="Android v1.0.0"
                    className="h-4 object-contain rounded"
                  />
                  <span>Download APK</span>
                </a>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}