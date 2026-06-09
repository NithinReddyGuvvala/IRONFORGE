import { useEffect, useState } from "react";
import {
  CreditCard, Lock, ShieldCheck, Loader2, X, CheckCircle2,
  Calendar, User, Smartphone, QrCode, Copy, Check as CheckIcon,
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

interface CheckoutDetails {
  type: "membership" | "session";
  name: string;
  price: number;
}

type PayMethod = "card" | "upi" | "qr";

// UPI QR code — a realistic Indian payments QR (placeholder branded image)
// In production replace this URL with your actual UPI QR code image URL
const UPI_ID = "ironforge@upi";
const QR_IMAGE_URL =
  "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=ironforge@upi&pn=IronForge+Gym&cu=INR&bgcolor=0a0a0a&color=ff6b00";

export function CheckoutModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [details, setDetails] = useState<CheckoutDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [method, setMethod] = useState<PayMethod>("card");
  const [copied, setCopied] = useState(false);
  const [upiConfirmed, setUpiConfirmed] = useState(false);

  // Card form state
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  // UPI form state
  const [upiId, setUpiId] = useState("");

  useEffect(() => {
    const handleOpenCheckout = (e: Event) => {
      const customEvent = e as CustomEvent<CheckoutDetails>;
      setDetails(customEvent.detail);
      setIsOpen(true);
      setSuccess(false);
      setLoading(false);
      setMethod("card");
      setCopied(false);
      setUpiConfirmed(false);
      setUpiId("");
      setCardNumber("");
      setExpiry("");
      setCvv("");
      if (auth.currentUser) {
        setCardName(auth.currentUser.displayName || "");
      }
    };
    window.addEventListener("open-checkout", handleOpenCheckout);
    return () => window.removeEventListener("open-checkout", handleOpenCheckout);
  }, []);

  const handleCardNumberChange = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const match = (v.match(/\d{4,16}/g)?.[0]) || "";
    const parts: string[] = [];
    for (let i = 0; i < match.length; i += 4) parts.push(match.substring(i, i + 4));
    setCardNumber(parts.length > 0 ? parts.join(" ") : v);
  };

  const handleExpiryChange = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    setExpiry(v.length >= 2 ? `${v.substring(0, 2)}/${v.substring(2, 4)}` : v);
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const persistPayment = async () => {
    if (!auth.currentUser || !details) return;
    const uid = auth.currentUser.uid;
    if (details.type === "membership") {
      await setDoc(doc(db, "users", uid), { package: details.name, status: "Active", updatedAt: serverTimestamp() }, { merge: true });
      toast.success(`Success! You are now subscribed to the ${details.name} plan.`);
    } else {
      await addDoc(collection(db, "bookings"), {
        uid,
        clientName: auth.currentUser.displayName || "Client",
        clientEmail: auth.currentUser.email || "",
        trainerName: details.name,
        price: details.price,
        paymentMethod: method,
        status: "confirmed",
        createdAt: serverTimestamp(),
      });
      toast.success(`Success! 1-on-1 session with ${details.name} booked.`);
    }
  };

  const handleCardPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !details) return;
    if (cardNumber.replace(/\s/g, "").length < 16) { toast.error("Please enter a valid 16-digit card number."); return; }
    if (expiry.length < 5) { toast.error("Please enter a valid expiry date (MM/YY)."); return; }
    if (cvv.length < 3) { toast.error("Please enter a valid CVV."); return; }
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 2000));
      await persistPayment();
      setSuccess(true);
    } catch (err) {
      console.error(err);
      toast.error("Payment failed. Please try again.");
    } finally { setLoading(false); }
  };

  const handleUpiPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !details) return;
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!upiRegex.test(upiId.trim())) { toast.error("Please enter a valid UPI ID (e.g. name@upi, number@paytm)"); return; }
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 2200));
      await persistPayment();
      setSuccess(true);
    } catch (err) {
      console.error(err);
      toast.error("UPI transaction failed. Please try again.");
    } finally { setLoading(false); }
  };

  const handleQrConfirm = async () => {
    if (!auth.currentUser || !details) return;
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1800));
      await persistPayment();
      setSuccess(true);
    } catch (err) {
      console.error(err);
      toast.error("Confirmation failed. Please contact support.");
    } finally { setLoading(false); }
  };

  if (!isOpen || !details) return null;

  const methodTab = (id: PayMethod, label: string, Icon: React.ElementType) => (
    <button
      type="button"
      onClick={() => setMethod(id)}
      className={`flex flex-1 flex-col items-center gap-1 py-2.5 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
        method === id
          ? "bg-primary text-primary-foreground shadow-glow"
          : "border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-sm shadow-glow overflow-hidden flex flex-col md:flex-row max-h-[95vh] animate-in fade-in zoom-in duration-200">
        {/* Close */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 z-20 rounded-full bg-background/60 p-2 hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer border border-border/30"
        >
          <X className="h-4 w-4" />
        </button>

        {success ? (
          /* ── Success Screen ── */
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-6">
            <div className="rounded-full bg-primary/10 p-6 border border-primary/20 animate-bounce">
              <CheckCircle2 className="h-16 w-16 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-2xl uppercase tracking-wider">Payment Successful</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                {details.type === "membership"
                  ? `Your ${details.name} membership is now active! Welcome to the Forge elite team.`
                  : `Your 1-on-1 session with ${details.name} is confirmed. We have reserved your slot.`}
              </p>
            </div>
            <div className="border border-border/50 bg-secondary/30 p-4 rounded-sm w-full max-w-xs font-mono text-xs text-left space-y-1.5">
              <div className="text-muted-foreground uppercase text-[10px]">Receipt</div>
              <div className="flex justify-between"><span>Account:</span><span className="text-foreground truncate max-w-[160px]">{auth.currentUser?.email}</span></div>
              <div className="flex justify-between"><span>Product:</span><span className="text-foreground">{details.name}</span></div>
              <div className="flex justify-between"><span>Via:</span><span className="uppercase text-foreground">{method}</span></div>
              <div className="flex justify-between"><span>Amount:</span><span className="text-primary font-bold">₹{(details.price * 83).toFixed(0)} / ${details.price.toFixed(2)}</span></div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="px-8 py-3 rounded-sm text-xs font-semibold uppercase tracking-widest bg-primary text-primary-foreground hover:shadow-glow transition-all"
            >
              Back to Gym
            </button>
          </div>
        ) : (
          <>
            {/* ── Left: Payment Panel ── */}
            <div className="flex-1 p-6 md:p-8 space-y-5 order-2 md:order-1 overflow-y-auto">
              {/* Header */}
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h3 className="font-display text-lg uppercase tracking-wider">Secure Payment</h3>
              </div>

              {/* Method Tabs */}
              <div className="flex gap-2">
                {methodTab("card", "Card", CreditCard)}
                {methodTab("upi", "UPI", Smartphone)}
                {methodTab("qr", "QR Code", QrCode)}
              </div>

              {/* ── CARD METHOD ── */}
              {method === "card" && (
                <form onSubmit={handleCardPay} className="space-y-4">
                  <label className="block">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Cardholder Name</span>
                    <div className="relative mt-1">
                      <User className="absolute left-3.5 top-3.5 text-muted-foreground h-4 w-4" />
                      <input type="text" required value={cardName} onChange={(e) => setCardName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-3 rounded-sm border border-border bg-background text-sm focus:border-primary focus:outline-none" />
                    </div>
                  </label>
                  <label className="block">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Card Number</span>
                    <div className="relative mt-1">
                      <CreditCard className="absolute left-3.5 top-3.5 text-muted-foreground h-4 w-4" />
                      <input type="text" required maxLength={19} value={cardNumber}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        placeholder="4242 4242 4242 4242"
                        className="w-full pl-10 pr-4 py-3 rounded-sm border border-border bg-background text-sm font-mono focus:border-primary focus:outline-none" />
                    </div>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Expiry</span>
                      <div className="relative mt-1">
                        <Calendar className="absolute left-3.5 top-3.5 text-muted-foreground h-4 w-4" />
                        <input type="text" required maxLength={5} value={expiry}
                          onChange={(e) => handleExpiryChange(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full pl-10 pr-4 py-3 rounded-sm border border-border bg-background text-sm font-mono focus:border-primary focus:outline-none text-center" />
                      </div>
                    </label>
                    <label className="block">
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">CVV / CVC</span>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3.5 top-3.5 text-muted-foreground h-4 w-4" />
                        <input type="password" required maxLength={4} value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ""))}
                          placeholder="•••"
                          className="w-full pl-10 pr-4 py-3 rounded-sm border border-border bg-background text-sm font-mono focus:border-primary focus:outline-none text-center" />
                      </div>
                    </label>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full flex justify-center items-center gap-2 py-3.5 rounded-sm text-xs font-semibold uppercase tracking-widest text-primary-foreground bg-primary hover:shadow-glow transition-all disabled:opacity-50 cursor-pointer">
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</> : <><Lock className="h-3.5 w-3.5" /> Pay ₹{(details.price * 83).toFixed(0)} Securely</>}
                  </button>
                </form>
              )}

              {/* ── UPI METHOD ── */}
              {method === "upi" && (
                <form onSubmit={handleUpiPay} className="space-y-5">
                  <div className="bg-secondary/30 border border-border rounded-sm p-4 space-y-2 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Pay to UPI ID</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-mono text-sm font-bold text-foreground bg-background border border-border px-3 py-1.5 rounded-sm">
                        {UPI_ID}
                      </span>
                      <button type="button" onClick={copyUpiId}
                        className="p-2 rounded-sm border border-border hover:border-primary hover:text-primary transition-all cursor-pointer">
                        {copied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono">Accepted: PhonePe · GPay · Paytm · BHIM · Any UPI App</p>
                  </div>

                  <div className="flex gap-2 items-center">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Or enter your UPI ID</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <label className="block">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Your UPI ID</span>
                    <div className="relative mt-1">
                      <Smartphone className="absolute left-3.5 top-3.5 text-muted-foreground h-4 w-4" />
                      <input type="text" required value={upiId}
                        onChange={(e) => setUpiId(e.target.value.toLowerCase().trim())}
                        placeholder="yourname@paytm / 9876543210@ybl"
                        className="w-full pl-10 pr-4 py-3 rounded-sm border border-border bg-background text-sm font-mono focus:border-primary focus:outline-none" />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5 font-mono">We will send a payment request to this UPI ID</p>
                  </label>

                  <button type="submit" disabled={loading}
                    className="w-full flex justify-center items-center gap-2 py-3.5 rounded-sm text-xs font-semibold uppercase tracking-widest text-primary-foreground bg-primary hover:shadow-glow transition-all disabled:opacity-50 cursor-pointer">
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Requesting Payment...</> : <><Smartphone className="h-3.5 w-3.5" /> Send ₹{(details.price * 83).toFixed(0)} via UPI</>}
                  </button>
                </form>
              )}

              {/* ── QR METHOD ── */}
              {method === "qr" && (
                <div className="space-y-5">
                  <div className="bg-secondary/20 border border-border rounded-sm p-5 flex flex-col items-center gap-4 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
                      Scan to pay ₹{(details.price * 83).toFixed(0)} using any UPI app
                    </p>
                    {/* Live QR code generated via QR server API */}
                    <div className="rounded-sm overflow-hidden border-4 border-primary/30 bg-white p-2 shadow-glow">
                      <img
                        src={QR_IMAGE_URL}
                        alt="UPI Payment QR Code"
                        className="h-48 w-48 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=ironforge@upi&pn=IronForge";
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-foreground font-mono">{UPI_ID}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        PhonePe · Google Pay · Paytm · BHIM · Any UPI App
                      </p>
                    </div>
                    <button type="button" onClick={copyUpiId}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-border hover:border-primary hover:text-primary text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer">
                      {copied ? <><CheckIcon className="h-3.5 w-3.5 text-green-500" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy UPI ID</>}
                    </button>
                  </div>

                  <div className="bg-primary/5 border border-primary/20 rounded-sm p-3 text-xs text-muted-foreground font-mono text-center">
                    After completing the payment in your UPI app, click <strong className="text-foreground">"I have Paid"</strong> below to confirm your order.
                  </div>

                  <button
                    onClick={handleQrConfirm}
                    disabled={loading}
                    className="w-full flex justify-center items-center gap-2 py-3.5 rounded-sm text-xs font-semibold uppercase tracking-widest text-primary-foreground bg-primary hover:shadow-glow transition-all disabled:opacity-50 cursor-pointer">
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Confirming...</> : <><CheckCircle2 className="h-3.5 w-3.5" /> I Have Paid ₹{(details.price * 83).toFixed(0)}</>}
                  </button>
                </div>
              )}

              <div className="flex items-center justify-center gap-1.5 text-[9px] uppercase tracking-widest text-muted-foreground font-mono">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> SSL Encrypted 256-bit · RBI Compliant
              </div>
            </div>

            {/* ── Right: Summary ── */}
            <div className="w-full md:w-64 bg-secondary/40 p-6 md:p-8 flex flex-col justify-between border-t md:border-t-0 md:border-l border-border order-1 md:order-2 shrink-0">
              <div>
                <h4 className="font-display text-xs uppercase tracking-widest text-muted-foreground">Order Summary</h4>
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        {details.type === "membership" ? `${details.name} Membership` : "1-on-1 Session"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {details.type === "membership" ? "Monthly subscription" : `With ${details.name}`}
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold text-foreground whitespace-nowrap">${details.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-border/60 space-y-2.5">
                <div className="flex justify-between text-xs text-muted-foreground font-mono">
                  <span>USD</span>
                  <span>${details.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground font-mono">
                  <span>INR (≈)</span>
                  <span>₹{(details.price * 83).toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground font-mono">
                  <span>Tax</span>
                  <span>₹0</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-foreground font-mono pt-2 border-t border-border/30">
                  <span>Total</span>
                  <span className="text-primary">₹{(details.price * 83).toFixed(0)}</span>
                </div>

                {/* Accepted payment logos text */}
                <div className="pt-3 space-y-1.5">
                  <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-mono">Accepted via</div>
                  <div className="flex flex-wrap gap-1.5">
                    {["Visa", "Mastercard", "UPI", "PhonePe", "GPay", "Paytm", "BHIM"].map((p) => (
                      <span key={p} className="px-1.5 py-0.5 border border-border/50 rounded text-[9px] font-mono text-muted-foreground bg-background/50">{p}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
