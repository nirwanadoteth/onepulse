"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { flushSync } from "react-dom"

import { cn } from "@/lib/utils"
import { useMetaColor } from "@/hooks/use-meta-color"

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
    const runTransition = (cb: () => void) => {
      interface DocWithViewTransition extends Document {
        startViewTransition?: (cb: () => void) => { ready: Promise<void> }
      }
      const doc = document as DocWithViewTransition
      if (typeof doc.startViewTransition === "function") {
        return doc.startViewTransition(cb).ready
      }
      cb()
      return Promise.resolve()
    }

    await runTransition(() => {
      flushSync(() => {
        setIsDark(nextTheme === "dark")
        // Set class deterministically to avoid double toggles
        document.documentElement.classList.toggle("dark", nextTheme === "dark")
      })
    })

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
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(className)}
      {...props}
    >
      {isDark ? <Sun /> : <Moon />}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
