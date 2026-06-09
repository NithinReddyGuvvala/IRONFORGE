import { useEffect, useRef, useState } from "react";
import { Trophy, Users, Calendar, Flame } from "lucide-react";

const stats = [
  { i: Users, v: 12000, suf: "+", l: "Members Trained" },
  { i: Trophy, v: 50, suf: "+", l: "Certified Trainers" },
  { i: Calendar, v: 15, suf: "", l: "Years of Experience" },
  { i: Flame, v: 3200, suf: "+", l: "Transformations" },
];

function Counter({ to, suf }: { to: number; suf: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const start = performance.now();
        const dur = 1600;
        const tick = (t: number) => {
          const p = Math.min((t - start) / dur, 1);
          setN(Math.floor(p * to));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.disconnect();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{n.toLocaleString()}{suf}</span>;
}

export function Stats() {
  return (
    <section className="relative overflow-hidden border-y border-border bg-card py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,oklch(0.63_0.22_27/0.15),transparent_60%)]" />
      <div className="relative mx-auto grid w-full max-w-none gap-8 px-6 md:grid-cols-4 md:px-16">
        {stats.map((s) => (
          <div key={s.l} className="text-center">
            <s.i className="mx-auto mb-3 h-7 w-7 text-primary" />
            <div className="font-display text-5xl md:text-6xl">
              <Counter to={s.v} suf={s.suf} />
            </div>
            <div className="mt-1 text-xs uppercase tracking-[0.25em] text-muted-foreground">
              {s.l}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}