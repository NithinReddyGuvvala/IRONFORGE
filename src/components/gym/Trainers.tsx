import { useState } from "react";
import { AtSign, Hash, Award, X, Users, Calendar, CheckCircle } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { auth } from "@/lib/firebase";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import t1 from "@/assets/trainer-1.jpg";
import t2 from "@/assets/trainer-2.jpg";
import t3 from "@/assets/trainer-3.jpg";
import t4 from "@/assets/trainer-4.jpg";

const trainers = [
  { 
    img: t1, 
    name: "Marcus Stone", 
    spec: "Strength & Hypertrophy", 
    years: 12, 
    cert: "NSCA-CSCS, USAW L2",
    joinedDate: "March 2018",
    clientsCount: "250+ clients transformed",
    bio: "Marcus specializes in elite strength development and bodybuilding. With over a decade of personal coaching experience, he focuses on progressive overload, movement biomechanics, and periodized training routines.",
    motto: "Lift heavy, lift smart, and stay relentless."
  },
  { 
    img: t2, 
    name: "Elena Reyes", 
    spec: "Fat Loss & Conditioning", 
    years: 8, 
    cert: "NASM-CPT, PN1",
    joinedDate: "November 2020",
    clientsCount: "180+ clients transformed",
    bio: "Elena combines high-intensity interval conditioning with evidence-based nutrition strategies. She helps clients burn fat, optimize metabolic rates, and build sustainable healthy habits.",
    motto: "Consistent effort beats occasional intensity every single time."
  },
  { 
    img: t3, 
    name: "Viktor Kozlov", 
    spec: "CrossFit & Olympic Lifting", 
    years: 10, 
    cert: "CF-L3, USAW L1",
    joinedDate: "July 2021",
    clientsCount: "150+ athletes coached",
    bio: "Viktor is an active competitor and elite CrossFit coach. He focuses on complex barbell movements, gymnastic strength, and building athletic horsepower that transfers directly to high performance.",
    motto: "Master the fundamentals, dominate the barbell."
  },
  { 
    img: t4, 
    name: "Sarah Whitman", 
    spec: "Yoga & Mobility", 
    years: 14, 
    cert: "RYT-500, FRC-CMS",
    joinedDate: "September 2019",
    clientsCount: "320+ practitioners guided",
    bio: "Sarah teaches athletic mobility, joint health, and active flexibility. She works with lifters, runners, and everyday gym-goers to prevent injury, expand active range of motion, and accelerate recovery.",
    motto: "True fitness is the balance between raw power and fluid mobility."
  },
];

export function Trainers() {
  const [selectedTrainer, setSelectedTrainer] = useState<typeof trainers[0] | null>(null);
  const navigate = useNavigate();

  return (
    <section id="trainers" className="bg-secondary/30 py-24 md:py-32">
      <div className="mx-auto w-full max-w-none px-6 md:px-16">
        <SectionHeader
          center
          eyebrow="Our Coaches"
          title={<>Meet The <span className="text-gradient">Experts.</span></>}
          subtitle="World-class trainers in your corner — certified, experienced, relentlessly committed."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trainers.map((t) => (
            <article 
              key={t.name} 
              onClick={() => setSelectedTrainer(t)}
              className="group overflow-hidden rounded-sm border border-border bg-card cursor-pointer hover:border-primary transition-colors duration-300"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={t.img}
                  alt={t.name}
                  loading="lazy"
                  className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                />
                <div className="absolute inset-x-0 bottom-0 flex translate-y-full justify-center gap-2 bg-gradient-to-t from-card via-card/60 to-transparent p-4 transition-transform group-hover:translate-y-0">
                  <span className="text-xs uppercase font-semibold text-primary tracking-widest bg-background/90 px-3 py-1.5 rounded-sm border border-primary/20 backdrop-blur">
                    View Details
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display text-xl">{t.name}</h3>
                <p className="text-sm uppercase tracking-wider text-primary">{t.spec}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Award className="h-3.5 w-3.5 text-primary" /> {t.years} yrs · {t.cert.split(", ")[0]}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Coach Detail Modal */}
      {selectedTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md transition-all duration-300">
          <div className="relative w-full max-w-lg bg-card border border-border rounded-sm shadow-glow overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
            {/* Header Image */}
            <div className="relative h-64 overflow-hidden bg-secondary/10">
              <img
                src={selectedTrainer.img}
                alt={selectedTrainer.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/25 to-transparent" />
              <button
                onClick={() => setSelectedTrainer(null)}
                className="absolute right-4 top-4 rounded-full bg-background/60 p-2 text-foreground hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer border border-border/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-5">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {selectedTrainer.spec}
                </span>
                <h3 className="font-display text-2xl uppercase tracking-wide text-foreground mt-1">{selectedTrainer.name}</h3>
                <p className="text-xs italic text-muted-foreground mt-2">"{selectedTrainer.motto}"</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {selectedTrainer.bio}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 py-4 border-y border-border/50 text-center">
                <div className="space-y-1">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Experience</div>
                  <div className="text-xs font-bold text-foreground flex items-center justify-center gap-1">
                    <Award className="h-4 w-4 text-primary" /> {selectedTrainer.years} Years
                  </div>
                </div>
                <div className="space-y-1 border-x border-border/30">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Trained</div>
                  <div className="text-xs font-bold text-foreground flex items-center justify-center gap-1">
                    <Users className="h-4 w-4 text-primary" /> {selectedTrainer.clientsCount.split(" ")[0]}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Joined Forge</div>
                  <div className="text-xs font-bold text-foreground flex items-center justify-center gap-1">
                    <Calendar className="h-4 w-4 text-primary" /> {selectedTrainer.joinedDate.split(" ")[0]}
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Certifications & Specialties</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTrainer.cert.split(", ").map((c) => (
                    <span key={c} className="inline-flex items-center gap-1 rounded-sm bg-secondary px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-foreground border border-border">
                      <CheckCircle className="h-3 w-3 text-green-500" /> {c}
                    </span>
                  ))}
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  Full Join Date: {selectedTrainer.joinedDate} · Status: Active Forge Coach
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-border/50">
                <button
                  onClick={() => setSelectedTrainer(null)}
                  className="px-4 py-2.5 rounded-sm text-xs font-semibold uppercase tracking-widest border border-border hover:border-foreground transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    const coachName = selectedTrainer.name;
                    setSelectedTrainer(null);
                    if (!auth.currentUser) {
                      toast.error(`Please sign in or register to book a session.`);
                      navigate({ to: "/login" });
                      return;
                    }
                    window.dispatchEvent(
                      new CustomEvent("open-checkout", {
                        detail: {
                          type: "session",
                          name: coachName,
                          price: 15.00, // small booking fee
                        },
                      })
                    );
                  }}
                  className="px-6 py-2.5 rounded-sm text-xs font-semibold uppercase tracking-widest bg-primary text-primary-foreground hover:shadow-glow transition-all text-center cursor-pointer"
                >
                  Book 1-on-1 Session ($15)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}