import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";

import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Route One Intake",
  description: "Client onboarding and intake workflow for Route One Consultancy.",
  icons: {
    icon: "/route-one-logo-without-text-white.svg",
    shortcut: "/route-one-logo-without-text-white.svg",
    apple: "/route-one-logo-without-text-white.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={dmSans.className}>{children}</body>
    </html>
  );
}
