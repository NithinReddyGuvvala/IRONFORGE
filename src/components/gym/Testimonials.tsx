import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

interface TestimonialItem {
  name: string;
  role: string;
  rating: number;
  text: string;
  isLive?: boolean; // true for real user reviews
}

const staticTestimonials: TestimonialItem[] = [
  {
    name: "James Carter",
    role: "Lost 38 lbs in 6 months",
    rating: 5,
    text: "IRONFORGE rebuilt my life. The coaches don't just give you workouts — they give you accountability. I'm in the best shape of my 40s.",
  },
  {
    name: "Priya Sharma",
    role: "Member since 2021",
    rating: 5,
    text: "The 24/7 access is a game-changer for shift workers like me. Equipment is always immaculate and the community is unbeatable.",
  },
  {
    name: "Derek Wong",
    role: "Competed at regionals",
    rating: 5,
    text: "Viktor's programming took me from 'I lift sometimes' to qualifying for CrossFit regionals in 18 months. Elite-level coaching, full stop.",
  },
  {
    name: "Maria Lopez",
    role: "Body Transformation grad",
    rating: 5,
    text: "I tried everything before this. The 90-day transformation program was the only thing that actually stuck. Down 22 lbs, up two pant sizes in muscle.",
  },
];

export function Testimonials() {
  const [allTestimonials, setAllTestimonials] = useState<TestimonialItem[]>(staticTestimonials);
  const [i, setI] = useState(0);

  // Pull real user reviews from Firestore and prepend them to the slider
  useEffect(() => {
    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const liveReviews: TestimonialItem[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          name: data.name || "Member",
          role: "Verified Member",
          rating: data.rating || 5,
          text: data.message || "",
          isLive: true,
        };
      });
      // Live reviews first, then static ones
      setAllTestimonials([...liveReviews, ...staticTestimonials]);
      // Reset index so we don't land on an out-of-range slide
      setI(0);
    });
    return () => unsub();
  }, []);

  const total = allTestimonials.length;
  const r = allTestimonials[i] ?? allTestimonials[0];

  if (!r) return null;

  const initials = r.name
    .split(" ")
    .map((p) => p[0])
    .join("");

  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto w-full max-w-none px-6 md:px-16">
        <SectionHeader
          center
          eyebrow="Testimonials"
          title={<>Stories From The <span className="text-gradient">Floor.</span></>}
        />
        <div className="relative mx-auto max-w-3xl rounded-sm border border-border bg-card p-8 shadow-card md:p-12">
          <Quote className="absolute -top-5 left-8 h-10 w-10 fill-primary text-primary" />

          {/* Live badge */}
          {r.isLive && (
            <span className="absolute top-4 right-4 text-[9px] uppercase tracking-widest font-bold border border-primary/30 bg-primary/10 text-primary px-2 py-0.5 rounded-sm">
              ✓ Verified Review
            </span>
          )}

          {/* Stars */}
          <div className="flex gap-0.5">
            {Array.from({ length: r.rating }).map((_, k) => (
              <Star key={k} className="h-4 w-4 fill-accent text-accent" />
            ))}
          </div>

          <p className="mt-5 text-lg leading-relaxed md:text-xl">"{r.text}"</p>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 font-display text-lg text-primary">
              {initials}
            </div>
            <div>
              <div className="font-display uppercase">{r.name}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{r.role}</div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              {i + 1} / {total}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setI((p) => (p - 1 + total) % total)}
                className="rounded-sm border border-border p-2 hover:border-primary hover:text-primary transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setI((p) => (p + 1) % total)}
                className="rounded-sm border border-border p-2 hover:border-primary hover:text-primary transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 mt-6">
          {allTestimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === i ? "w-6 bg-primary" : "w-1.5 bg-border"
              }`}
              aria-label={`Go to testimonial ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}