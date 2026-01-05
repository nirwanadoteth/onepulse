"use client";

import type { JSX } from "react";
import { Header } from "@/components/header";
import { Home as HomeComponent } from "@/components/home";
import { useHomePage } from "@/hooks/use-home-page";

export default function HomePage(): JSX.Element {
  const { safeAreaStyle } = useHomePage();

  return (
    <div className="font-sans" style={safeAreaStyle}>
      <div className="mx-auto my-4 w-[95%] max-w-lg px-4 py-4">
        <Header />
        <HomeComponent />
      </div>
    </div>
  );
}
