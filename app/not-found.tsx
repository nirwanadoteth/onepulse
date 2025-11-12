"use client";

import { AlertTriangle, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { Button, buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <section>
      <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center px-6 py-12">
        <div className="mx-auto flex max-w-sm flex-col items-center text-center">
          <p className="rounded-full bg-blue-50 p-3 font-medium text-sm dark:bg-gray-800">
            <AlertTriangle className="size-6" />
          </p>
          <h1 className="mt-3 font-semibold text-2xl text-gray-800 md:text-3xl dark:text-white">
            Page not found
          </h1>
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            The page you are looking for doesn&apos;t exist.
          </p>

          <div className="group mt-6 flex w-full shrink-0 items-center gap-x-3 sm:w-auto">
            <Button
              className={buttonVariants({ variant: "secondary" })}
              onClick={handleGoBack}
            >
              <ChevronLeft className="group-hover:-translate-x-1 size-4 transition-transform" />
              <span>Go back</span>
            </Button>

            <Link className={buttonVariants({ variant: "default" })} href="/">
              Take me home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
