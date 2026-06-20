"use client";

import { Button } from "@heroui/react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function Switcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-fit h-fit p-1 flex items-center gap-1 rounded-full bg-default">
      <Button
        isIconOnly
        onClick={() => setTheme("light")}
        className={[
          "size-6.5 bg-field text-field-foreground",
          resolvedTheme !== "light" && "bg-transparent",
        ].join(", ")}
      >
        <SunIcon className="text-field-foreground" />
      </Button>

      <Button
        isIconOnly
        onClick={() => setTheme("dark")}
        className={[
          "size-6.5 bg-field text-field-foreground",
          resolvedTheme !== "dark" && "bg-transparent",
        ].join(", ")}
      >
        <MoonIcon className="text-field-foreground" />
      </Button>
    </div>
  );
}
