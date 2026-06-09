import { CheckCircle2, Award, Users, Clock, Heart } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import interior from "@/assets/gym-interior.jpg";

const reasons = [
  { icon: Award, t: "Certified Trainers", d: "Internationally accredited coaches with proven track records." },
  { icon: Clock, t: "24/7 Access", d: "Train on your schedule. The doors never close for members." },
  { icon: Users, t: "Real Community", d: "A relentless tribe that holds you accountable, every session." },
  { icon: Heart, t: "Holistic Approach", d: "Strength, cardio, nutrition, recovery — all under one roof." },
];

export function About() {
  return (
    <section id="about" className="relative py-24 md:py-32">
      <div className="mx-auto w-full max-w-none px-6 md:px-16">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
          <div className="relative w-full">
            <img
              src={interior}
              alt="Modern luxury gym interior"
              width={1280}
              height={896}
              loading="lazy"
              className="w-full h-[450px] sm:h-[550px] lg:h-[650px] rounded-sm object-cover shadow-card"
            />
            <div className="absolute -bottom-6 -right-6 hidden rounded-sm bg-primary p-6 text-primary-foreground shadow-glow sm:block">
              <div className="font-display text-5xl">15+</div>
              <div className="text-xs uppercase tracking-widest">Years of Experience</div>
            </div>
          </div>

          <div className="max-w-xl lg:max-w-2xl lg:justify-self-start">
            <SectionHeader
              eyebrow="About Us"
              title={<>Forged In Iron.<br/>Built For <span className="text-gradient">Champions.</span></>}
              subtitle="IRONFORGE isn't just a gym — it's a movement. Since 2009 we've helped over 12,000 members rewrite what they thought was possible. Our mission is simple: give every member the tools, the coaching, and the culture to become the strongest version of themselves."
            />
            <ul className="grid gap-5 sm:grid-cols-2">
              {reasons.map((r) => (
                <li key={r.t} className="flex gap-3">
                  <r.icon className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
                  <div>
                    <div className="font-semibold uppercase tracking-wide">{r.t}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{r.d}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-2">
              {["Strength", "Conditioning", "Mobility", "Recovery", "Nutrition"].map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-xs uppercase tracking-wider text-muted-foreground"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}