import { useTheme } from "next-themes";
import { useEffect } from "react";

export function useColorSchemeSyncLogic() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const scheme = resolvedTheme === "dark" ? "dark" : "light";
    document.documentElement.style.colorScheme = scheme;
  }, [resolvedTheme]);
}
