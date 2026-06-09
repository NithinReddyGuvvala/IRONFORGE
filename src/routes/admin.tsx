import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { collection, query, orderBy, getDocs, deleteDoc, doc, getDoc, setDoc, updateDoc, DocumentData } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { Dumbbell, LogOut, ArrowLeft, Trash2, Calendar, Search, Shield, RefreshCw, Loader2, Check, Plus, Star, MessageSquare, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
});

interface Submission extends DocumentData {
  id: string;
  name: string;
  email: string;
  phone: string;
  interest: string;
  goals: string;
  createdAt: any;
}

const defaultPlans = [
  {
    name: "Basic",
    tag: "Starter",
    monthly: 29,
    yearly: 290,
    features: [
      "Full gym access (6am–10pm)",
      "Locker & shower facilities",
      "Free fitness assessment",
      "Mobile app workouts",
      "1 guest pass / month",
    ],
  },
  {
    name: "Standard",
    tag: "Most Popular",
    monthly: 59,
    yearly: 590,
    highlight: true,
    features: [
      "24/7 gym access",
      "All group classes included",
      "Personalized workout plan",
      "Weekly progress tracking",
      "Nutrition guidance",
      "4 guest passes / month",
    ],
  },
  {
    name: "Premium",
    tag: "Elite",
    monthly: 119,
    yearly: 1190,
    features: [
      "Everything in Standard",
      "8x Personal Training sessions",
      "Custom diet & meal plans",
      "Advanced body composition scan",
      "Recovery suite (sauna, ice bath)",
      "Priority booking & support",
    ],
  },
];

const defaultGalleryImages = [
  { src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80", label: "The Floor", span: "lg:col-span-2 lg:row-span-2" },
  { src: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80", label: "Strength Area", span: "" },
  { src: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80", label: "Cardio Zone", span: "" },
  { src: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80", label: "CrossFit Box", span: "lg:col-span-2" },
  { src: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80", label: "Functional Rig", span: "" },
  { src: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80", label: "Personal Training", span: "" },
  { src: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=800&q=80", label: "Heavy Iron", span: "lg:col-span-2 lg:row-span-2" },
  { src: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80", label: "Recovery Studio", span: "lg:col-span-2" },
];

function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"submissions" | "users" | "pricing" | "gallery" | "messages" | "reviews">("messages");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [plansList, setPlansList] = useState<any[]>(defaultPlans);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [savingPricing, setSavingPricing] = useState(false);

  const [galleryList, setGalleryList] = useState<any[]>(defaultGalleryImages);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [savingGallery, setSavingGallery] = useState(false);
  const [newImgSrc, setNewImgSrc] = useState("");
  const [newImgLabel, setNewImgLabel] = useState("");
  const [newImgSpan, setNewImgSpan] = useState("");

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPackage, setFilterPackage] = useState<string>("all");
  const [sortByJoinDate, setSortByJoinDate] = useState<"desc" | "asc">("desc");
  const [reviewSort, setReviewSort] = useState<"desc" | "asc">("desc");
  const [msgFilter, setMsgFilter] = useState<"all" | "pending" | "done">("all");

  // Track auth state and verify admin role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usr) => {
      setCurrentUser(usr);
      if (usr) {
        // Direct fast email checks
        const isEmailAdmin =
          usr.email === "admin@ironforge.gym" ||
          usr.email === "nithinreddyguvvala@gmail.com" ||
          usr.email?.endsWith("@ironforge.gym");

        if (isEmailAdmin) {
          setIsAdmin(true);
          setAuthChecking(false);
        } else {
          // Double check with Firestore role
          try {
            const userDoc = await getDoc(doc(db, "users", usr.uid));
            if (userDoc.exists() && userDoc.data()?.role === "admin") {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
            }
          } catch (e) {
            console.error("Error verifying admin role:", e);
            setIsAdmin(false);
          } finally {
            setAuthChecking(false);
          }
        }
      } else {
        setIsAdmin(false);
        setAuthChecking(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch submissions
  const fetchSubmissions = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const q = query(collection(db, "contacts"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data: Submission[] = [];
      querySnapshot.forEach((docSnapshot) => {
        data.push({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        } as Submission);
      });
      setSubmissions(data);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load submissions from database.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch registered users
  const fetchUsers = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data: any[] = [];
      querySnapshot.forEach((docSnapshot) => {
        data.push({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        });
      });
      setUsers(data);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load registered users from database.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch pricing config
  const fetchPricing = async () => {
    setPricingLoading(true);
    try {
      const docRef = doc(db, "config", "pricing");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && Array.isArray(docSnap.data()?.plans) && docSnap.data().plans.length > 0) {
        setPlansList(docSnap.data().plans);
      } else {
        // Fallback to default
        setPlansList(defaultPlans);
      }
    } catch (err) {
      console.error("Error loading pricing: ", err);
      toast.error("Failed to load pricing plans.");
    } finally {
      setPricingLoading(false);
    }
  };

  const handleUpdatePlanField = (index: number, field: string, value: any) => {
    setPlansList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleUpdateFeature = (planIndex: number, featureIndex: number, value: string) => {
    setPlansList((prev) => {
      const updated = [...prev];
      const updatedFeatures = [...updated[planIndex].features];
      updatedFeatures[featureIndex] = value;
      updated[planIndex] = { ...updated[planIndex], features: updatedFeatures };
      return updated;
    });
  };

  const handleDeleteFeature = (planIndex: number, featureIndex: number) => {
    setPlansList((prev) => {
      const updated = [...prev];
      const updatedFeatures = updated[planIndex].features.filter((_: any, idx: number) => idx !== featureIndex);
      updated[planIndex] = { ...updated[planIndex], features: updatedFeatures };
      return updated;
    });
  };

  const handleAddFeature = (planIndex: number) => {
    setPlansList((prev) => {
      const updated = [...prev];
      const updatedFeatures = [...updated[planIndex].features, ""];
      updated[planIndex] = { ...updated[planIndex], features: updatedFeatures };
      return updated;
    });
  };

  const handleSavePricing = async () => {
    setSavingPricing(true);
    try {
      await setDoc(doc(db, "config", "pricing"), {
        plans: plansList,
        updatedAt: new Date()
      });
      toast.success("Pricing and plans updated successfully!");
    } catch (err) {
      console.error("Error saving pricing: ", err);
      toast.error("Failed to save pricing configurations.");
    } finally {
      setSavingPricing(false);
    }
  };

  // Fetch gallery config
  const fetchGallery = async () => {
    setGalleryLoading(true);
    try {
      const docRef = doc(db, "config", "gallery");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && Array.isArray(docSnap.data()?.images) && docSnap.data().images.length > 0) {
        setGalleryList(docSnap.data().images);
      } else {
        setGalleryList(defaultGalleryImages);
      }
    } catch (err) {
      console.error("Error loading gallery: ", err);
      toast.error("Failed to load gallery images.");
    } finally {
      setGalleryLoading(false);
    }
  };

  const handleUpdateGalleryField = (index: number, field: string, value: string) => {
    setGalleryList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleDeleteGalleryItem = (index: number) => {
    setGalleryList((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImgSrc || !newImgLabel) {
      toast.error("Please provide both an Image URL and a Label.");
      return;
    }
    setGalleryList((prev) => [
      ...prev,
      { src: newImgSrc, label: newImgLabel, span: newImgSpan }
    ]);
    setNewImgSrc("");
    setNewImgLabel("");
    setNewImgSpan("");
    toast.success("Image added to list. Remember to save changes!");
  };

  const handleSaveGallery = async () => {
    setSavingGallery(true);
    try {
      await setDoc(doc(db, "config", "gallery"), {
        images: galleryList,
        updatedAt: new Date()
      });
      toast.success("Gallery images updated successfully!");
    } catch (err) {
      console.error("Error saving gallery: ", err);
      toast.error("Failed to save gallery configurations.");
    } finally {
      setSavingGallery(false);
    }
  };

  // Fetch contact messages
  const fetchContacts = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const q = query(collection(db, "contacts"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setContacts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load contact messages.");
    } finally { setLoading(false); }
  };

  // Fetch reviews
  const fetchReviews = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reviews.");
    } finally { setLoading(false); }
  };

  // Mark contact message as processed
  const handleProcessContact = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, "contacts", id), { processed: !current });
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, processed: !current } : c))
      );
      toast.success(current ? "Marked as pending." : "Message marked as processed ✓");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update message status.");
    }
  };

  // Delete review
  const handleDeleteReview = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    try {
      await deleteDoc(doc(db, "reviews", id));
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success("Review deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete review.");
    }
  };

  useEffect(() => {
    if (currentUser && isAdmin) {
      fetchSubmissions();
      fetchUsers();
      fetchPricing();
      fetchGallery();
      fetchContacts();
      fetchReviews();
    }
  }, [currentUser, isAdmin]);

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this submission?")) return;
    try {
      await deleteDoc(doc(db, "contacts", id));
      toast.success("Submission deleted successfully.");
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete the submission.");
    }
  };

  // Handle delete user profile
  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user profile?")) return;
    try {
      await deleteDoc(doc(db, "users", id));
      toast.success("User profile deleted successfully.");
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete user profile.");
    }
  };

  // Handle updating user profile fields directly
  const handleUpdateUserField = async (userId: string, field: string, value: any) => {
    try {
      await setDoc(doc(db, "users", userId), { [field]: value }, { merge: true });
      toast.success(`User ${field} updated successfully.`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, [field]: value } : u))
      );
    } catch (err) {
      console.error("Error updating user field:", err);
      toast.error(`Failed to update user ${field}.`);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast.success("Logged out successfully.");
      navigate({ to: "/login" });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSubmissions = submissions
    .filter((s) => {
      const term = search.toLowerCase();
      return (
        (s.name || "").toLowerCase().includes(term) ||
        (s.email || "").toLowerCase().includes(term) ||
        (s.phone || "").toLowerCase().includes(term) ||
        (s.interest || "").toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      const dateA = a.createdAt?.toDate
        ? a.createdAt.toDate().getTime()
        : a.createdAt?.seconds
        ? a.createdAt.seconds * 1000
        : 0;
      const dateB = b.createdAt?.toDate
        ? b.createdAt.toDate().getTime()
        : b.createdAt?.seconds
        ? b.createdAt.seconds * 1000
        : 0;

      return sortByJoinDate === "desc" ? dateB - dateA : dateA - dateB;
    });

  const filteredUsers = users
    .filter((u) => {
      const term = search.toLowerCase();
      const matchesSearch =
        (u.name || "").toLowerCase().includes(term) ||
        (u.email || "").toLowerCase().includes(term) ||
        (u.phone || "").toLowerCase().includes(term) ||
        (u.provider || "").toLowerCase().includes(term);

      const userStatus = u.status || "Inactive";
      const matchesStatus =
        filterStatus === "all" || userStatus.toLowerCase() === filterStatus.toLowerCase();

      const userPackage = u.package || "None";
      const matchesPackage =
        filterPackage === "all" || userPackage.toLowerCase() === filterPackage.toLowerCase();

      return matchesSearch && matchesStatus && matchesPackage;
    })
    .sort((a, b) => {
      const dateA = a.createdAt?.toDate
        ? a.createdAt.toDate().getTime()
        : a.createdAt?.seconds
        ? a.createdAt.seconds * 1000
        : 0;
      const dateB = b.createdAt?.toDate
        ? b.createdAt.toDate().getTime()
        : b.createdAt?.seconds
        ? b.createdAt.seconds * 1000
        : 0;

      return sortByJoinDate === "desc" ? dateB - dateA : dateA - dateB;
    });

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-4">
          <Dumbbell className="h-12 w-12 text-primary animate-bounce mx-auto" />
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
        <div className="max-w-md w-full text-center border border-border p-8 rounded-sm bg-card shadow-card">
          <Shield className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="mt-4 text-2xl font-display font-bold uppercase tracking-wider text-foreground">Unauthorized Access</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You must be logged in as an administrator to view the submissions panel.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => navigate({ to: "/login" })}
              className="w-full py-3 text-sm font-semibold uppercase tracking-widest bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-all hover:shadow-glow"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate({ to: "/" })}
              className="w-full py-3 text-sm font-semibold uppercase tracking-widest border border-border text-foreground rounded-sm hover:border-primary transition-all"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      {/* Header bar */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto w-full max-w-none px-6 md:px-16 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-display text-xl uppercase tracking-widest">
              Forge <span className="text-primary">Admin</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate({ to: "/" })}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Home
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-xs font-semibold uppercase tracking-widest hover:border-primary hover:text-primary transition-all"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main dashboard body */}
      <main className="mx-auto w-full max-w-none px-6 md:px-16 mt-8">
        {/* Controls row */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold uppercase tracking-wider text-foreground">
              {activeTab === "messages"
                ? "Contact Messages"
                : activeTab === "reviews"
                ? "Member Reviews"
                : activeTab === "submissions"
                ? "Trial Registrations"
                : activeTab === "users"
                ? "Registered Users"
                : activeTab === "pricing"
                ? "Pricing & Offers"
                : "Gallery Manager"}
            </h1>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
              {activeTab === "messages"
                ? `${contacts.filter(c => !c.processed).length} unprocessed · ${contacts.length} total`
                : activeTab === "reviews"
                ? `${reviews.length} reviews · avg ${reviews.length ? (reviews.reduce((a,r)=>a+r.rating,0)/reviews.length).toFixed(1) : "—"} ★`
                : activeTab === "submissions"
                ? `Showing ${filteredSubmissions.length} of ${submissions.length} total registrations`
                : activeTab === "users"
                ? `Showing ${filteredUsers.length} of ${users.length} total users`
                : activeTab === "pricing"
                ? "Manage membership prices & tiers"
                : "Manage gallery slider images"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {activeTab === "users" && (
              <div className="flex flex-wrap gap-2">
                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-card border border-border text-foreground text-xs rounded-sm px-3 py-2.5 focus:border-primary focus:outline-none uppercase tracking-wider font-semibold"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                {/* Package Filter */}
                <select
                  value={filterPackage}
                  onChange={(e) => setFilterPackage(e.target.value)}
                  className="bg-card border border-border text-foreground text-xs rounded-sm px-3 py-2.5 focus:border-primary focus:outline-none uppercase tracking-wider font-semibold"
                >
                  <option value="all">All Packages</option>
                  <option value="none">No Package</option>
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                </select>

                {/* Sort Order */}
                <select
                  value={sortByJoinDate}
                  onChange={(e) => setSortByJoinDate(e.target.value as "desc" | "asc")}
                  className="bg-card border border-border text-foreground text-xs rounded-sm px-3 py-2.5 focus:border-primary focus:outline-none uppercase tracking-wider font-semibold"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            )}

            {activeTab === "submissions" && (
              <div className="flex flex-wrap gap-2">
                {/* Sort Order for Registrations */}
                <select
                  value={sortByJoinDate}
                  onChange={(e) => setSortByJoinDate(e.target.value as "desc" | "asc")}
                  className="bg-card border border-border text-foreground text-xs rounded-sm px-3 py-2.5 focus:border-primary focus:outline-none uppercase tracking-wider font-semibold"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            )}

            {/* Reviews sort */}
            {activeTab === "reviews" && (
              <select
                value={reviewSort}
                onChange={(e) => setReviewSort(e.target.value as "desc" | "asc")}
                className="bg-card border border-border text-foreground text-xs rounded-sm px-3 py-2.5 focus:border-primary focus:outline-none uppercase tracking-wider font-semibold"
              >
                <option value="desc">Recent First</option>
                <option value="asc">Oldest First</option>
              </select>
            )}

            {/* Messages filter */}
            {activeTab === "messages" && (
              <select
                value={msgFilter}
                onChange={(e) => setMsgFilter(e.target.value as any)}
                className="bg-card border border-border text-foreground text-xs rounded-sm px-3 py-2.5 focus:border-primary focus:outline-none uppercase tracking-wider font-semibold"
              >
                <option value="all">All Messages</option>
                <option value="pending">Pending Only</option>
                <option value="done">Processed Only</option>
              </select>
            )}

            {(activeTab === "submissions" || activeTab === "users") && (
              <div className="relative md:w-64">
                <Search className="absolute left-3.5 top-3 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={activeTab === "submissions" ? "Search registrations..." : "Search users..."}
                  className="w-full pl-10 pr-4 py-2 rounded-sm border border-border bg-card text-xs focus:border-primary focus:outline-none"
                />
              </div>
            )}

            {(activeTab === "submissions" || activeTab === "users" || activeTab === "messages" || activeTab === "reviews") && (
              <button
                onClick={() => {
                  if (activeTab === "submissions") fetchSubmissions();
                  else if (activeTab === "users") fetchUsers();
                  else if (activeTab === "messages") fetchContacts();
                  else fetchReviews();
                }}
                disabled={loading}
                className="flex h-9 w-9 items-center justify-center rounded-sm border border-border bg-card hover:border-primary hover:text-primary transition-all disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            )}
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap gap-6 border-b border-border mb-8">
          <button
            onClick={() => setActiveTab("messages")}
            className={`pb-4 text-sm font-semibold uppercase tracking-widest border-b-2 transition-all relative ${
              activeTab === "messages"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Messages ({contacts.length})
            {contacts.filter(c => !c.processed).length > 0 && (
              <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                {contacts.filter(c => !c.processed).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-4 text-sm font-semibold uppercase tracking-widest border-b-2 transition-all ${
              activeTab === "reviews"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab("submissions")}
            className={`pb-4 text-sm font-semibold uppercase tracking-widest border-b-2 transition-all relative ${
              activeTab === "submissions"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Registrations ({submissions.length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-4 text-sm font-semibold uppercase tracking-widest border-b-2 transition-all relative ${
              activeTab === "users"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("pricing")}
            className={`pb-4 text-sm font-semibold uppercase tracking-widest border-b-2 transition-all relative ${
              activeTab === "pricing"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Pricing & Offers
          </button>
          <button
            onClick={() => setActiveTab("gallery")}
            className={`pb-4 text-sm font-semibold uppercase tracking-widest border-b-2 transition-all relative ${
              activeTab === "gallery"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Gallery Manager
          </button>
        </div>

        {/* Data section */}
        {activeTab === "messages" ? (
          /* ── CONTACT MESSAGES TAB ── */
          loading && contacts.length === 0 ? (
            <div className="py-24 text-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground mt-3">Loading messages...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contacts
                .filter(c =>
                  msgFilter === "all" ? true :
                  msgFilter === "pending" ? !c.processed :
                  c.processed
                )
                .map((c) => {
                  const dateStr = c.createdAt?.toDate
                    ? c.createdAt.toDate().toLocaleString()
                    : c.createdAt?.seconds
                    ? new Date(c.createdAt.seconds * 1000).toLocaleString()
                    : "Just now";
                  return (
                    <div
                      key={c.id}
                      className={`flex flex-col md:flex-row gap-4 rounded-sm border p-5 transition-colors ${
                        c.processed
                          ? "border-border bg-secondary/10 opacity-60"
                          : "border-primary/30 bg-card shadow-sm"
                      }`}
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-foreground">{c.name}</span>
                          <span className="text-xs text-muted-foreground font-mono">{c.email}</span>
                          <span className="text-xs text-muted-foreground font-mono">{c.phone}</span>
                          <span className="text-[10px] uppercase tracking-widest font-semibold border border-primary/20 bg-primary/10 text-primary px-2 py-0.5 rounded-sm">{c.interest}</span>
                          {c.processed && <span className="text-[10px] uppercase tracking-widest font-semibold border border-green-500/20 bg-green-500/10 text-green-400 px-2 py-0.5 rounded-sm">✓ Processed</span>}
                        </div>
                        {c.goals && <p className="text-sm text-muted-foreground">{c.goals}</p>}
                        <p className="text-[10px] font-mono text-muted-foreground">{dateStr}</p>
                      </div>
                      <div className="flex md:flex-col gap-2 shrink-0">
                        <button
                          onClick={() => handleProcessContact(c.id, !!c.processed)}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-sm text-xs font-semibold uppercase tracking-widest transition-all border cursor-pointer ${
                            c.processed
                              ? "border-border text-muted-foreground hover:border-primary hover:text-primary"
                              : "border-green-500/40 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                          }`}
                          title={c.processed ? "Mark as pending" : "Mark as processed"}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {c.processed ? "Undo" : "Mark Done"}
                        </button>
                        <button
                          onClick={() => { if (confirm("Delete this message?")) deleteDoc(doc(db, "contacts", c.id)).then(() => { setContacts(prev => prev.filter(x => x.id !== c.id)); toast.success("Deleted."); }); }}
                          className="p-2 rounded-sm border border-border hover:border-destructive hover:text-destructive transition-all cursor-pointer"
                          title="Delete message"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              {contacts.filter(c =>
                msgFilter === "all" ? true :
                msgFilter === "pending" ? !c.processed : c.processed
              ).length === 0 && (
                <div className="py-24 text-center border border-dashed border-border rounded-sm bg-card/20">
                  <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No messages match this filter.</p>
                </div>
              )}
            </div>
          )
        ) : activeTab === "reviews" ? (
          /* ── REVIEWS TAB ── */
          loading && reviews.length === 0 ? (
            <div className="py-24 text-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground mt-3">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-border rounded-sm bg-card/20">
              <Star className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No reviews yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-border rounded-sm bg-card">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="border-b border-border bg-secondary/30 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Member</th>
                    <th className="px-6 py-4">Rating</th>
                    <th className="px-6 py-4">Review</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card/50">
                  {[...reviews]
                    .sort((a, b) => {
                      const tA = a.createdAt?.seconds ? a.createdAt.seconds : a.createdAt?.toDate ? a.createdAt.toDate().getTime()/1000 : 0;
                      const tB = b.createdAt?.seconds ? b.createdAt.seconds : b.createdAt?.toDate ? b.createdAt.toDate().getTime()/1000 : 0;
                      return reviewSort === "desc" ? tB - tA : tA - tB;
                    })
                    .map((r) => {
                      const dateStr = r.createdAt?.toDate
                        ? r.createdAt.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                        : r.createdAt?.seconds
                        ? new Date(r.createdAt.seconds * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                        : "—";
                      return (
                        <tr key={r.id} className="hover:bg-secondary/10 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground font-mono">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-primary" />{dateStr}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-semibold text-foreground">{r.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} className={`h-4 w-4 ${s <= r.rating ? "fill-primary text-primary" : "text-border"}`} />
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 max-w-sm">
                            <p className="text-sm text-muted-foreground line-clamp-2">{r.message}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => handleDeleteReview(r.id)}
                              className="text-muted-foreground hover:text-destructive p-1.5 rounded-sm hover:bg-destructive/10 transition-all"
                              title="Delete review"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )
        ) : activeTab === "submissions" ? (
          loading && submissions.length === 0 ? (
            <div className="py-24 text-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground mt-3">Fetching registrations...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-border rounded-sm bg-card/20">
              <p className="text-muted-foreground">No matching registrations found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-border rounded-sm bg-card">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="border-b border-border bg-secondary/30 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4">Submission Date</th>
                    <th className="px-6 py-4">Full Name</th>
                    <th className="px-6 py-4">Contact Details</th>
                    <th className="px-6 py-4">Interested In</th>
                    <th className="px-6 py-4">Fitness Goals</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card/50">
                  {filteredSubmissions.map((sub) => {
                    const dateStr = sub.createdAt?.toDate
                      ? sub.createdAt.toDate().toLocaleString()
                      : sub.createdAt?.seconds
                      ? new Date(sub.createdAt.seconds * 1000).toLocaleString()
                      : "Just now";

                    return (
                      <tr key={sub.id} className="hover:bg-secondary/10 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground font-mono">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            {dateStr}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-foreground">
                          {sub.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-0.5">
                            <div className="text-foreground">{sub.email}</div>
                            <div className="text-xs text-muted-foreground font-mono">{sub.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex rounded-sm bg-primary/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary border border-primary/20">
                            {sub.interest}
                          </span>
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate" title={sub.goals}>
                          {sub.goals || <span className="text-muted-foreground italic">None provided</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleDelete(sub.id)}
                            className="text-muted-foreground hover:text-destructive p-1.5 rounded-sm hover:bg-destructive/10 transition-all"
                            title="Delete submission"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : activeTab === "users" ? (
          loading && users.length === 0 ? (
            <div className="py-24 text-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground mt-3">Fetching users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-border rounded-sm bg-card/20">
              <p className="text-muted-foreground">No matching users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-border rounded-sm bg-card">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="border-b border-border bg-secondary/30 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4">Join Date</th>
                    <th className="px-6 py-4">Full Name</th>
                    <th className="px-6 py-4">Contact Details</th>
                    <th className="px-6 py-4">Provider</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Package</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card/50">
                  {filteredUsers.map((u) => {
                    const dateStr = u.createdAt?.toDate
                      ? u.createdAt.toDate().toLocaleString()
                      : u.createdAt?.seconds
                      ? new Date(u.createdAt.seconds * 1000).toLocaleString()
                      : "Just now";

                    return (
                      <tr key={u.id} className="hover:bg-secondary/10 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground font-mono">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            {dateStr}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-foreground">
                          {u.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-0.5">
                            <div className="text-foreground">{u.email}</div>
                            {u.phone && <div className="text-xs text-muted-foreground font-mono">{u.phone}</div>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex rounded-sm bg-secondary px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-foreground border border-border font-mono">
                            {u.provider || "email"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs">
                          <select
                            value={u.role || "customer"}
                            onChange={(e) => handleUpdateUserField(u.id, "role", e.target.value)}
                            className="bg-background border border-border text-foreground text-xs rounded-sm px-2 py-1 focus:border-primary focus:outline-none"
                          >
                            <option value="customer">Customer</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs">
                          <select
                            value={u.package || "None"}
                            onChange={(e) => handleUpdateUserField(u.id, "package", e.target.value)}
                            className="bg-background border border-border text-foreground text-xs rounded-sm px-2 py-1 focus:border-primary focus:outline-none font-semibold text-primary"
                          >
                            <option value="None">None</option>
                            <option value="Basic">Basic</option>
                            <option value="Standard">Standard</option>
                            <option value="Premium">Premium</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs">
                          <select
                            value={u.status || "Inactive"}
                            onChange={(e) => handleUpdateUserField(u.id, "status", e.target.value)}
                            className={`bg-background border border-border text-xs rounded-sm px-2 py-1 focus:border-primary focus:outline-none font-semibold ${
                              (u.status || "Inactive") === "Active" ? "text-green-500" : "text-destructive"
                            }`}
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-muted-foreground hover:text-destructive p-1.5 rounded-sm hover:bg-destructive/10 transition-all cursor-pointer"
                            title="Delete user profile"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : activeTab === "pricing" ? (
          // Pricing Editor
          pricingLoading ? (
            <div className="py-24 text-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground mt-3">Fetching pricing details...</p>
            </div>
          ) : (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center bg-card border border-border p-6 rounded-sm">
                <div>
                  <h2 className="text-lg font-semibold uppercase tracking-wide">Manage Gym Offers & Memberships</h2>
                  <p className="text-xs text-muted-foreground mt-1">Changes saved here will immediately update for all users on the live website.</p>
                </div>
                <button
                  onClick={handleSavePricing}
                  disabled={savingPricing}
                  className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground hover:shadow-glow transition-all disabled:opacity-70 cursor-pointer"
                >
                  {savingPricing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Configurations"
                  )}
                </button>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                {plansList.map((plan, planIdx) => (
                  <div key={planIdx} className={`rounded-sm border bg-card p-6 space-y-4 ${plan.highlight ? "border-primary shadow-glow" : "border-border"}`}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold uppercase tracking-widest text-primary">Plan {planIdx + 1}</span>
                      <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={!!plan.highlight}
                          onChange={(e) => handleUpdatePlanField(planIdx, "highlight", e.target.checked)}
                          className="rounded-sm border-border bg-background accent-primary h-4 w-4"
                        />
                        Highlight Plan
                      </label>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs uppercase tracking-wider text-muted-foreground">Plan Name</label>
                      <input
                        type="text"
                        value={plan.name}
                        onChange={(e) => handleUpdatePlanField(planIdx, "name", e.target.value)}
                        className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs uppercase tracking-wider text-muted-foreground">Tag/Badge (e.g. Most Popular)</label>
                      <input
                        type="text"
                        value={plan.tag || ""}
                        onChange={(e) => handleUpdatePlanField(planIdx, "tag", e.target.value)}
                        className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                        placeholder="Starter, Elite, etc."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs uppercase tracking-wider text-muted-foreground">Monthly Price ($)</label>
                        <input
                          type="number"
                          value={plan.monthly}
                          onChange={(e) => handleUpdatePlanField(planIdx, "monthly", Number(e.target.value))}
                          className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs uppercase tracking-wider text-muted-foreground">Yearly Price ($)</label>
                        <input
                          type="number"
                          value={plan.yearly}
                          onChange={(e) => handleUpdatePlanField(planIdx, "yearly", Number(e.target.value))}
                          className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs uppercase tracking-wider text-muted-foreground">Plan Features</label>
                        <button
                          type="button"
                          onClick={() => handleAddFeature(planIdx)}
                          className="text-[10px] uppercase tracking-wider font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="h-3 w-3" /> Add Feature
                        </button>
                      </div>

                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {plan.features.map((feature: string, featIdx: number) => (
                          <div key={featIdx} className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={feature}
                              onChange={(e) => handleUpdateFeature(planIdx, featIdx, e.target.value)}
                              className="flex-1 rounded-sm border border-border bg-background px-3 py-1.5 text-xs focus:border-primary focus:outline-none"
                              placeholder="Feature description..."
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteFeature(planIdx, featIdx)}
                              className="text-muted-foreground hover:text-destructive p-1.5 rounded-sm hover:bg-destructive/15 cursor-pointer"
                              title="Delete feature"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : (
          // Gallery Manager
          galleryLoading ? (
            <div className="py-24 text-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground mt-3">Fetching gallery details...</p>
            </div>
          ) : (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center bg-card border border-border p-6 rounded-sm">
                <div>
                  <h2 className="text-lg font-semibold uppercase tracking-wide">Manage Gym Gallery</h2>
                  <p className="text-xs text-muted-foreground mt-1">Add or remove images shown in the gallery section on the homepage.</p>
                </div>
                <button
                  onClick={handleSaveGallery}
                  disabled={savingGallery}
                  className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground hover:shadow-glow transition-all disabled:opacity-70 cursor-pointer"
                >
                  {savingGallery ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Gallery Configurations"
                  )}
                </button>
              </div>

              {/* Add New Image Form */}
              <form onSubmit={handleAddGalleryItem} className="bg-card border border-border p-6 rounded-sm space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Add New Image to Gallery</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-wider text-muted-foreground">Image URL (Direct link)</label>
                    <input
                      type="url"
                      required
                      value={newImgSrc}
                      onChange={(e) => setNewImgSrc(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-wider text-muted-foreground">Image Label/Caption</label>
                    <input
                      type="text"
                      required
                      value={newImgLabel}
                      onChange={(e) => setNewImgLabel(e.target.value)}
                      placeholder="e.g. Strength Area"
                      className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-wider text-muted-foreground">Grid layout span</label>
                    <select
                      value={newImgSpan}
                      onChange={(e) => setNewImgSpan(e.target.value)}
                      className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none text-foreground"
                    >
                      <option value="">Normal (1x1)</option>
                      <option value="lg:col-span-2">Wide (2 columns)</option>
                      <option value="lg:col-span-2 lg:row-span-2">Large (2x2 columns & rows)</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-sm border border-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Add Image
                </button>
              </form>

              {/* List of images */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {galleryList.map((img, idx) => (
                  <div key={idx} className="rounded-sm border border-border bg-card overflow-hidden flex flex-col">
                    <div className="h-40 relative group bg-secondary/20">
                      <img
                        src={img.src}
                        alt={img.label}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=400&q=80";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteGalleryItem(idx)}
                        className="absolute top-2 right-2 rounded-sm bg-destructive text-destructive-foreground p-1.5 hover:bg-destructive/90 transition-all cursor-pointer shadow-md"
                        title="Remove image"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="p-4 flex-1 space-y-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase tracking-wider text-muted-foreground">Image caption</label>
                        <input
                          type="text"
                          value={img.label}
                          onChange={(e) => handleUpdateGalleryField(idx, "label", e.target.value)}
                          className="w-full rounded-sm border border-border bg-background px-2 py-1 text-xs focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase tracking-wider text-muted-foreground">Image source URL</label>
                        <input
                          type="text"
                          value={img.src}
                          onChange={(e) => handleUpdateGalleryField(idx, "src", e.target.value)}
                          className="w-full rounded-sm border border-border bg-background px-2 py-1 text-xs focus:border-primary focus:outline-none font-mono text-ellipsis overflow-hidden whitespace-nowrap"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase tracking-wider text-muted-foreground">Grid layout span</label>
                        <select
                          value={img.span || ""}
                          onChange={(e) => handleUpdateGalleryField(idx, "span", e.target.value)}
                          className="w-full rounded-sm border border-border bg-background px-2 py-1 text-xs focus:border-primary focus:outline-none text-foreground"
                        >
                          <option value="">Normal (1x1)</option>
                          <option value="lg:col-span-2">Wide (2 columns)</option>
                          <option value="lg:col-span-2 lg:row-span-2">Large (2x2 columns & rows)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
}
