import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import g1 from "@/assets/gym-interior.jpg";
import g2 from "@/assets/program-weights.jpg";
import g3 from "@/assets/program-cardio.jpg";
import g4 from "@/assets/program-crossfit.jpg";
import g5 from "@/assets/program-functional.jpg";
import g6 from "@/assets/program-personal.jpg";
import g7 from "@/assets/hero-gym.jpg";
import g8 from "@/assets/program-yoga.jpg";

const defaultImages = [
  { src: g1, label: "The Floor", span: "lg:col-span-2 lg:row-span-2" },
  { src: g2, label: "Strength Area", span: "" },
  { src: g3, label: "Cardio Zone", span: "" },
  { src: g4, label: "CrossFit Box", span: "lg:col-span-2" },
  { src: g5, label: "Functional Rig", span: "" },
  { src: g6, label: "Personal Training", span: "" },
  { src: g7, label: "Heavy Iron", span: "lg:col-span-2 lg:row-span-2" },
  { src: g8, label: "Recovery Studio", span: "lg:col-span-2" },
];

export function Gallery() {
  const [open, setOpen] = useState<string | null>(null);
  const [imagesList, setImagesList] = useState(defaultImages);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "config", "gallery"),
      (snapshot) => {
        if (snapshot.exists() && Array.isArray(snapshot.data()?.images) && snapshot.data().images.length > 0) {
          setImagesList(snapshot.data().images);
        }
      },
      (error) => {
        console.error("Error fetching live gallery: ", error);
      }
    );
    return () => unsubscribe();
  }, []);

  return (
    <section id="gallery" className="py-24 md:py-32">
      <div className="mx-auto w-full max-w-none px-6 md:px-16">
        <SectionHeader
          center
          eyebrow="Gallery"
          title={<>Inside The <span className="text-gradient">Forge.</span></>}
          subtitle="Take a look around. 25,000 sq ft of premium equipment, dedicated zones, and zero compromises."
        />
        <div className="grid auto-rows-[180px] grid-cols-2 gap-3 lg:grid-cols-4">
          {imagesList.map((img, i) => (
            <button
              key={i}
              onClick={() => setOpen(img.src)}
              className={`group relative overflow-hidden rounded-sm ${img.span || ""}`}
            >
              <img
                src={img.src}
                alt={img.label}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-background/30 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="absolute bottom-3 left-3 translate-y-2 text-xs font-semibold uppercase tracking-widest text-foreground opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                {img.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-background/95 p-4 backdrop-blur"
          onClick={() => setOpen(null)}
        >
          <button
            onClick={() => setOpen(null)}
            className="absolute right-6 top-6 rounded-full border border-border bg-card p-2 hover:border-primary hover:text-primary"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <img src={open} alt="" className="max-h-[90vh] max-w-[95vw] rounded-sm object-contain" />
        </div>
      )}
    </section>
  );
}