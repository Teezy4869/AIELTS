import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="20" {...props}>
      {children}
    </svg>
  );
}

export function HomeIcon(props: IconProps) { return <Icon {...props}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" /><path d="M9 21v-7h6v7" /></Icon>; }
export function BookIcon(props: IconProps) { return <Icon {...props}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5Z" /><path d="M4 5.5v16" /></Icon>; }
export function CalendarIcon(props: IconProps) { return <Icon {...props}><rect height="17" rx="2" width="18" x="3" y="4" /><path d="M8 2v4M16 2v4M3 10h18" /></Icon>; }
export function ChartIcon(props: IconProps) { return <Icon {...props}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></Icon>; }
export function UsersIcon(props: IconProps) { return <Icon {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></Icon>; }
export function SunIcon(props: IconProps) { return <Icon {...props}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></Icon>; }
export function MoonIcon(props: IconProps) { return <Icon {...props}><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" /></Icon>; }
export function ArrowIcon(props: IconProps) { return <Icon {...props}><path d="M5 12h14M13 6l6 6-6 6" /></Icon>; }
