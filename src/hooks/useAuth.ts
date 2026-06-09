import { useState, useEffect } from "react";
import {
  User,
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error: any) {
      if (error.code === "auth/popup-blocked") {
        console.warn("Popup blocked, falling back to redirect...");
        await signInWithRedirect(auth, googleProvider);
        return null;
      }
      setLoading(false);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      return result.user;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signupWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      return result.user;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const sendOtp = async (phoneNumber: string, recaptchaContainerId: string): Promise<ConfirmationResult> => {
    setLoading(true);
    try {
      // Format number if needed: phone number must be in E.164 format (e.g. +11234567890 or +911234567890)
      let formattedNumber = phoneNumber;
      if (!phoneNumber.startsWith("+")) {
        formattedNumber = "+91" + phoneNumber;
      }

      // Safeguard: Clear existing verifier if any, to avoid "recaptcha-container already has a verifier" or similar errors
      if (typeof window !== "undefined" && (window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {
          console.warn("Failed to clear existing recaptcha verifier:", e);
        }
      }

      const verifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved
        }
      });
      if (typeof window !== "undefined") {
        (window as any).recaptchaVerifier = verifier;
      }

      const confirmationResult = await signInWithPhoneNumber(auth, formattedNumber, verifier);
      setLoading(false);
      return confirmationResult;
    } catch (error) {
      setLoading(false);
      // If error occurs, clear the verifier to allow clean retry
      if (typeof window !== "undefined" && (window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {}
        (window as any).recaptchaVerifier = null;
      }
      throw error;
    }
  };

  return {
    user,
    loading,
    logout,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    resetPassword,
    sendOtp
  };
}
