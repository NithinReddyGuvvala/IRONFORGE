import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import heroImg from "@/assets/hero-gym.jpg";

export function Hero() {
  return (
    <section
      id="home"
      className="relative isolate flex min-h-screen items-center overflow-hidden pt-16"
    >
      <img
        src={heroImg}
        alt="Athlete training with heavy barbell in dramatic gym"
        width={1920}
        height={1280}
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/85 to-background/40" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-transparent to-background/40" />

      <div className="mx-auto w-full max-w-none px-6 py-20 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <span className="inline-block rounded-sm border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            #1 Premium Fitness Studio
          </span>
          <h1 className="mt-6 font-display text-5xl leading-[0.95] sm:text-6xl md:text-7xl lg:text-8xl">
            Transform Your <span className="text-gradient">Body.</span>
            <br />
            Transform Your <span className="text-gradient">Life.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
            Train at IRONFORGE — where elite coaches, modern equipment, and a
            relentless community push you past every limit. 24/7 access. Results
            guaranteed.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#pricing"
              className="group inline-flex items-center gap-2 rounded-sm bg-primary px-7 py-4 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-all hover:shadow-glow"
            >
              Join Now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-sm border border-border bg-background/40 px-7 py-4 text-sm font-semibold uppercase tracking-widest backdrop-blur transition-colors hover:border-primary hover:text-primary"
            >
              Book Free Trial
            </a>
            <a
              href="#about"
              className="inline-flex items-center gap-2 px-2 py-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border">
                <Play className="h-3.5 w-3.5 fill-current" />
              </span>
              Watch Story
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 grid max-w-2xl grid-cols-3 gap-6 border-t border-border pt-8"
        >
          {[
            { v: "15+", l: "Years" },
            { v: "12K+", l: "Members" },
            { v: "50+", l: "Trainers" },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-display text-3xl text-primary md:text-4xl">{s.v}</div>
              <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                {s.l}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}