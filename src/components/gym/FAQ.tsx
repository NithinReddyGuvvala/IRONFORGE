import { useState } from "react";
import { Plus } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

const faqs = [
  { q: "Do you offer a free trial?", a: "Yes — every new member gets a free 3-day pass with a complimentary personal training intro session. Book it from the contact form." },
  { q: "Are there long-term contracts?", a: "Never. All memberships are month-to-month or annual. Cancel anytime with 30 days notice." },
  { q: "Is the gym really open 24/7?", a: "Standard and Premium members get keycard access to the facility 24 hours a day, 365 days a year." },
  { q: "Do you have showers and lockers?", a: "Full locker rooms with showers, towels, and grooming amenities on both levels." },
  { q: "Can I bring a guest?", a: "Yes. Basic members get 1 guest pass per month, Standard 4, and Premium unlimited." },
  { q: "Do you offer nutrition coaching?", a: "Standard members receive nutrition guidance. Premium members get fully personalized meal plans built by our PN-certified coaches." },
];

export function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto w-full max-w-none px-6 md:px-16">
        <SectionHeader
          center
          eyebrow="FAQ"
          title={<>Frequently <span className="text-gradient">Asked.</span></>}
        />
        <div className="mx-auto max-w-3xl">
          <ul className="divide-y divide-border border-y border-border">
            {faqs.map((f, i) => (
              <li key={f.q}>
                <button
                  onClick={() => setOpen(open === i ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="font-display text-lg uppercase">{f.q}</span>
                  <Plus
                    className={`h-5 w-5 shrink-0 text-primary transition-transform ${open === i ? "rotate-45" : ""}`}
                  />
                </button>
                <div
                  className={`grid overflow-hidden transition-all duration-300 ${
                    open === i ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"
                  }`}
                >
                  <p className="min-h-0 text-muted-foreground">{f.a}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}