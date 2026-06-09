import { Dumbbell, AtSign, Hash, Share2, Globe, Send } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto w-full max-w-none px-6 py-16 md:px-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <a href="#home" className="flex items-center gap-2 font-display text-2xl tracking-widest">
              <Dumbbell className="h-6 w-6 text-primary" />
              IRON<span className="text-primary">FORGE</span>
            </a>
            <p className="mt-4 text-sm text-muted-foreground">
              Premium 24/7 strength & conditioning gym. Transform your body. Transform your life.
            </p>
            <div className="mt-5 flex gap-2">
              {[AtSign, Hash, Share2, Globe].map((Ic, k) => (
                <a key={k} href="#" className="flex h-9 w-9 items-center justify-center rounded-sm border border-border hover:border-primary hover:text-primary">
                  <Ic className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {[
            { t: "Quick Links", l: ["Home", "About", "Programs", "Pricing", "Contact"] },
            { t: "Services", l: ["Personal Training", "Group Classes", "Nutrition", "Recovery", "Transformation"] },
            { t: "Membership", l: ["Basic — $29/mo", "Standard — $59/mo", "Premium — $119/mo", "Day Pass — $15", "Free Trial"] },
          ].map((col) => (
            <div key={col.t}>
              <h4 className="font-display text-sm uppercase tracking-widest text-foreground">{col.t}</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {col.l.map((x) => (
                  <li key={x}><a href="#" className="hover:text-primary">{x}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 md:flex-row md:items-center">
          <form onSubmit={(e) => e.preventDefault()} className="flex w-full max-w-md gap-2">
            <input
              type="email" required placeholder="Subscribe to our newsletter"
              className="w-full rounded-sm border border-border bg-card px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
            <button className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground">
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              © {new Date().getFullYear()} IRONFORGE Gym. All rights reserved.
            </p>
            <a href="/login" className="text-[10px] uppercase tracking-widest text-muted-foreground/30 hover:text-primary transition-colors">
              Admin Portal
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}