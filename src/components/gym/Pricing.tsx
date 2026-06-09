import { useEffect, useState } from "react";
import { Check, Zap } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { auth, db } from "@/lib/firebase";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { doc, onSnapshot } from "firebase/firestore";

const defaultPlans = [
  {
    name: "Basic",
    tag: "Starter",
    monthly: 29,
    yearly: 290,
    features: [
      "Full gym access (6am–10pm)",
      "Locker & shower facilities",
      "Free fitness assessment",
      "Mobile app workouts",
      "1 guest pass / month",
    ],
  },
  {
    name: "Standard",
    tag: "Most Popular",
    monthly: 59,
    yearly: 590,
    highlight: true,
    features: [
      "24/7 gym access",
      "All group classes included",
      "Personalized workout plan",
      "Weekly progress tracking",
      "Nutrition guidance",
      "4 guest passes / month",
    ],
  },
  {
    name: "Premium",
    tag: "Elite",
    monthly: 119,
    yearly: 1190,
    features: [
      "Everything in Standard",
      "8x Personal Training sessions",
      "Custom diet & meal plans",
      "Advanced body composition scan",
      "Recovery suite (sauna, ice bath)",
      "Priority booking & support",
    ],
  },
];

export function Pricing() {
  const [yearly, setYearly] = useState(false);
  const [plansList, setPlansList] = useState(defaultPlans);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "config", "pricing"),
      (docSnap) => {
        if (docSnap.exists() && docSnap.data()?.plans) {
          setPlansList(docSnap.data().plans);
        }
      },
      (error) => {
        console.error("Error fetching live pricing config: ", error);
      }
    );
    return () => unsubscribe();
  }, []);

  return (
    <section id="pricing" className="py-24 md:py-32">
      <div className="mx-auto w-full max-w-none px-6 md:px-16">
        <SectionHeader
          center
          eyebrow="Membership"
          title={<>Choose Your <span className="text-gradient">Plan.</span></>}
          subtitle="No contracts. No hidden fees. Cancel anytime."
        />
        <div className="mb-12 flex items-center justify-center gap-3">
          <span className={`text-sm uppercase tracking-widest ${!yearly ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
          <button
            onClick={() => setYearly((v) => !v)}
            className="relative h-7 w-14 rounded-full border border-border bg-secondary"
            aria-label="Toggle billing"
          >
            <span
              className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-primary transition-transform ${yearly ? "translate-x-7" : "translate-x-0"}`}
            />
          </button>
          <span className={`text-sm uppercase tracking-widest ${yearly ? "text-foreground" : "text-muted-foreground"}`}>
            Yearly <span className="text-primary">(–17%)</span>
          </span>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {plansList.map((p) => (
            <div
              key={p.name}
              className={`relative flex flex-col rounded-sm border bg-card p-8 transition-all ${
                p.highlight
                  ? "border-primary shadow-glow lg:-translate-y-4 lg:scale-105"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-sm bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                  <Zap className="h-3 w-3" /> {p.tag}
                </span>
              )}
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                {p.name}
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-6xl">${yearly ? p.yearly : p.monthly}</span>
                <span className="text-sm text-muted-foreground">/{yearly ? "yr" : "mo"}</span>
              </div>
              <ul className="mt-8 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (!auth.currentUser) {
                    toast.error(`Please sign in or register to purchase the ${p.name} plan.`);
                    navigate({ to: "/login" });
                    return;
                  }
                  window.dispatchEvent(
                    new CustomEvent("open-checkout", {
                      detail: {
                        type: "membership",
                        name: p.name,
                        price: yearly ? p.yearly : p.monthly,
                      },
                    })
                  );
                }}
                className={`mt-8 block w-full rounded-sm px-5 py-3 text-center text-sm font-semibold uppercase tracking-widest transition-all cursor-pointer ${
                  p.highlight
                    ? "bg-primary text-primary-foreground hover:shadow-glow"
                    : "border border-border hover:border-primary hover:text-primary"
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}