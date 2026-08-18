"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { BookIcon, CalendarIcon, ChartIcon, HomeIcon, MoonIcon, SunIcon, UsersIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { classNames } from "@/lib/class-names";

const navigation = [
  { label: "Overview", icon: HomeIcon, active: true },
  { label: "My learning", icon: BookIcon, active: false },
  { label: "Plan", icon: CalendarIcon, active: false },
  { label: "Progress", icon: ChartIcon, active: false },
  { label: "Study group", icon: UsersIcon, active: false },
];

type ThemePreference = "light" | "dark" | "system";

const nextTheme: Record<ThemePreference, ThemePreference> = {
  system: "dark",
  dark: "light",
  light: "system",
};

export function AppShell({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemePreference>("system");

  useEffect(() => {
    const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const isDark = theme === "dark" || (theme === "system" && Boolean(mediaQuery?.matches));

      document.documentElement.classList.toggle("dark", isDark);
      document.documentElement.dataset.theme = theme;
    };

    applyTheme();
    mediaQuery?.addEventListener("change", applyTheme);

    return () => mediaQuery?.removeEventListener("change", applyTheme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-[var(--canvas)]">
      <header className="border-b-[3px] border-[var(--line)] bg-[var(--canvas)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Brand />
          <div className="hidden text-center sm:block"><p className="text-[10px] font-black uppercase tracking-[0.18em]">Lotus Study Circle</p><p className="mt-1 text-xs font-bold text-[var(--muted)]">Keep the plan moving</p></div>
          <div className="flex items-center gap-2">
            <Button aria-label={`Theme: ${theme}. Change theme`} className="w-10 px-0" onClick={() => setTheme(nextTheme[theme])} title={`Theme: ${theme}. Activate to change.`} variant="ghost">
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </Button>
            <div aria-label="Signed in as Minh Anh" className="grid h-10 w-10 border-2 border-[var(--line)] bg-[var(--surface)] text-xs font-black">MA</div>
          </div>
        </div>
        <nav aria-label="Primary navigation" className="mx-auto flex max-w-7xl gap-0 overflow-x-auto border-t-2 border-[var(--line)] px-5 sm:px-8">
          {navigation.map(({ active, icon: NavigationIcon, label }) => <button className={classNames("flex shrink-0 items-center gap-2 border-r-2 border-[var(--line)] px-4 py-3 text-xs font-black uppercase tracking-[0.06em]", active ? "bg-[var(--ink)] text-[var(--surface)]" : "text-[var(--ink)] hover:bg-[var(--surface-muted)]")} key={label} type="button"><NavigationIcon height="16" width="16" />{label}</button>)}
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}

function Brand() {
  return <div className="flex items-center gap-2.5"><span className="grid h-9 w-9 border-2 border-[var(--line)] bg-[var(--ink)] text-lg font-black text-[var(--canvas)]">A</span><span className="text-base font-black uppercase tracking-tight">AIELTS<br /><span className="text-xs tracking-[0.13em]">Together</span></span></div>;
}
