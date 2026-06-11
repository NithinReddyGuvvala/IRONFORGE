import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Dumbbell, Phone, Mail, Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ConfirmationResult, updateProfile, fetchSignInMethodsForEmail } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp, collection, getDocs, query, limit } from "firebase/firestore";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    className={props.className}
  >
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export const Route = createFileRoute("/login")({
  component: LoginScreen,
});

function LoginScreen() {
  const navigate = useNavigate();
  const {
    user,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    resetPassword,
    loading: authLoading,
  } = useAuth();

  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [method, setMethod] = useState<"email" | "google">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Email form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");

  // Auto-redirect based on user role when authenticated
  useEffect(() => {
    const handleRedirect = async () => {
      if (user && !authLoading) {
        const isEmailAdmin =
          user.email === "admin@ironforge.gym" ||
          user.email === "nithinreddyguvvala@gmail.com" ||
          user.email?.endsWith("@ironforge.gym");

        if (isEmailAdmin) {
          navigate({ to: "/admin" });
        } else {
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists() && userDoc.data()?.role === "admin") {
              navigate({ to: "/admin" });
              return;
            }
          } catch (e) {
            console.error("Error reading role for redirect:", e);
          }
          navigate({ to: "/" });
        }
      }
    };
    handleRedirect();
  }, [user, authLoading, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await loginWithEmail(email, password);
        toast.success("Welcome back!");
      } else {
        const usr = await signupWithEmail(email, password);
        if (usr) {
          // Set display name in Firebase Auth
          await updateProfile(usr, { displayName: name });
          
          let role = "customer";
          try {
            const usersSnapshot = await getDocs(query(collection(db, "users"), limit(1)));
            if (usersSnapshot.empty) {
              role = "admin";
            }
          } catch (e) {
            console.log("Bootstrap role check failed, assigning customer:", e);
            role = "customer";
          }

          // Save extra details in Firestore
          await setDoc(doc(db, "users", usr.uid), {
            uid: usr.uid,
            name,
            email,
            phone: signupPhone,
            role: role,
            status: "Inactive",
            package: "None",
            createdAt: serverTimestamp()
          });
        }
        toast.success("Account created successfully! Welcome to the Forge.");
      }
    } catch (err: any) {
      console.error(err);
      let errorMessage = "Authentication failed. Please check your credentials.";
      if (
        err.code === "auth/user-not-found" ||
        err.message?.includes("user-not-found") ||
        err.code === "auth/wrong-password" ||
        err.message?.includes("wrong-password") ||
        err.code === "auth/invalid-credential" ||
        err.message?.includes("invalid-credential")
      ) {
        errorMessage = "Email/Password is wrong";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await resetPassword(email);
      toast.success("Password reset email sent! Please check your inbox.");
      setMode("login");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send password reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      const usr = await loginWithGoogle();
      if (usr) {
        // Check if user already exists
        const userDocRef = doc(db, "users", usr.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        let role = "customer";
        let isNewUser = !userDocSnap.exists();
        
        if (userDocSnap.exists()) {
          role = userDocSnap.data()?.role || "customer";
        } else {
          try {
            const usersSnapshot = await getDocs(query(collection(db, "users"), limit(1)));
            if (usersSnapshot.empty) {
              role = "admin";
            }
          } catch (e) {
            role = "customer";
          }
        }

        // Save user to Firestore if not already exists (merge)
        await setDoc(
          doc(db, "users", usr.uid),
          {
            uid: usr.uid,
            name: usr.displayName || "Google User",
            email: usr.email || "",
            phone: usr.phoneNumber || "",
            provider: "google",
            role: role,
            lastLogin: serverTimestamp(),
            ...(isNewUser ? { createdAt: serverTimestamp(), status: "Inactive", package: "None" } : {})
          },
          { merge: true }
        );
        toast.success("Signed in with Google successfully!");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };



  const isLoading = loading || authLoading;

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10" />

      {/* Invisible container for Firebase ReCAPTCHA */}
      <div id="recaptcha-container"></div>

      <div className="max-w-md w-full space-y-8 bg-card border border-border p-8 rounded-sm shadow-card">
        <div>
          <button
            onClick={() => navigate({ to: "/" })}
            className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Home
          </button>

          <div className="flex justify-center">
            <Dumbbell className="h-12 w-12 text-primary" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-display font-bold uppercase tracking-wider text-foreground">
            {mode === "login" ? "Enter the Forge" : mode === "signup" ? "Join the Forge" : "Reset Password"}
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {mode === "login"
              ? "Access your programs and profile"
              : mode === "signup"
              ? "Start your fitness journey today"
              : "Recover your account credentials"}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-sm flex items-start gap-2.5 transition-all">
            <span className="font-semibold uppercase tracking-wider text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-sm">Error</span>
            <span className="flex-1 text-xs font-medium">{error}</span>
          </div>
        )}

        {/* Method Toggles */}
        {mode !== "forgot" && (
          <div className="grid grid-cols-2 gap-2 border border-border p-1 bg-secondary/50 rounded-sm">
            <button
              onClick={() => { setMethod("email"); setError(null); }}
              className={`flex flex-col items-center justify-center py-2.5 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors ${
                method === "email"
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mail className="h-4 w-4 mb-1" />
              Email
            </button>
            <button
              onClick={() => { setMethod("google"); setError(null); }}
              className={`flex flex-col items-center justify-center py-2.5 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors ${
                method === "google"
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <GoogleIcon className="h-4 w-4 mb-1" />
              Google
            </button>
          </div>
        )}

        {/* Auth Forms */}
        {method === "email" && mode !== "forgot" && (
          <form className="mt-8 space-y-4" onSubmit={handleEmailAuth}>
            <div className="space-y-3">
              {mode === "signup" && (
                <>
                  <label className="block">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">Full Name</span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => { setName(e.target.value); setError(null); }}
                      className="mt-2 w-full rounded-sm border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                      placeholder="John Doe"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">Phone Number</span>
                    <input
                      type="tel"
                      required
                      value={signupPhone}
                      onChange={(e) => { setSignupPhone(e.target.value); setError(null); }}
                      className="mt-2 w-full rounded-sm border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                      placeholder="9876543210"
                    />
                  </label>
                </>
              )}
              <label className="block">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Email Address</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  className="mt-2 w-full rounded-sm border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  placeholder="name@example.com"
                />
              </label>
              <div className="space-y-1">
                <label className="block">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">Password</span>
                  <div className="relative mt-2">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(null); }}
                      className="w-full rounded-sm border border-border bg-background pl-4 pr-10 py-3 text-sm focus:border-primary focus:outline-none"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowPassword(!showPassword);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center justify-center z-10 w-8 h-8 focus:outline-none"
                    >
                      {showPassword ? (
                        <Eye className="h-5 w-5" />
                      ) : (
                        <EyeOff className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </label>
                {mode === "login" && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => { setMode("forgot"); setError(null); }}
                      className="text-xs text-primary hover:underline uppercase tracking-wider font-semibold cursor-pointer mt-1"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold uppercase tracking-widest text-primary-foreground bg-primary hover:bg-primary/90 rounded-sm focus:outline-none transition-all hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : mode === "login" ? (
                "Sign In"
              ) : (
                "Sign Up"
              )}
            </button>
          </form>
        )}

        {/* Password Reset Form */}
        {method === "email" && mode === "forgot" && (
          <form className="mt-8 space-y-4" onSubmit={handleResetPassword}>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Enter your email address below and we'll send you a link to reset your password.
              </p>
              <label className="block">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Email Address</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  className="mt-2 w-full rounded-sm border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  placeholder="name@example.com"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold uppercase tracking-widest text-primary-foreground bg-primary hover:bg-primary/90 rounded-sm focus:outline-none transition-all hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        )}

        {method === "google" && mode !== "forgot" && (
          <div className="mt-8 space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              Sign in securely using your Google account to access your profile.
            </p>
            <button
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-3 py-3.5 px-4 border border-border text-sm font-semibold uppercase tracking-widest text-foreground bg-card hover:bg-secondary/50 rounded-sm focus:outline-none transition-all hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <GoogleIcon className="h-5 w-5" />
                  Sign In with Google
                </>
              )}
            </button>
          </div>
        )}

        {/* Toggle Mode */}
        {method !== "google" && (
          <div className="text-center">
            <button
              onClick={() => {
                setError(null);
                if (mode === "forgot") {
                  setMode("login");
                } else {
                  setMode((m) => (m === "login" ? "signup" : "login"));
                }
              }}
              className="text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              {mode === "login"
                ? "Need an account? Sign Up"
                : mode === "signup"
                ? "Already registered? Sign In"
                : "Back to Sign In"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
