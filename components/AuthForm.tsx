"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { ApiError } from "@/lib/api";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, signup } = useAuth();

  const isSignup = mode === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(!isSignup);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const calculatePasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = calculatePasswordStrength(password);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (isSignup && name.trim().length < 2) return setError("Enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Enter a valid work email.");
    if (password.length < 8) return setError("Your password must be at least 8 characters.");
    if (isSignup && !accepted) return setError("Please accept the terms to continue.");

    setLoading(true);
    try {
      if (isSignup) {
        await signup(name.trim(), email, password);
      } else {
        await login(email, password);
      }
      const next = searchParams.get("next") ?? "/dashboard";
      router.push(next);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      {/* Left Form Stage */}
      <section className="relative flex min-h-screen flex-col justify-between px-6 py-8 sm:px-12 lg:px-[10%]">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-container text-white shadow-xs">
              <FileText size={20} />
            </span>
            <span className="text-lg font-bold tracking-tight text-on-surface">CollabDocs</span>
          </Link>
          <span className="hidden text-xs font-medium text-secondary sm:inline">
            Real-time editorial workspace
          </span>
        </header>

        <div className="mx-auto flex w-full max-w-[460px] flex-col justify-center py-8">
          <div className="mb-6 flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-container text-white shadow-xs">
              <FileText size={20} />
            </span>
            <div>
              <strong className="block text-base font-bold tracking-tight text-on-surface">CollabDocs</strong>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                {isSignup ? "REAL-TIME WORKSPACE" : "Enterprise Collaboration"}
              </span>
            </div>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-secondary">
            {isSignup
              ? "Start collaborating with your team in real time. Free for 14 days."
              : "Enter your details to access your collaborative workspace."}
          </p>

          <form onSubmit={submit} noValidate className="mt-6 space-y-4">
            {isSignup && (
              <label className="block text-xs font-semibold text-on-surface">
                Full Name
                <div className="mt-1.5 flex h-11 items-center gap-2.5 rounded-xl border border-outline-variant/60 bg-white px-3.5 shadow-xs focus-within:border-primary-container focus-within:ring-2 focus-within:ring-primary/10">
                  <UserRound size={16} className="text-secondary" />
                  <input
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full bg-transparent text-xs outline-none placeholder:text-secondary/70"
                  />
                </div>
              </label>
            )}

            <label className="block text-xs font-semibold text-on-surface">
              Work Email
              <div className="mt-1.5 flex h-11 items-center gap-2.5 rounded-xl border border-outline-variant/60 bg-white px-3.5 shadow-xs focus-within:border-primary-container focus-within:ring-2 focus-within:ring-primary/10">
                <Mail size={16} className="text-secondary" />
                <input
                  autoComplete="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="alex@company.com"
                  className="w-full bg-transparent text-xs outline-none placeholder:text-secondary/70"
                />
              </div>
            </label>

            <label className="block text-xs font-semibold text-on-surface">
              <span className="flex items-center justify-between">
                <span>Password</span>
                {!isSignup ? (
                  <a href="#forgot" className="text-[11px] font-normal text-primary hover:underline">
                    Forgot password?
                  </a>
                ) : (
                  strength >= 3 && (
                    <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Strong password
                    </span>
                  )
                )}
              </span>
              <div className="mt-1.5 flex h-11 items-center gap-2.5 rounded-xl border border-outline-variant/60 bg-white px-3.5 shadow-xs focus-within:border-primary-container focus-within:ring-2 focus-within:ring-primary/10">
                <LockKeyhole size={16} className="text-secondary" />
                <input
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={isSignup ? "At least 8 characters" : "••••••••••••"}
                  className="w-full bg-transparent text-xs outline-none placeholder:text-secondary/70"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-secondary hover:text-on-surface"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* 4-bar Password Strength Indicator for Signup */}
              {isSignup && password.length > 0 && (
                <div className="mt-2 grid grid-cols-4 gap-1.5">
                  <div className={`h-1 rounded-full ${strength >= 1 ? "bg-emerald-500" : "bg-slate-200"}`} />
                  <div className={`h-1 rounded-full ${strength >= 2 ? "bg-emerald-500" : "bg-slate-200"}`} />
                  <div className={`h-1 rounded-full ${strength >= 3 ? "bg-emerald-500" : "bg-slate-200"}`} />
                  <div className={`h-1 rounded-full ${strength >= 4 ? "bg-emerald-500" : "bg-slate-200"}`} />
                </div>
              )}
            </label>

            {isSignup ? (
              <label className="flex items-start gap-2.5 text-xs text-secondary leading-relaxed cursor-pointer">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(event) => setAccepted(event.target.checked)}
                  className="mt-0.5 rounded accent-primary-container"
                />
                <span>
                  I agree to the{" "}
                  <a href="#terms" className="text-primary hover:underline font-medium">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#privacy" className="text-primary hover:underline font-medium">
                    Privacy Policy
                  </a>
                </span>
              </label>
            ) : (
              <label className="flex items-center gap-2 text-xs text-secondary cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded accent-primary-container" />
                <span>Remember this device for 30 days</span>
              </label>
            )}

            {error && (
              <p role="alert" className="rounded-lg bg-error-container/40 p-2.5 text-xs text-error font-medium">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary-container text-xs font-semibold text-white shadow-sm transition hover:bg-primary active:scale-[0.99] disabled:opacity-60"
            >
              <span>{loading ? "Please wait…" : isSignup ? "Create Free Account" : "Log In to CollabDocs"}</span>
              {!loading && <ArrowRight size={15} />}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-secondary">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <Link
              href={isSignup ? "/login" : "/signup"}
              className="font-semibold text-primary hover:underline ml-1"
            >
              {isSignup ? "Log in" : "Sign up for free"}
            </Link>
          </p>

          <div className="mt-5 flex items-center justify-between rounded-xl bg-surface-container-low px-3.5 py-2.5 text-xs text-secondary">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-primary" />
              {isSignup ? "No credit card required • Cancel anytime" : "System Status: Real-time sync engine nominal"}
            </span>
            {!isSignup && <span className="font-semibold text-primary">99.99%</span>}
          </div>
        </div>

        <p className="text-center text-[11px] text-secondary flex items-center justify-center gap-1.5 py-2">
          <ShieldCheck size={14} className="text-primary" />
          Protected by SOC2 Type II compliance &amp; enterprise encryption
        </p>
      </section>

      {/* Right Marketing Canvas Showcase */}
      <aside className="relative hidden min-h-screen overflow-hidden bg-gradient-to-br from-[#f4f2ff] via-[#e5e9ff] to-[#c9dcff] p-10 lg:flex flex-col justify-between xl:p-16">
        <div className="absolute -right-20 top-20 h-96 w-96 rounded-full bg-indigo-300/30 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <span className="rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-on-surface shadow-xs">
            {isSignup ? "● CRDT Mesh Active" : "✦ CollabEngine v3.8 Active"}
          </span>
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-secondary">
            {isSignup ? "⚡ 18ms latency" : "RL  PK  EM  +4"}
          </span>
        </div>

        <div className="relative mx-auto w-full max-w-[560px] space-y-6">
          <article className="rounded-2xl border border-white/80 bg-white p-7 shadow-xl shadow-indigo-900/10 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                <span>{isSignup ? "🚀" : "⚡"}</span>
                <span>{isSignup ? "Architecture RFC" : "Q4 Product Roadmap & Vision"}</span>
              </h2>
              <span className="rounded-full bg-primary-fixed px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                {isSignup ? "Drafting" : "● Live"}
              </span>
            </div>

            <p className="mt-4 text-xs text-secondary">
              {isSignup ? "v2.4 Distributed Technical Spec" : "Master technical specification for multi-region document replication."}
            </p>

            <div className="mt-4 space-y-2 border-t border-outline-variant/30 pt-4 text-xs leading-relaxed text-on-surface-variant">
              <p>
                To deliver multi-region consensus without sacrificing editor throughput, our infrastructure is expanding distributed state across edge datacenters.
              </p>
              <div className="relative my-2 inline-block">
                <span className="bg-primary-fixed/40 px-1 py-0.5 rounded text-primary font-medium">
                  zero-latency CRDT engine
                </span>
                <span className="inline-block h-3.5 w-[2px] bg-[#f87171] ml-0.5 align-middle" />
                <span className="rounded bg-[#f87171] px-1 py-0.2 text-[9px] font-bold text-white ml-0.5">
                  Rahul
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-surface-container-low p-3.5 text-xs">
              <div className="flex items-center justify-between">
                <strong className="font-semibold text-on-surface">Elena Vance</strong>
                <span className="text-[10px] text-secondary">Just now</span>
              </div>
              <p className="mt-1 text-secondary italic">
                &quot;Verified on synthetic benchmarks: p99 latency dropped to 14ms across US-East nodes.&quot;
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between text-[11px] text-secondary border-t border-outline-variant/20 pt-3">
              <span>◷ Autosaved 2s ago</span>
              <span className="font-mono text-primary font-medium">● v4.1.2-rc</span>
            </div>
          </article>

          <article className="rounded-2xl border border-white/80 bg-white/95 p-5 shadow-lg">
            <div className="flex gap-1 text-amber-400 text-xs mb-2">★ ★ ★ ★ ★</div>
            <p className="text-xs leading-relaxed text-on-surface-variant italic">
              {isSignup
                ? `"Setting up our entire 80-person engineering org on CollabDocs took less than 10 minutes."`
                : `"CollabDocs transformed our distributed engineering team. Document synchronization is instant."`}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-primary-container text-xs font-bold text-white">
                {isSignup ? "MV" : "ML"}
              </span>
              <div>
                <p className="text-xs font-bold text-on-surface">
                  {isSignup ? "Marcus Vance" : "Maya Lin"}
                </p>
                <p className="text-[10px] text-secondary">
                  {isSignup ? "Head of Infrastructure, CloudSync" : "VP of Product Engineering, HyperScale"}
                </p>
              </div>
              <span className="ml-auto rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 flex items-center gap-1">
                <Check size={11} /> Verified Customer
              </span>
            </div>
          </article>
        </div>

        <div className="flex justify-between text-[11px] font-semibold uppercase tracking-wider text-secondary">
          <span>Trusted by engineers at</span>
          <span>Stripe　•　Figma　•　Vercel</span>
        </div>
      </aside>
    </main>
  );
}
