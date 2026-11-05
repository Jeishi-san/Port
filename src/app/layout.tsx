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
  metadataBase: new URL("https://alexmorgan.dev"),
  title: "Alex Morgan — Senior Full-Stack Engineer & Product Builder",
  description:
    "Portfolio of Alex Morgan — Senior Full-Stack Engineer specializing in high-performance web applications, scalable architectures, and refined user experiences.",
  keywords: [
    "Full-Stack Developer",
    "Next.js",
    "React",
    "TypeScript",
    "Tailwind CSS",
    "Software Engineer",
    "Frontend",
    "Backend",
    "Portfolio",
  ],
  openGraph: {
    title: "Alex Morgan — Senior Full-Stack Engineer & Product Builder",
    description:
      "Portfolio of Alex Morgan — Senior Full-Stack Engineer specializing in high-performance web applications, scalable architectures, and refined user experiences.",
    type: "website",
    url: "https://alexmorgan.dev",
    images: [
      {
        url: "/avatar.svg",
        width: 400,
        height: 400,
        alt: "Alex Morgan avatar",
        type: "image/svg+xml",
      },
    ],
    siteName: "Alex Morgan Portfolio",
  },
  alternates: {
    canonical: "https://alexmorgan.dev",
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