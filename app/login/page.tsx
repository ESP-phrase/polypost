"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { Wordmark } from "@/components/Wordmark";

type Step = "email" | "code";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [devCode, setDevCode] = useState<string | null>(null);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (params.get("error")) setError("Sign-in failed. Try again.");
  }, [params]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    if (!email || !email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string; devCode?: string };
      if (!res.ok || json.error) {
        setError(json.error ?? "Failed to send code.");
        return;
      }
      if (json.devCode) setDevCode(json.devCode);
      setStep("code");
      setResendCooldown(60);
      setTimeout(() => codeRefs.current[0]?.focus(), 100);
    } catch {
      setError("Could not reach server.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (fullCode: string) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: fullCode }),
      });
      const json = (await res.json()) as { user?: { id: string; email: string; name: string }; error?: string };
      if (!res.ok || json.error) {
        setError(json.error ?? "Verification failed.");
        setLoading(false);
        return;
      }
      router.push("/app");
    } catch {
      setError("Could not reach server.");
      setLoading(false);
    }
  };

  const handleCodeChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...code];
    if (val.length > 1) {
      const digits = val.replace(/\D/g, "").slice(0, 6).split("");
      const filled = [...code];
      digits.forEach((d, idx) => {
        if (idx < 6) filled[idx] = d;
      });
      setCode(filled);
      const focus = Math.min(digits.length, 5);
      codeRefs.current[focus]?.focus();
      if (digits.length === 6) verifyCode(digits.join(""));
      return;
    }
    next[i] = val;
    setCode(next);
    if (val && i < 5) codeRefs.current[i + 1]?.focus();
    if (next.every((d) => d !== "")) verifyCode(next.join(""));
  };

  const handleCodeKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[i] && i > 0) codeRefs.current[i - 1]?.focus();
  };

  return (
    <div className="min-h-screen flex bg-[var(--color-bg)]">
      {/* Left: Branding */}
      <div className="hidden lg:flex flex-col justify-between w-[44%] p-12 border-r border-[var(--color-border)]">
        <Link href="/" className="flex items-center gap-2.5">
          <BrandMark size={30} />
          <Wordmark size={18} />
        </Link>

        <div>
          <blockquote className="text-xl font-semibold leading-snug mb-6">
            &ldquo;I write a post once at 8am and it&rsquo;s live across seven networks before my coffee&rsquo;s cold. Cut my social ops time by 90%.&rdquo;
          </blockquote>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-xs font-black text-black">MK</div>
            <div>
              <p className="text-sm font-semibold">Marcus K.</p>
              <p className="text-xs text-[var(--color-muted-2)]">@marcus.dev · creator, 80K followers</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "8", label: "Networks" },
            { value: "60s", label: "Setup" },
            { value: "2.1M", label: "Posts shipped" },
          ].map((s) => (
            <div key={s.label} className="bg-card-grad border border-[var(--color-border)] rounded-xl p-4 text-center">
              <p className="text-lg font-extrabold text-[var(--color-accent)]">{s.value}</p>
              <p className="text-[11px] text-[var(--color-muted-2)]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
          <BrandMark size={26} />
          <Wordmark size={16} />
        </Link>

        <div className="w-full max-w-sm">
          {step === "email" ? (
            <>
              <BrandMark size={44} className="mb-6" />
              <h1 className="text-2xl font-extrabold mb-1 tracking-tight">Sign in to PolyPost</h1>
              <p className="text-[var(--color-muted)] text-sm mb-6">
                Enter your email — we&rsquo;ll send a 6-digit code. No passwords.
              </p>

              <form onSubmit={sendCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-muted)] mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoFocus
                  />
                </div>
                {error && <p className="text-[var(--color-danger)] text-xs px-1">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-grad text-black font-bold text-sm hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed glow-accent"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Send code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <BrandMark size={44} className="mb-6" />
              <h1 className="text-2xl font-extrabold mb-1 tracking-tight">Check your email</h1>
              <p className="text-[var(--color-muted)] text-sm mb-2">We sent a 6-digit code to</p>
              <p className="text-[var(--color-accent)] text-sm font-semibold mb-6">{email}</p>

              {devCode && (
                <p className="bg-[var(--color-accent-dim)] border border-[var(--color-accent-border)] text-[var(--color-accent)] text-xs px-3 py-2 rounded-lg mb-6 font-mono">
                  Dev mode: code is <strong>{devCode}</strong> (Resend not configured)
                </p>
              )}

              <div className="flex gap-2 mb-6 justify-center">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      codeRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(i, e)}
                    className="w-11 h-14 text-xl font-bold text-center caret-transparent"
                  />
                ))}
              </div>

              {loading && (
                <div className="flex justify-center mb-4">
                  <div className="w-5 h-5 border-2 border-[var(--color-accent)]/30 border-t-[var(--color-accent)] rounded-full animate-spin" />
                </div>
              )}
              {error && <p className="text-[var(--color-danger)] text-xs px-1 mb-4 text-center">{error}</p>}

              <p className="text-center text-[var(--color-muted-2)] text-xs mb-3">Didn&rsquo;t get it?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setStep("email");
                    setCode(["", "", "", "", "", ""]);
                    setError("");
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] text-xs font-medium transition-colors"
                >
                  Change email
                </button>
                <button
                  onClick={() => sendCode()}
                  disabled={resendCooldown > 0 || loading}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="w-3 h-3" />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                </button>
              </div>
            </>
          )}

          <p className="text-center text-[11px] text-[var(--color-muted-2)] mt-8">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-[var(--color-muted)]">Terms</Link>{" "}and{" "}
            <Link href="/privacy" className="underline hover:text-[var(--color-muted)]">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
