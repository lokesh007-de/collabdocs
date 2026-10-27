import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckSquare,
  Compass,
  History,
  LockKeyhole,
  PlayCircle,
  Radio,
  Send,
  Sparkles,
  UsersRound,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AvatarStack from "@/components/AvatarStack";
import { editorCollaborators } from "@/lib/mockDocs";

const features = [
  {
    icon: UsersRound,
    title: "Live Collaboration",
    text: "Sub-50ms peer synchronization powered by CRDT algorithms. See who’s typing and where with absolute clarity and zero lock contention.",
    tag1: "● 3 active peers",
    tag2: "⚡ 18ms sync",
  },
  {
    icon: History,
    title: "Version History",
    text: "Granular revision timeline. Rewind, inspect individual diffs character-by-character, and restore any previous iteration effortlessly.",
    tag1: "v2.4 diff snapshot",
    tag2: "Restored by Maya",
  },
  {
    icon: LockKeyhole,
    title: "Share with Permissions",
    text: "Enterprise-grade access control. Restrict view, comment, or edit permissions per document, folder, or entire team workspace.",
    tag1: "Domain restricted",
    tag2: "View Only",
  },
];

const steps = [
  {
    number: "01",
    icon: Compass,
    title: "Create & Invite",
    text: "Start with a blank canvas or chosen team template. Generate a secure, scoped invite link with granular roles in a single click.",
  },
  {
    number: "02",
    icon: UsersRound,
    title: "Draft Together",
    text: "Co-author seamlessly with multi-cursor presence, inline rich media, code syntax highlighting, and zero overwrite conflicts.",
  },
  {
    number: "03",
    icon: Send,
    title: "Review & Ship",
    text: "Gather targeted feedback using anchored comment threads, assign clear action items, and export cleanly to PDF, Markdown, or web.",
  },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="pt-16 bg-surface min-h-screen">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden px-gutter-mobile pb-20 pt-16 md:px-gutter md:pt-24">
          <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary-fixed/60 via-surface-container-low/30 to-transparent blur-3xl" />

          <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-fixed/60 px-4 py-1.5 text-xs font-semibold text-primary shadow-xs">
              <Sparkles size={14} /> CollabDocs 2.0 is live • Zero-latency synchronization
            </span>

            <h1 className="max-w-4xl text-display-title-mobile font-bold tracking-tight text-on-surface sm:text-5xl md:text-[56px] md:leading-[1.12]">
              Write together, in real time
            </h1>

            <p className="mt-4 max-w-2xl text-xs leading-relaxed text-secondary sm:text-sm md:text-base">
              The multiplayer document editor engineered for high-velocity teams. Zero sync conflicts, granular access controls, and distraction-free writing at 60fps.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary-container px-6 text-xs font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-primary active:scale-[0.99]"
              >
                Get Started <ArrowRight size={16} />
              </Link>
              <a
                href="#interactive-preview"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-outline-variant/60 bg-white px-5 text-xs font-semibold text-on-surface shadow-xs transition hover:bg-surface-container-low"
              >
                <PlayCircle size={17} className="text-primary" /> View Live Demo
              </a>
            </div>

            {/* Social Proof Strip */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-xs text-secondary">
              <AvatarStack avatars={editorCollaborators} limit={3} />
              <span>
                Loved by <strong className="font-semibold text-on-surface">45,000+ teams</strong>
              </span>
              <span>•</span>
              <span>No credit card required</span>
            </div>
          </div>

          {/* Interactive Mockup Window Preview */}
          <div
            id="interactive-preview"
            className="relative mx-auto mt-14 max-w-5xl overflow-hidden rounded-2xl border border-outline-variant/40 bg-white shadow-xl shadow-indigo-900/5"
          >
            {/* Window Top Chrome */}
            <div className="flex h-11 items-center justify-between gap-3 border-b border-outline-variant/40 bg-surface-container-low px-4">
              <div className="flex min-w-0 items-center gap-2.5 text-xs">
                <span className="flex gap-1.5 mr-1">
                  <i className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <i className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <i className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>
                <span className="truncate font-semibold text-on-surface">
                  Quarterly Launch Strategy &amp; Playbook
                </span>
                <span className="hidden text-secondary sm:inline">• Saved 2s ago</span>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <div className="hidden sm:block">
                  <AvatarStack avatars={editorCollaborators} limit={3} />
                </div>
                <Link
                  href="/doc/quarterly-launch-strategy"
                  className="rounded-lg bg-primary-container px-3 py-1 text-xs font-semibold text-white transition hover:bg-primary"
                >
                  Share
                </Link>
              </div>
            </div>

            {/* Formatting Ribbon */}
            <div className="flex h-9 items-center gap-4 border-b border-outline-variant/30 px-4 text-xs text-secondary">
              <span>↶</span>
              <span>↷</span>
              <span className="border-l border-outline-variant pl-4 font-medium text-on-surface">
                Heading 1 ▾
              </span>
              <b className="text-on-surface font-bold">B</b>
              <i className="italic">I</i>
              <u>U</u>
              <span>☷</span>
              <span>❞</span>
              <div className="ml-auto hidden items-center gap-2 sm:flex">
                <span className="text-primary font-medium">✦ AI Copilot Active</span>
                <span>•</span>
                <span className="text-emerald-600">60 fps CRDT Sync ●</span>
              </div>
            </div>

            {/* Document Content with Collaborative Highlights */}
            <div className="grid min-h-[300px] grid-cols-1 gap-6 p-6 md:grid-cols-[1fr_260px] md:p-10">
              <article>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                  INTERNAL STRATEGY MEMO
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-on-surface">
                  Q4 Growth &amp; Product Milestones
                </h2>

                <div className="mt-4 text-xs leading-relaxed text-on-surface-variant space-y-3">
                  <p>
                    <span className="relative inline-block mr-1">
                      <span className="inline-block h-4 w-[2px] bg-[#f87171] align-middle" />
                      <span className="rounded bg-[#f87171] px-1 py-0.5 text-[9px] font-bold text-white align-top -mt-3.5 inline-block">
                        Rahul
                      </span>
                    </span>
                    Our priority this quarter revolves around strengthening peer-to-peer delivery pipelines,{" "}
                    <span className="bg-[#f87171]/20 px-1 py-0.5 rounded text-on-surface">
                      expanding enterprise tier adoption
                    </span>{" "}
                    and scaling low-latency edge nodes.
                  </p>
                  <p>
                    Every revision graph is validated locally before broadcasting state. Through{" "}
                    <span className="bg-[#60a5fa]/25 px-1 py-0.5 rounded text-on-surface">
                      deterministic conflict resolution
                    </span>
                    , lock contention is guaranteed even under high concurrent turbulence.
                  </p>
                </div>

                {/* Checkpoints Card */}
                <div className="mt-6 rounded-xl bg-surface-container-low p-4">
                  <p className="mb-2.5 flex items-center gap-2 text-xs font-bold text-on-surface">
                    <CheckSquare size={16} className="text-primary" /> Q4 Execution Checkpoints
                  </p>
                  <div className="space-y-1.5 text-xs text-secondary">
                    <p className="flex items-center gap-2">
                      <Check size={13} className="text-primary shrink-0" /> Launch marketing campaign with developer testimonials
                    </p>
                    <p className="flex items-center gap-2">
                      <Check size={13} className="text-primary shrink-0" /> Finalize API endpoints for CRDT socket integration
                    </p>
                    <p className="flex items-center gap-2 text-secondary/60">
                      <span className="h-3 w-3 rounded-xs border border-secondary/40 shrink-0" /> Deploy high-availability edge nodes across AP-South-1
                    </p>
                  </div>
                </div>
              </article>

              {/* Anchored Comment Card */}
              <aside className="rounded-xl border border-outline-variant/40 bg-white p-4 shadow-xs self-start">
                <p className="flex items-center gap-2 text-xs font-bold text-on-surface">
                  <Radio size={14} className="text-primary" /> Live comment
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-blue-500 text-[9px] font-bold text-white">
                    PK
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-on-surface">Priya Kapoor</p>
                    <p className="text-[10px] text-secondary">2m ago</p>
                  </div>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
                  Should we add benchmark numbers here to back up deterministic speed?
                </p>
                <Link
                  href="/doc/quarterly-launch-strategy"
                  className="mt-3 block text-xs font-semibold text-primary hover:underline"
                >
                  Reply…
                </Link>
              </aside>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="px-gutter-mobile py-16 md:px-gutter md:py-20">
          <div className="mx-auto max-w-7xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Built for architecture &amp; focus
            </p>
            <h2 className="mt-2 max-w-xl text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
              Engineered for pure focus and frictionless collaboration
            </h2>
            <p className="mt-3 max-w-2xl text-xs leading-relaxed text-secondary sm:text-sm">
              Everything your team needs to draft, iterate, and publish together without stepping on each other’s edits.
            </p>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {features.map(({ icon: Icon, title, text, tag1, tag2 }) => (
                <article
                  key={title}
                  className="flex flex-col justify-between rounded-2xl border border-outline-variant/30 bg-white p-6 shadow-xs transition hover:shadow-docked"
                >
                  <div>
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-fixed text-primary">
                      <Icon size={20} />
                    </span>
                    <h3 className="mt-5 text-base font-bold text-on-surface">{title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-secondary">{text}</p>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-outline-variant/20 pt-4 text-[11px]">
                    <span className="rounded-full bg-surface-container-low px-2.5 py-0.5 font-medium text-secondary">
                      {tag1}
                    </span>
                    <span className="rounded-full bg-primary-fixed/60 px-2.5 py-0.5 font-semibold text-primary">
                      {tag2}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="bg-surface-container-low px-gutter-mobile py-16 md:px-gutter md:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                Seamless process
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
                Writing made remarkably natural
              </h2>
              <p className="mt-2 text-xs text-secondary sm:text-sm">
                From the first stroke of inspiration to finalized product specification.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <article key={step.number} className="rounded-2xl bg-white p-6 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold text-primary-fixed-dim font-mono">
                        {step.number}
                      </span>
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-surface-container-low text-primary">
                        <Icon size={16} />
                      </span>
                    </div>
                    <h3 className="mt-4 text-base font-bold text-on-surface">{step.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-secondary">{step.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* CRDT LATENCY SECTION */}
        <section className="px-gutter-mobile py-16 md:px-gutter">
          <div className="mx-auto grid max-w-6xl gap-8 rounded-3xl border border-outline-variant/30 bg-white p-7 shadow-xs md:grid-cols-2 md:p-12">
            <div>
              <span className="rounded-full bg-primary-fixed px-3 py-1 text-[11px] font-semibold text-primary">
                Zero Configuration Setup
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-on-surface">
                Try the CRDT latency difference
              </h2>
              <p className="mt-3 text-xs leading-relaxed text-secondary sm:text-sm">
                Traditional web sockets freeze when multiple people write into the same paragraph block. Our fractional-index CRDT retains smooth 60fps responsiveness.
              </p>
              <ul className="mt-5 space-y-2.5 text-xs text-secondary">
                <li className="flex items-center gap-2">
                  <Check size={15} className="text-primary shrink-0" /> Offline-first local cache synchronization
                </li>
                <li className="flex items-center gap-2">
                  <Check size={15} className="text-primary shrink-0" /> Real-time Markdown shortcuts &amp; block commands
                </li>
                <li className="flex items-center gap-2">
                  <Check size={15} className="text-primary shrink-0" /> SOC2 Type II compliant encryption
                </li>
              </ul>
            </div>

            {/* P2P Mesh Diagram */}
            <div className="flex flex-col justify-between rounded-2xl bg-surface-container-low p-6">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-on-surface">Active Sync Topology</span>
                <span className="rounded-full bg-primary-fixed px-2.5 py-0.5 text-primary text-[10px]">
                  P2P Mesh
                </span>
              </div>
              <div className="relative my-8 flex h-36 items-center justify-center">
                <div className="absolute h-px w-4/5 rotate-[-18deg] border-t-2 border-dashed border-primary/30" />
                <div className="absolute h-px w-4/5 rotate-[18deg] border-t-2 border-dashed border-primary/30" />
                <span className="z-10 rounded-full bg-primary-container px-4 py-2 text-xs font-bold text-white shadow-md">
                  CRDT
                </span>
                <span className="absolute left-[8%] top-1/2 -translate-y-1/2 rounded-full bg-coral px-2.5 py-1 text-[10px] font-bold text-white shadow-xs">
                  RA
                </span>
                <span className="absolute right-[8%] top-1/2 -translate-y-1/2 rounded-full bg-sky px-2.5 py-1 text-[10px] font-bold text-white shadow-xs">
                  PR
                </span>
                <span className="absolute bottom-1 rounded-full bg-emerald px-2.5 py-1 text-[10px] font-bold text-white shadow-xs">
                  YOU
                </span>
              </div>
              <p className="flex justify-between text-[11px] text-secondary">
                <span>Mesh status: optimal</span>
                <span className="font-semibold text-emerald-600">0 Conflict Retries</span>
              </p>
            </div>
          </div>
        </section>

        {/* FINAL CTA CARD */}
        <section className="px-gutter-mobile pb-20 md:px-gutter">
          <div className="mx-auto max-w-6xl rounded-3xl bg-gradient-to-br from-[#2d3568] to-[#142c49] px-6 py-14 text-center text-white shadow-modal md:py-16">
            <h2 className="mx-auto max-w-xl text-2xl font-bold tracking-tight sm:text-4xl">
              Ready to write at the speed of thought?
            </h2>
            <p className="mt-3 text-xs text-white/80 sm:text-sm max-w-lg mx-auto">
              Join thousands of high-velocity teams who create faster, clearer documents every day with CollabDocs.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/signup"
                className="rounded-xl bg-primary-container px-6 py-3 text-xs font-semibold text-white shadow-md transition hover:bg-primary active:scale-[0.99]"
              >
                Get Started for Free ⚡
              </Link>
              <Link
                href="/login"
                className="rounded-xl bg-white/10 px-6 py-3 text-xs font-semibold text-white backdrop-blur-xs transition hover:bg-white/20"
              >
                Schedule a Team Demo
              </Link>
            </div>
            <p className="mt-5 text-[11px] text-white/60">
              Free 14-day trial • No credit card required • 2-minute setup
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
