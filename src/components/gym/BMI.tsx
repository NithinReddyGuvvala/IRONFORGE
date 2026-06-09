import { useState } from "react";
import { Calculator } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

function category(b: number) {
  if (b < 18.5) return { label: "Underweight", color: "text-accent" };
  if (b < 25) return { label: "Healthy", color: "text-primary" };
  if (b < 30) return { label: "Overweight", color: "text-accent" };
  return { label: "Obese", color: "text-destructive" };
}

export function BMI() {
  const [h, setH] = useState("175");
  const [w, setW] = useState("70");
  const [bmi, setBmi] = useState<number | null>(null);

  const calc = (e: React.FormEvent) => {
    e.preventDefault();
    const hm = parseFloat(h) / 100;
    const wk = parseFloat(w);
    if (hm > 0 && wk > 0) setBmi(+(wk / (hm * hm)).toFixed(1));
  };

  return (
    <section id="bmi" className="bg-secondary/30 py-24 md:py-32">
      <div className="mx-auto w-full max-w-none px-6 md:px-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader
              eyebrow="BMI Calculator"
              title={<>Know Your <span className="text-gradient">Starting Line.</span></>}
              subtitle="A 10-second check to benchmark where you are today. Then come train with us to redefine where you're going."
            />
          </div>
          <form onSubmit={calc} className="rounded-sm border border-border bg-card p-8 shadow-card">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Height (cm)</span>
                <input
                  type="number" value={h} onChange={(e) => setH(e.target.value)} min={50} max={250}
                  className="mt-2 w-full rounded-sm border border-border bg-background px-4 py-3 font-display text-2xl focus:border-primary focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Weight (kg)</span>
                <input
                  type="number" value={w} onChange={(e) => setW(e.target.value)} min={20} max={400}
                  className="mt-2 w-full rounded-sm border border-border bg-background px-4 py-3 font-display text-2xl focus:border-primary focus:outline-none"
                />
              </label>
            </div>
            <button className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-5 py-3.5 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-all hover:shadow-glow">
              <Calculator className="h-4 w-4" /> Calculate BMI
            </button>
            {bmi !== null && (
              <div className="mt-6 flex items-center justify-between rounded-sm border border-border bg-background p-5">
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">Your BMI</div>
                  <div className="font-display text-5xl">{bmi}</div>
                </div>
                <div className={`text-right font-display text-xl uppercase ${category(bmi).color}`}>
                  {category(bmi).label}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}