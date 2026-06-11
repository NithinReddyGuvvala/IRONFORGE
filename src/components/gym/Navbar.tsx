import { useEffect, useState } from "react";
import { Menu, X, Dumbbell } from "lucide-react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const links = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#programs", label: "Programs" },
  { href: "#pricing", label: "Pricing" },
  { href: "#trainers", label: "Trainers" },
  { href: "#gallery", label: "Gallery" },
  { href: "#bmi", label: "BMI" },
  { href: "#reviews", label: "Reviews" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usr) => {
      setUser(usr);
      if (usr) {
        // Direct email checks
        const isEmailAdmin =
          usr.email === "admin@ironforge.gym" ||
          usr.email === "nithinreddyguvvala@gmail.com" ||
          usr.email?.endsWith("@ironforge.gym");

        if (isEmailAdmin) {
          setIsAdmin(true);
        } else {
          try {
            const userDoc = await getDoc(doc(db, "users", usr.uid));
            if (userDoc.exists() && userDoc.data()?.role === "admin") {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
            }
          } catch (e) {
            console.error("Error checking admin status in navbar:", e);
            setIsAdmin(false);
          }
        }
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/85 backdrop-blur-md border-b border-border" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 w-full max-w-none items-center justify-between px-6 md:px-16">
        <a href="#home" className="flex items-center gap-2 font-display text-xl tracking-widest">
          <Dumbbell className="h-6 w-6 text-primary" />
          <span>IRON<span className="text-primary">FORGE</span></span>
        </a>
        <ul className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="hidden items-center gap-5 lg:flex">
          {user ? (
            <>
              {isAdmin && (
                <a
                  href="/admin"
                  className="text-sm font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                >
                  Admin
                </a>
              )}
              <button
                onClick={handleSignOut}
                className="rounded-sm bg-secondary border border-border px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-foreground hover:border-primary transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <a
                href="/login"
                className="text-sm font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
              >
                Login
              </a>
              <a
                href="#contact"
                className="rounded-sm bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-transform hover:scale-105 hover:shadow-glow"
              >
                Join Now
              </a>
            </>
          )}
        </div>
        <button
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className="rounded-sm border border-border p-2 lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>
      {open && (
        <div className="border-t border-border bg-background/95 backdrop-blur-md lg:hidden">
          <ul className="flex flex-col gap-1 p-4">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-sm px-3 py-2 text-sm uppercase tracking-wider text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  {l.label}
                </a>
              </li>
            ))}
            {user ? (
              <>
                {isAdmin && (
                  <li>
                    <a
                      href="/admin"
                      onClick={() => setOpen(false)}
                      className="block rounded-sm px-3 py-2 text-sm uppercase tracking-wider text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      Admin Panel
                    </a>
                  </li>
                )}
                <li>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setOpen(false);
                    }}
                    className="mt-2 block w-full rounded-sm bg-secondary border border-border px-3 py-2.5 text-center text-sm font-semibold uppercase tracking-wider text-foreground"
                  >
                    Sign Out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <a
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="block rounded-sm px-3 py-2 text-sm uppercase tracking-wider text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    Login
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    onClick={() => setOpen(false)}
                    className="mt-2 block rounded-sm bg-primary px-3 py-2.5 text-center text-sm font-semibold uppercase tracking-wider text-primary-foreground"
                  >
                    Join Now
                  </a>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}