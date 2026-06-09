import { useState } from "react";
import { ArrowUpRight, Clock, X, Dumbbell, Zap } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import w from "@/assets/program-weights.jpg";
import c from "@/assets/program-cardio.jpg";
import cf from "@/assets/program-crossfit.jpg";
import y from "@/assets/program-yoga.jpg";
import p from "@/assets/program-personal.jpg";
import f from "@/assets/program-functional.jpg";

const programs = [
  { 
    img: w, 
    name: "Muscle Building", 
    desc: "Hypertrophy-focused splits with progressive overload and nutrition support.", 
    duration: "12 Weeks",
    level: "All Levels",
    what: "Targeted muscle hypertrophy, skeletal muscle density, mechanical tension, metabolic stress, and lift biomechanics.",
    how: "4-5x weekly heavy resistance splits, structured progressive overload, compound lift tracking, and target caloric surplus support."
  },
  { 
    img: c, 
    name: "Weight Loss Training", 
    desc: "High-burn protocols engineered to shred fat while preserving lean muscle.", 
    duration: "8 Weeks",
    level: "All Levels",
    what: "Cardiovascular efficiency, high-metabolic calorie burn, endurance conditioning, and visceral fat reduction.",
    how: "High-Intensity Interval Training (HIIT), circuit training, functional metabolic blocks, and caloric deficit guidance."
  },
  { 
    img: p, 
    name: "Personal Training", 
    desc: "1-on-1 coaching tailored to your physiology, schedule, and goals.", 
    duration: "Ongoing",
    level: "Customized",
    what: "Individualized biomechanics, specific weak points correction, injury prevention, and personalized fitness goals.",
    how: "1-on-1 direct coaching sessions, custom workout plans, regular body composition scans, and weekly check-ins."
  },
  { 
    img: f, 
    name: "Strength & Conditioning", 
    desc: "Build raw power with compound lifts and athletic conditioning blocks.", 
    duration: "10 Weeks",
    level: "Intermediate / Advanced",
    what: "Compound strength (squat, bench, deadlift), power output, core stability, and athletic explosiveness.",
    how: "Barbell/kettlebell focused lifting blocks, plyometrics, speed drills, and periodized strength progressions."
  },
  { 
    img: cf, 
    name: "CrossFit Training", 
    desc: "Constantly varied, high-intensity, functional movements done at scale.", 
    duration: "Ongoing",
    level: "Scalable (All Levels)",
    what: "High-intensity metabolic conditioning, gymnastic bodyweight movements, and Olympic weightlifting.",
    how: "Daily workouts (WODs) done at high intensity, scaling protocols, group motivation, and technical skill sessions."
  },
  { 
    img: y, 
    name: "Yoga & Flexibility", 
    desc: "Restore mobility, balance, and breath control for full-body recovery.", 
    duration: "Drop-in",
    level: "All Levels",
    what: "Joint mobility, deep muscle flexibility, core balance, breath control, and mental recovery.",
    how: "Vinyasa flow, deep static stretching, mobility drills, mindful breathing exercises, and guided restoration."
  },
];

export function Programs() {
  const [selectedProgram, setSelectedProgram] = useState<typeof programs[0] | null>(null);

  return (
    <section id="programs" className="relative bg-secondary/30 py-24 md:py-32">
      <div className="mx-auto w-full max-w-none px-6 md:px-16">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeader
            eyebrow="Training Programs"
            title={<>Programs That <span className="text-gradient">Deliver Results.</span></>}
            subtitle="Six signature training tracks — each one designed and run by certified specialists."
          />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {programs.map((p) => (
            <article
              key={p.name}
              onClick={() => setSelectedProgram(p)}
              className="group relative overflow-hidden rounded-sm border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary hover:shadow-card cursor-pointer"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={p.img}
                  alt={p.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-sm bg-background/80 px-2 py-1 text-[10px] font-medium uppercase tracking-widest backdrop-blur">
                  <Clock className="h-3 w-3 text-primary" /> {p.duration}
                </div>
              </div>
              <div className="relative -mt-12 p-5">
                <h3 className="font-display text-xl">{p.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary group-hover:text-primary-foreground transition-colors">
                  Learn more <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Program Detail Modal */}
      {selectedProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md transition-all duration-300">
          <div className="relative w-full max-w-lg bg-card border border-border rounded-sm shadow-glow overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
            {/* Header Image */}
            <div className="relative h-48 sm:h-56 overflow-hidden">
              <img
                src={selectedProgram.img}
                alt={selectedProgram.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
              <button
                onClick={() => setSelectedProgram(null)}
                className="absolute right-4 top-4 rounded-full bg-background/60 p-2 text-foreground hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer border border-border/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex rounded-sm bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary border border-primary/20">
                    {selectedProgram.duration}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
                    Level: {selectedProgram.level}
                  </span>
                </div>
                <h3 className="font-display text-2xl uppercase tracking-wide text-foreground">{selectedProgram.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{selectedProgram.desc}</p>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-border">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Dumbbell className="h-3.5 w-3.5" /> What You Will Train
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{selectedProgram.what}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5" /> How You Will Train
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{selectedProgram.how}</p>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-2 border-t border-border/50">
                <button
                  onClick={() => setSelectedProgram(null)}
                  className="px-4 py-2.5 rounded-sm text-xs font-semibold uppercase tracking-widest border border-border hover:border-foreground transition-colors cursor-pointer"
                >
                  Close
                </button>
                <a
                  href="#contact"
                  onClick={() => setSelectedProgram(null)}
                  className="px-6 py-2.5 rounded-sm text-xs font-semibold uppercase tracking-widest bg-primary text-primary-foreground hover:shadow-glow transition-all text-center"
                >
                  Start Program
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}