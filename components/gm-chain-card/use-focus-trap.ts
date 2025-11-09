"use client";

import { useEffect, useRef } from "react";

type UseFocusTrapOptions = {
  isOpen: boolean;
  isProcessing: boolean;
  onClose: () => void;
};

const isElementHidden = (el: HTMLElement) => {
  const style = window.getComputedStyle(el);
  const isHidden = style.visibility === "hidden" || style.display === "none";
  const isAriaHidden = el.getAttribute("aria-hidden") === "true";
  const isDisabled = el.hasAttribute("disabled");
  return isHidden || isAriaHidden || isDisabled;
};

const getFocusableElements = (container: HTMLElement) => {
  const selectors = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ].join(",");
  const nodes = Array.from(container.querySelectorAll<HTMLElement>(selectors));
  return nodes.filter((el) => !isElementHidden(el));
};

const isElementOutsideContainer = (
  element: HTMLElement | null,
  container: HTMLElement
) => (element ? !container.contains(element) : true);

const shouldMoveFocus = (
  active: HTMLElement | null,
  boundary: HTMLElement,
  container: HTMLElement
) => {
  const hasNoFocus = !active;
  const isAtBoundary = active === boundary;
  const isOutside = isElementOutsideContainer(active, container);
  return hasNoFocus || isAtBoundary || isOutside;
};

const handleTabKey = (
  e: KeyboardEvent,
  container: HTMLElement,
  focusables: HTMLElement[]
) => {
  if (focusables.length === 0) {
    e.preventDefault();
    (container as HTMLElement).focus();
    return;
  }

  const first = focusables[0];
  const last = focusables.at(-1);
  const active = (document.activeElement as HTMLElement) ?? null;
  const boundary = e.shiftKey ? first : (last as HTMLElement);
  const target = e.shiftKey ? (last as HTMLElement) : first;

  if (shouldMoveFocus(active, boundary, container)) {
    e.preventDefault();
    target.focus();
  }
};

export function useFocusTrap({
  isOpen,
  isProcessing,
  onClose,
}: UseFocusTrapOptions) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const container = dialogRef.current;
    if (!container) {
      return;
    }

    lastActiveRef.current = (document.activeElement as HTMLElement) ?? null;

    const focusables = getFocusableElements(container);
    const target = focusables[0] ?? container;
    (target as HTMLElement).focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isProcessing) {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key !== "Tab") {
        return;
      }
      handleTabKey(e, container, getFocusableElements(container));
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      const prev = lastActiveRef.current;
      if (prev && typeof prev.focus === "function") {
        prev.focus();
      }
    };
  }, [isOpen, isProcessing, onClose]);

  return dialogRef;
}
