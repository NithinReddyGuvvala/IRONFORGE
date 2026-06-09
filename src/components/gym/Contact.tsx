import { useState } from "react";
import { MapPin, Phone, Mail, Send, AtSign, Hash, Share2, Globe, Loader2 } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export function Contact() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("I'm interested in a free trial");
  const [goals, setGoals] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!auth.currentUser) {
      toast.error("Please sign in or register to send a message.");
      navigate({ to: "/login" });
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "contacts"), {
        name,
        email,
        phone,
        interest,
        goals,
        processed: false,
        createdAt: serverTimestamp(),
      });

      setSent(true);
      setPhone("");
      setName("");
      setEmail("");
      setGoals("");
      setInterest("I'm interested in a free trial");
      toast.success("Thank you! Your message has been sent successfully.");
      setTimeout(() => setSent(false), 3000);
    } catch (error) {
      console.error("Error saving message: ", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="bg-secondary/30 py-24 md:py-32">
      <div className="mx-auto w-full max-w-none px-6 md:px-16">
        <SectionHeader
          center
          eyebrow="Contact"
          title={<>Ready To <span className="text-gradient">Start?</span></>}
          subtitle="Drop in, call, or send a message. Free trial sessions booked daily."
        />
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="space-y-5 lg:col-span-2">
            {[
              { i: MapPin, t: "Location", v: "1845 Industrial Blvd, Brooklyn NY 11215" },
              { i: Phone, t: "Phone", v: "+1 (555) 123-FORGE" },
              { i: Mail, t: "Email", v: "hello@ironforge.gym" },
            ].map((c) => (
              <div key={c.t} className="flex gap-4 rounded-sm border border-border bg-card p-5">
                <c.i className="h-6 w-6 shrink-0 text-primary" />
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.t}</div>
                  <div className="mt-1 font-medium">{c.v}</div>
                </div>
              </div>
            ))}
            <div className="overflow-hidden rounded-sm border border-border">
              <iframe
                title="Map"
                src="https://www.openstreetmap.org/export/embed.html?bbox=-73.99%2C40.66%2C-73.97%2C40.68&layer=mapnik"
                className="h-56 w-full grayscale"
                loading="lazy"
              />
            </div>
            <div className="flex gap-3">
              {[AtSign, Hash, Share2, Globe].map((Ic, k) => (
                <a key={k} href="#" className="flex h-10 w-10 items-center justify-center rounded-sm border border-border bg-card hover:border-primary hover:text-primary">
                  <Ic className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-sm border border-border bg-card p-6 shadow-card lg:col-span-3 md:p-8"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                required
                name="name"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-sm border border-border bg-background px-4 py-3 focus:border-primary focus:outline-none"
              />
              <input
                required
                name="email"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-sm border border-border bg-background px-4 py-3 focus:border-primary focus:outline-none"
              />
            </div>
            <input
              required
              name="phone"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]{10,}"
              minLength={10}
              title="Phone number must be at least 10 digits"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              className="w-full rounded-sm border border-border bg-background px-4 py-3 focus:border-primary focus:outline-none"
            />
            <select
              name="interest"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              className="w-full rounded-sm border border-border bg-background px-4 py-3 focus:border-primary focus:outline-none"
            >
              <option>I'm interested in a free trial</option>
              <option>Membership pricing</option>
              <option>Personal training</option>
              <option>Group classes</option>
              <option>Body transformation program</option>
            </select>
            <textarea
              name="goals"
              rows={5}
              placeholder="Tell us about your goals..."
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              className="w-full resize-none rounded-sm border border-border bg-background px-4 py-3 focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-sm bg-primary px-7 py-3.5 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-all hover:shadow-glow disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                </>
              ) : sent ? (
                <>
                  <Send className="h-4 w-4" /> Message Sent
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}