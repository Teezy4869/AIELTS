import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { ArrowIcon, BookIcon, CalendarIcon, ChartIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const assignments = [
  { skill: "Writing", title: "Task 2: Technology and education", due: "Today at 20:00", status: "in-progress" as const },
  { skill: "Reading", title: "Urban farming", due: "Tomorrow at 19:00", status: "upcoming" as const },
  { skill: "Listening", title: "University accommodation", due: "Tuesday at 19:00", status: "upcoming" as const },
];

export function DashboardPrototype() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-[var(--space-page)] py-8 sm:px-8 lg:py-10">
        <section className="border-[3px] border-[var(--line)] bg-[var(--ink)] p-5 text-[var(--surface)] shadow-[6px_6px_0_var(--line)] sm:p-8">
          <p className="inline-block bg-[var(--canvas)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-black">Weekly study signal</p>
          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div><h1 className="max-w-2xl text-4xl font-black uppercase leading-[0.9] tracking-[-0.05em] sm:text-6xl">Your plan is<br />in motion.</h1><p className="mt-5 max-w-xl text-sm leading-6 text-[var(--muted)]">Three focused sessions. One shared direction. Take the next small step and keep your learning momentum visible.</p></div>
            <Button className="shrink-0" variant="secondary"><CalendarIcon /> Open study plan</Button>
          </div>
          <div className="mt-8 grid grid-cols-3 divide-x-2 divide-[var(--muted)] border-y-2 border-[var(--muted)] py-4 text-center"><ProgressMarker label="Done" value="02" /><ProgressMarker label="Next" value="01" /><ProgressMarker label="Sessions" value="03" /></div>
        </section>

        <section aria-label="Study summary" className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard accent="bg-[var(--accent)]" icon={<ChartIcon />} label="This week" value="67%" detail="2 of 3 sessions complete" />
          <StatCard accent="bg-[var(--brand)]" icon={<BookIcon />} label="Current focus" value="Writing" detail="Task 2 practice this week" />
          <StatCard accent="bg-[var(--warm)]" icon={<span className="text-lg">XP</span>} label="Total XP" value="1,240" detail="80 gained this week" />
          <StatCard accent="bg-[var(--surface-muted)]" icon={<span className="text-lg">06</span>} label="Study streak" value="6 days" detail="A steady week so far" />
        </section>

        <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.8fr)]">
          <section aria-labelledby="assignments-heading">
            <div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.18em]">Queue</p><h2 className="mt-1 text-2xl font-black uppercase tracking-tight" id="assignments-heading">Your next assignments</h2></div><Button variant="ghost">View all <ArrowIcon /></Button></div>
            <div className="space-y-4">
              {assignments.map((assignment, index) => <Card className="overflow-hidden" key={assignment.title}><div className="grid grid-cols-[auto_1fr] sm:grid-cols-[9rem_1fr_auto]"><div className="flex min-h-28 items-center justify-center border-b-[3px] border-[var(--line)] bg-[var(--warm)] px-4 sm:border-b-0 sm:border-r-[3px]"><span className="text-center text-xs font-black uppercase leading-4">{String(index + 1).padStart(2, "0")}<br /><span className="text-[10px]">{assignment.skill}</span></span></div><div className="min-w-0 p-4 sm:p-5"><p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--brand)]">Shared assignment</p><h3 className="mt-2 text-lg font-black leading-tight">{assignment.title}</h3><p className="mt-2 text-sm font-bold text-[var(--muted)]">Due: {assignment.due}</p></div><div className="col-span-2 flex items-center justify-between border-t-[3px] border-[var(--line)] px-4 py-3 sm:col-span-1 sm:border-l-[3px] sm:border-t-0 sm:px-5"><Badge status={assignment.status} /><Button className="sm:hidden" variant="ghost">Open <ArrowIcon /></Button></div></div></Card>)}
            </div>
          </section>

          <aside className="space-y-7">
            <Card className="bg-[var(--accent)] p-5 text-black sm:p-6"><p className="text-[10px] font-black uppercase tracking-[0.18em]">Study circle</p><h2 className="mt-3 text-3xl font-black uppercase leading-none">Routine beats rush.</h2><p className="mt-4 text-sm font-bold leading-6">4 of 5 members have completed a session this week.</p><div aria-label="Group completion: 80 percent" className="mt-6 grid grid-cols-5 gap-1.5"><span className="h-8 border-2 border-black bg-black" /><span className="h-8 border-2 border-black bg-black" /><span className="h-8 border-2 border-black bg-black" /><span className="h-8 border-2 border-black bg-black" /><span className="h-8 border-2 border-black bg-transparent" /></div><p className="mt-4 border-t-2 border-black pt-3 text-xs font-bold">Completion is shared. Individual academic results remain private.</p></Card>
            <Card className="p-5 sm:p-6"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--brand)]">Quick reflection</p><h2 className="mt-2 text-xl font-black uppercase leading-tight">Name your next move.</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">A small intention can make the next study session easier to begin.</p><Label className="mt-5" htmlFor="study-focus">Next-session intention</Label><Input className="mt-2" id="study-focus" placeholder="Outline the Writing response first" /><div className="mt-4 flex flex-wrap gap-3"><Button>Save note</Button><Button variant="secondary">Skip</Button></div></Card>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function ProgressMarker({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xl font-black sm:text-2xl">{value}</p><p className="mt-1 text-[9px] font-black uppercase tracking-[0.13em] text-[var(--muted)]">{label}</p></div>;
}

function StatCard({ accent, detail, icon, label, value }: { accent: string; detail: string; icon: ReactNode; label: string; value: string }) {
  return <Card className="relative overflow-hidden p-5"><div className={`absolute inset-x-0 top-0 h-2 ${accent}`} /><div className="flex items-center justify-between pt-2"><p className="text-[10px] font-black uppercase tracking-[0.13em] text-[var(--muted)]">{label}</p><span className="grid h-9 min-w-9 place-items-center border-2 border-[var(--line)] bg-[var(--surface-muted)] px-1 text-[var(--ink)]">{icon}</span></div><p className="mt-7 text-3xl font-black tracking-tight">{value}</p><p className="mt-1 text-xs font-bold text-[var(--muted)]">{detail}</p></Card>;
}
