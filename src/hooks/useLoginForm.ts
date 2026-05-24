import { useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import type { Mode } from "@/types";

/** Owns the login/signup form state and submit handling for the auth screen. */
export function useLoginForm() {
  const { signInWithPassword, signUpWithPassword } = useAuth();

  const [mode, setMode] = useState<Mode>("signin");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function switchMode(next: Mode) {
    if (next === mode) return;
    setMode(next);
    setError(null);
    setInfo(null);
  }

  async function onSubmit() {
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      if (mode === "signin") {
        await signInWithPassword(email.trim(), password);
        // Root gate navigates once the session updates.
      } else {
        const { needsConfirmation } = await signUpWithPassword(
          email.trim(),
          password,
          firstName.trim(),
          lastName.trim(),
        );
        if (needsConfirmation) {
          setInfo("Check your email to confirm your account.");
        }
        // If no confirmation needed, the gate routes to /select-venture.
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const submitLabel = mode === "signin" ? "Sign in" : "Create account";

  return {
    mode,
    switchMode,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    password,
    setPassword,
    error,
    info,
    submitting,
    onSubmit,
    submitLabel,
  };
}
