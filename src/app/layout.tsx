import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://linkedin.com/in/john-christian-pasaporte26"),
  title: "John Christian Pasaporte — Information Security Specialist & Full-Stack Developer",
  description:
    "Portfolio of John Christian Pasaporte — BSIT graduate majoring in Information Security, skilled in ICT infrastructure, network administration, access control, and secure web application development (Laravel, React, NextJS).",
  keywords: [
    "Information Security",
    "IT Support",
    "Network Administration",
    "Laravel",
    "React",
    "Next.js",
    "MySQL",
    "Full-Stack Developer",
    "Software Engineer",
    "Portfolio",
  ],
  openGraph: {
    title: "John Christian Pasaporte — Information Security Specialist & Full-Stack Developer",
    description:
      "Portfolio of John Christian Pasaporte — BSIT graduate majoring in Information Security, skilled in ICT infrastructure, network administration, access control, and secure web application development (Laravel, React, NextJS).",
    type: "website",
    url: "https://linkedin.com/in/john-christian-pasaporte26",
    images: [
      {
        url: "/avatar.svg",
        width: 400,
        height: 400,
        alt: "John Christian Pasaporte avatar",
        type: "image/svg+xml",
      },
    ],
    siteName: "John Christian Pasaporte Portfolio",
  },
  alternates: {
    canonical: "https://linkedin.com/in/john-christian-pasaporte26",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakartaSans.variable} ${geistMono.variable} scroll-smooth antialiased`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}