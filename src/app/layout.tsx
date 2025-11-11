import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import CookieConsent from "@/components/CookieConsent";

const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
  title: "flexconvert - The best file conversion platform",
  description: "Convert any file format instantly. Transform documents, images, videos, and more.",
  icons: {
    icon: '/icon.png',
  },

  openGraph: {
    title: "flexconvert - The best file conversion platform",
    description: "Convert any file format instantly. Transform documents, images, videos, and more.",
    type: "website",
    url: "https://flexconvert.com",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "flexconvert - The best file conversion platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "flexconvert - The best file conversion platform",
    description: "Convert any file format instantly. Transform documents, images, videos, and more.",
    images: ["/opengraph-image.png"],
  },
  themeColor: "#8b5cf6", 
 
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* fallback for older bots */}
        <meta name="theme-color" content="#8b5cf6" />
        {/* Discord will now show a purple color on embeds */}
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  );
}
