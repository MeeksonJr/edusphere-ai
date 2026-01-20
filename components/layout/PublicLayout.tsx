"use client";

import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface PublicLayoutProps {
  children: ReactNode;
  navbarVariant?: "default" | "transparent";
  showFooter?: boolean;
}

export function PublicLayout({
  children,
  navbarVariant = "transparent",
  showFooter = true,
}: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar variant={navbarVariant} />
      <main className="flex-1 pt-16 lg:pt-20">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}

