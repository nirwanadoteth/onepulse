import type { JSX } from "react";
import { Header } from "@/components/header";
import { Home as HomeComponent } from "@/components/home";

export default function HomePage(): JSX.Element {
  return (
    <div className="font-sans">
      <div className="mx-auto my-4 w-[95%] max-w-lg px-4 py-4">
        <Header />
        <HomeComponent />
      </div>
    </div>
  );
}
