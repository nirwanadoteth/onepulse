"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { flushSync } from "react-dom"

import { cn } from "@/lib/utils"
import { useMetaColor } from "@/hooks/use-meta-color"
import { Toggle } from "@/components/ui/toggle"

interface AnimatedThemeTogglerProps
  extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number
}

export const AnimatedThemeToggler = ({
  className,
  duration = 400,
  ...props
}: AnimatedThemeTogglerProps) => {
  const { setTheme } = useTheme()
  const { setMetaColor, metaColor } = useMetaColor()
  const [isDark, setIsDark] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setMetaColor(metaColor)

    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"))
    }

    updateTheme()

    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [metaColor, setMetaColor])

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return

    const nextTheme = isDark ? "light" : "dark"

    await document.startViewTransition(() => {
      flushSync(() => {
        setIsDark(nextTheme === "dark")
        // Set class deterministically to avoid double toggles
        document.documentElement.classList.toggle("dark", nextTheme === "dark")
      })
    }).ready

    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect()
    const x = left + width / 2
    const y = top + height / 2
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth - left),
      Math.max(top, window.innerHeight - top)
    )

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    )

    // Update next-themes so resolvedTheme updates across the app
    setTheme(nextTheme)
  }, [isDark, duration, setTheme])

  return (
    <Toggle
      ref={buttonRef as any}
      onClick={toggleTheme}
      className={cn(className)}
      aria-label="Toggle theme"
      variant="outline"
      {...(props as any)}
    >
      {isDark ? <Sun /> : <Moon />}
      Toggle theme
    </Toggle>
  )
}
