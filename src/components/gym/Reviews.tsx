import { useState, useEffect, useRef } from "react";
import { Star, Send, Loader2, UserCircle2, CheckCircle2 } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

interface Review {
  id: string;
  uid: string;
  name: string;
  rating: number;
  message: string;
  createdAt: Timestamp | null;
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          className="focus:outline-none cursor-pointer"
        >
          <Star
            className={`h-7 w-7 transition-colors ${
              s <= (hover || value)
                ? "fill-primary text-primary"
                : "text-border"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-4 w-4 ${
            s <= value ? "fill-primary text-primary" : "text-border"
          }`}
        />
      ))}
    </div>
  );
}

export function Reviews() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Ref to scroll to the review cards grid after submission
  const gridRef = useRef<HTMLDivElement>(null);

  // Sync auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setCurrentUser(usr);
    });
    return () => unsubscribe();
  }, []);

  // Fetch all reviews for overall metrics
  useEffect(() => {
    const q = query(collection(db, "reviews"));
    const unsub = onSnapshot(q, (snap) => {
      setAllReviews(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Review, "id">) }))
      );
    });
    return () => unsub();
  }, []);

  // Fetch only current user's reviews for their personal dashboard grid
  useEffect(() => {
    if (!currentUser) {
      setUserReviews([]);
      return;
    }
    const q = query(collection(db, "reviews"), where("uid", "==", currentUser.uid));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Review, "id">) }));
      docs.sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return timeB - timeA;
      });
      setUserReviews(docs);
    });
    return () => unsub();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      toast.error("Please sign in to leave a review.");
      navigate({ to: "/login" });
      return;
    }
    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }
    if (message.trim().length < 3) {
      toast.error("Please write at least 3 characters in your review.");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "reviews"), {
        uid: auth.currentUser.uid,
        name: auth.currentUser.displayName || auth.currentUser.email || "Member",
        rating,
        message: message.trim(),
        createdAt: serverTimestamp(),
      });

      // Reset form
      setRating(0);
      setMessage("");

      // Show success flash
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3500);

      toast.success("Thank you for your review! 🎉");

      // Scroll to the review cards grid so the user sees their new card
      setTimeout(() => {
        gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const avgRating =
    allReviews.length > 0
      ? (allReviews.reduce((a, r) => a + r.rating, 0) / allReviews.length).toFixed(1)
      : null;

  const formatDate = (ts: Timestamp | null) => {
    if (!ts) return "";
    return ts.toDate().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <section id="reviews" className="bg-background py-24 md:py-32">
      <div className="mx-auto w-full max-w-none px-6 md:px-16 space-y-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end gap-6 justify-between">
          <SectionHeader
            eyebrow="Reviews"
            title={
              <>
                What Our <span className="text-gradient">Members Say</span>
              </>
            }
            subtitle="Real experiences from real athletes. Unfiltered and honest."
          />
          {avgRating && (
            <div className="flex items-center gap-3 bg-card border border-border rounded-sm px-5 py-3 shrink-0">
              <span className="font-display text-4xl text-primary">{avgRating}</span>
              <div className="space-y-1">
                <StarDisplay value={Math.round(Number(avgRating))} />
                <p className="text-xs text-muted-foreground font-mono">
                  {allReviews.length} review{allReviews.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Review Cards Grid — ref used for scroll-to after submit */}
        <div ref={gridRef}>
          {userReviews.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {userReviews.slice(0, 9).map((r, idx) => (
                <div
                  key={r.id}
                  className={`flex flex-col gap-3 rounded-sm border bg-card p-5 hover:border-primary/40 transition-all ${
                    idx === 0 && submitted
                      ? "border-primary shadow-glow scale-[1.01]"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <UserCircle2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground leading-tight">
                          {r.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {formatDate(r.createdAt)}
                        </p>
                      </div>
                    </div>
                    <StarDisplay value={r.rating} />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                    "{r.message}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Review Form */}
        <div className="max-w-2xl mx-auto">
          {submitted ? (
            /* Success flash card */
            <div className="rounded-sm border border-primary/40 bg-primary/5 p-8 flex flex-col items-center gap-4 text-center animate-in fade-in zoom-in duration-300">
              <div className="rounded-full bg-primary/10 p-4 border border-primary/20">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-xl uppercase tracking-wider">Review Submitted!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Thanks for sharing your experience. Your review is now live above. ⭐
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-sm border border-border bg-card p-6 md:p-8 space-y-5">
              <div className="border-b border-border pb-4">
                <h3 className="font-display text-lg uppercase tracking-wider">
                  Leave a Review
                </h3>
                <p className="text-xs text-muted-foreground mt-1 font-mono">
                  Share your experience with Iron Forge Gym
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
                    Your Rating
                  </span>
                  <StarPicker value={rating} onChange={setRating} />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
                    Your Review
                  </span>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your experience — the trainers, facilities, results..."
                    className="w-full resize-none rounded-sm border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-sm bg-primary px-7 py-3.5 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-all hover:shadow-glow disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Submit Review
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
