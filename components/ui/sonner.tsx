"use client";

import {
  CheckIcon,
  InfoIcon,
  Loader2Icon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";
import type { CSSProperties } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { cn } from "@/lib/utils";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      icons={{
        success: (
          <CheckIcon className="size-4 rounded-full bg-green-600 stroke-4 p-1 text-background" />
        ),
        info: (
          <InfoIcon className="size-4 rounded-full bg-blue-600 stroke-4 p-1 text-background" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 rounded-full bg-yellow-600 stroke-4 p-1 text-background" />
        ),
        error: (
          <XIcon className="size-4 rounded-full bg-red-600 stroke-4 p-1 text-background" />
        ),
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius-3xl)",
        } as CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg max-w-fit mx-auto",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-background group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
      className={cn("toaster group", props.className)}
    />
  );
};

export { Toaster };
