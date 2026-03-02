import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const ui = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-ui",
  display: "swap",
});

const display = localFont({
  src: [
    {
      path: "../fonts/SofiaSansExtraCondensed-VariableFont_wght.ttf",
      style: "normal",
      weight: "100 900",
    },
    {
      path: "../fonts/SofiaSansExtraCondensed-Italic-VariableFont_wght.ttf",
      style: "italic",
      weight: "100 900",
    },
  ],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Маяк — интерактивная презентация",
  description: "Проект «Маяк» — презентация в формате сайта (скролл, навигация, интерактив).",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${ui.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
