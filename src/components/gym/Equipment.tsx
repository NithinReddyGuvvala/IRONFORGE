import {
  Bike, Dumbbell, ChevronsUp, Activity, Waves, Zap, Anchor, Footprints, Repeat,
} from "lucide-react";
import { SectionHeader } from "./SectionHeader";

const eq = [
  { i: Footprints, n: "Treadmills", c: "20+" },
  { i: Bike, n: "Exercise Bikes", c: "15+" },
  { i: Dumbbell, n: "Dumbbells", c: "5-100 lb" },
  { i: Anchor, n: "Olympic Barbells", c: "30+" },
  { i: ChevronsUp, n: "Squat Racks", c: "12 stations" },
  { i: Activity, n: "Bench Press", c: "10 stations" },
  { i: Repeat, n: "Cable Machines", c: "8 units" },
  { i: Zap, n: "Functional Rigs", c: "Full studio" },
  { i: Waves, n: "Rowing Machines", c: "8 units" },
];

export function Equipment() {
  return (
    <section className="bg-secondary/30 py-24 md:py-32">
      <div className="mx-auto w-full max-w-none px-6 md:px-16">
        <SectionHeader
          eyebrow="Equipment"
          title={<>Pro-Grade Iron, <span className="text-gradient">End To End.</span></>}
          subtitle="From Rogue racks to Concept2 ergs — only the gear elite athletes train on."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {eq.map((e) => (
            <div
              key={e.n}
              className="group flex items-center gap-4 rounded-sm border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <e.i className="h-6 w-6" />
              </div>
              <div>
                <div className="font-display text-lg">{e.n}</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{e.c}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}