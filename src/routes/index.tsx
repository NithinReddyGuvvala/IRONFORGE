import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/gym/Navbar";
import { Hero } from "@/components/gym/Hero";
import { About } from "@/components/gym/About";
import { Programs } from "@/components/gym/Programs";
import { Pricing } from "@/components/gym/Pricing";
import { Trainers } from "@/components/gym/Trainers";
import { Gallery } from "@/components/gym/Gallery";
import { Equipment } from "@/components/gym/Equipment";
import { Stats } from "@/components/gym/Stats";
import { Testimonials } from "@/components/gym/Testimonials";
import { BMI } from "@/components/gym/BMI";
import { FAQ } from "@/components/gym/FAQ";
import { Contact } from "@/components/gym/Contact";
import { Reviews } from "@/components/gym/Reviews";
import { Footer } from "@/components/gym/Footer";
import { ScrollTop } from "@/components/gym/ScrollTop";
import { CheckoutModal } from "@/components/gym/CheckoutModal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IRONFORGE — Transform Your Body, Transform Your Life" },
      { name: "description", content: "Premium 24/7 gym in Brooklyn. Expert trainers, modern equipment, proven programs. Free trial available." },
      { property: "og:title", content: "IRONFORGE — Premium 24/7 Gym" },
      { property: "og:description", content: "Strength, conditioning, transformation. Join the relentless." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Stats />
        <Programs />
        <Pricing />
        <Trainers />
        <Gallery />
        <Equipment />
        <Testimonials />
        <BMI />
        <FAQ />
        <Reviews />
        <Contact />
      </main>
      <Footer />
      <ScrollTop />
      <CheckoutModal />
    </div>
  );
}
