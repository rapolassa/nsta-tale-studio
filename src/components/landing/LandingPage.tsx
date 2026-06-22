import { Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Menu, X } from "lucide-react";
import { toast } from "sonner";
import { StoryCanvas } from "@/components/StoryCanvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import {
  comparison,
  faqs,
  features,
  heroStats,
  layoutPills,
  navLinks,
  pricingPlans,
  proofTags,
  steps,
  useCases,
} from "./landing-content";
import "./landing.css";

const demoData = {
  name: "Summer Rooftop\nParty",
  date: "2026-07-18",
  time: "19:00",
  location: "Skyline Terrace, NYC",
  distance: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LogoMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="2" y="2" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6 14V8l4 3 4-3v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WaitlistForm({
  id,
  placeholder,
  buttonLabel,
  className = "",
  source: _source,
}: {
  id: string;
  placeholder: string;
  buttonLabel: string;
  className?: string;
  source: string;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your email address.");
      return;
    }
    if (!emailPattern.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setEmail("");
    toast.success("You're on the list! We'll be in touch soon.");
  };

  return (
    <form onSubmit={submit} className={className}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <Input
            id={id}
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            placeholder={placeholder}
            autoComplete="email"
            aria-label="Email address"
            aria-invalid={!!error}
            className="h-12 rounded-full border-[var(--landing-border-strong)] bg-[var(--landing-elevated)] px-5 text-[var(--landing-text)] placeholder:text-[var(--landing-dim)]"
          />
          {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
        </div>
        <Button type="submit" size="lg" className="btn-gradient shrink-0 rounded-full px-7">
          {buttonLabel}
        </Button>
      </div>
    </form>
  );
}

function PhonePreview() {
  const scale = 0.24;
  const width = 1080;
  const height = 1920;

  return (
    <div className="relative flex justify-center">
      <div className="preview-glow" aria-hidden />
      <div className="phone-frame">
        <div className="mx-auto mb-2 h-6 w-20 rounded-b-xl bg-[#0a0a0f]" aria-hidden />
        <div className="relative overflow-hidden rounded-3xl" style={{ aspectRatio: "9/16" }}>
          <div
            style={{
              width,
              height,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <StoryCanvas data={demoData} layout="bold" shade={0.45} align="middle" format="story" />
          </div>
        </div>
      </div>

      <div className="floating-card card-layouts hidden md:block">
        <span className="mb-2 block text-[0.6875rem] uppercase tracking-wider text-[var(--landing-dim)]">
          Layout style
        </span>
        <div className="flex flex-wrap gap-1.5">
          {layoutPills.map((pill, i) => (
            <span
              key={pill}
              className={`rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold ${
                i === 0
                  ? "border border-[rgba(224,64,251,0.3)] bg-[var(--landing-accent-soft)] text-[var(--landing-accent-bright)]"
                  : "bg-white/5 text-[var(--landing-muted)]"
              }`}
            >
              {pill}
            </span>
          ))}
        </div>
      </div>

      <div className="floating-card card-batch hidden md:block">
        <span className="mb-2 block text-[0.6875rem] uppercase tracking-wider text-[var(--landing-dim)]">
          Batch export
        </span>
        <div className="flex items-center gap-1.5">
          <div className="h-9 w-7 rounded bg-gradient-to-br from-indigo-400 to-rose-400" />
          <div className="h-9 w-7 rounded bg-gradient-to-br from-indigo-400 to-rose-400" />
          <div className="h-9 w-7 rounded bg-gradient-to-br from-indigo-400 to-rose-400" />
          <span className="text-sm font-bold text-[var(--landing-accent-bright)]">+7</span>
        </div>
      </div>

      <div className="floating-card card-format hidden lg:block">
        <span className="mb-2 block text-[0.6875rem] uppercase tracking-wider text-[var(--landing-dim)]">
          Format
        </span>
        <div className="flex gap-1.5">
          <span className="rounded-full border border-[rgba(224,64,251,0.3)] bg-[var(--landing-accent-soft)] px-2.5 py-0.5 text-[0.6875rem] font-semibold text-[var(--landing-accent-bright)]">
            9:16
          </span>
          <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[0.6875rem] font-semibold text-[var(--landing-muted)]">
            4:5
          </span>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/studio`,
    });
    if (result.error) toast.error("Could not sign in. Please try again.");
  };

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("#")) {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="landing min-h-screen overflow-x-hidden">
      <div className="noise" aria-hidden />
      <div className="gradient-orb gradient-orb-1" aria-hidden />
      <div className="gradient-orb gradient-orb-2" aria-hidden />

      <header className="landing-header">
        <nav className="mx-auto flex h-[var(--landing-header-h)] max-w-6xl items-center justify-between gap-4 px-4 md:px-8">
          <a
            href="#"
            className="flex items-center gap-2 font-[family-name:var(--font-display)] text-lg font-bold"
          >
            <span className="text-[var(--landing-accent-bright)]">
              <LogoMark />
            </span>
            Storyframe
          </a>

          <ul className="hidden items-center gap-8 lg:flex">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <button
                  type="button"
                  onClick={() => scrollTo(href)}
                  className="text-[0.9375rem] text-[var(--landing-muted)] transition-colors hover:text-[var(--landing-text)]"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-3 lg:flex">
            {user ? (
              <span className="max-w-[140px] truncate text-sm text-[var(--landing-muted)]">
                {user.email}
              </span>
            ) : (
              <Button
                type="button"
                variant="ghost"
                onClick={signIn}
                className="rounded-full border border-[var(--landing-border-strong)] text-[var(--landing-text)] hover:bg-white/5"
              >
                Log in
              </Button>
            )}
            <Button asChild className="btn-gradient rounded-full">
              <Link to="/studio">Start free</Link>
            </Button>
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-[var(--landing-text)] lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {mobileOpen && (
          <div className="border-b border-[var(--landing-border)] bg-[rgba(10,10,15,0.97)] px-4 py-4 backdrop-blur-xl lg:hidden">
            <ul className="space-y-1">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <button
                    type="button"
                    onClick={() => scrollTo(href)}
                    className="block w-full py-3 text-left text-[var(--landing-muted)]"
                  >
                    {label}
                  </button>
                </li>
              ))}
              {!user && (
                <li>
                  <button type="button" onClick={signIn} className="block w-full py-3 text-left">
                    Log in
                  </button>
                </li>
              )}
              <li className="pt-2">
                <Button asChild className="btn-gradient w-full rounded-full">
                  <Link to="/studio" onClick={() => setMobileOpen(false)}>
                    Start free
                  </Link>
                </Button>
              </li>
            </ul>
          </div>
        )}
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="flex min-h-screen items-center px-4 pb-20 pt-[calc(var(--landing-header-h)+3rem)] md:px-8">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-6 text-center lg:text-left">
              <div className="early-badge mx-auto w-fit lg:mx-0">
                <span className="early-badge-dot" />
                Now in early access
              </div>
              <h1 className="text-4xl font-bold md:text-5xl lg:text-[3.25rem]">
                Turn your photos into <span className="gradient-text">ready-to-post stories</span>{" "}
                in 60 seconds
              </h1>
              <p className="mx-auto max-w-lg text-lg text-[var(--landing-muted)] lg:mx-0">
                Drop in a photo or video, pick a layout style, add your event details — export a
                polished Story, Reel, or Post. No Canva. No designer. Just done.
              </p>
              <WaitlistForm
                id="hero-email"
                placeholder="you@venue.com"
                buttonLabel="Get early access"
                source="hero"
                className="mx-auto max-w-md lg:mx-0"
              />
              <p className="text-sm text-[var(--landing-dim)]">
                Free to start · 3 exports/month · No credit card
              </p>
              <div className="flex flex-wrap justify-center gap-8 border-t border-[var(--landing-border)] pt-8 lg:justify-start">
                {heroStats.map(({ value, label }) => (
                  <div key={label} className="text-left">
                    <strong className="block font-[family-name:var(--font-display)] text-2xl">
                      {value}
                    </strong>
                    <span className="text-xs text-[var(--landing-dim)]">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <PhonePreview />
          </div>
        </section>

        {/* Social proof */}
        <section className="border-y border-[var(--landing-border)] py-12 text-center">
          <div className="mx-auto max-w-6xl px-4 md:px-8">
            <p className="mb-5 text-[var(--landing-dim)]">
              Built for people who post every week, not once a year
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {proofTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[var(--landing-border)] bg-[var(--landing-elevated)] px-4 py-1.5 text-sm text-[var(--landing-muted)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-24 px-4 py-24 md:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 max-w-xl">
              <span className="section-tag">Features</span>
              <h2 className="mb-4 text-3xl md:text-4xl">
                Everything you need.
                <br />
                Nothing you don&apos;t.
              </h2>
              <p className="text-lg text-[var(--landing-muted)]">
                Opinionated layouts that look professional out of the box — so you spend time
                promoting, not tweaking pixels.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <article
                  key={f.title}
                  className={`feature-card p-7 ${"large" in f && f.large ? "sm:col-span-2" : ""} ${
                    "accent" in f && f.accent
                      ? "bg-gradient-to-br from-[rgba(224,64,251,0.15)] to-transparent"
                      : ""
                  }`}
                >
                  <div className="mb-4 text-2xl" aria-hidden>
                    {f.icon}
                  </div>
                  <h3 className="mb-2 text-lg font-bold">
                    {f.title}
                    {"comingSoon" in f && f.comingSoon && (
                      <span className="ml-2 rounded-full bg-[var(--landing-accent-soft)] px-2 py-0.5 text-[0.6875rem] font-semibold text-[var(--landing-accent-bright)]">
                        Pro
                      </span>
                    )}
                  </h3>
                  <p className="text-[0.9375rem] text-[var(--landing-muted)]">{f.description}</p>
                  {"large" in f && f.large && (
                    <div className="mt-6 flex gap-2">
                      <div className="mini-phone" />
                      <div className="mini-phone" />
                      <div className="mini-phone" />
                      <div className="mini-phone" />
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="scroll-mt-24 bg-[var(--landing-elevated)] px-4 py-24 md:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 text-center">
              <span className="section-tag">How it works</span>
              <h2 className="text-3xl md:text-4xl">Three steps. Under a minute.</h2>
            </div>
            <ol className="grid gap-6 md:grid-cols-3">
              {steps.map(({ num, title, description }) => (
                <li
                  key={num}
                  className="rounded-[20px] border border-[var(--landing-border)] bg-[var(--landing-card)] p-8"
                >
                  <span className="gradient-text block font-[family-name:var(--font-display)] text-4xl font-extrabold">
                    {num}
                  </span>
                  <h3 className="mt-4 text-lg font-bold">{title}</h3>
                  <p className="mt-2 text-[0.9375rem] text-[var(--landing-muted)]">{description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Use cases */}
        <section id="use-cases" className="scroll-mt-24 px-4 py-24 md:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 max-w-xl">
              <span className="section-tag">Use cases</span>
              <h2 className="text-3xl md:text-4xl">One tool. Many reasons to post.</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {useCases.map(({ emoji, title, description }) => (
                <article key={title} className="feature-card rounded-[20px] p-7">
                  <span className="mb-4 block text-3xl" aria-hidden>
                    {emoji}
                  </span>
                  <h3 className="mb-2 font-bold">{title}</h3>
                  <p className="text-sm text-[var(--landing-muted)]">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="px-4 py-16 md:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-8 rounded-[28px] border border-[var(--landing-border)] bg-[var(--landing-card)] p-8 md:grid-cols-[1fr_auto_1fr] md:p-10">
              <div>
                <h3 className="mb-5 text-lg font-bold">{comparison.other.title}</h3>
                <ul className="space-y-3">
                  {comparison.other.items.map((item) => (
                    <li
                      key={item}
                      className="relative pl-5 text-[0.9375rem] text-[var(--landing-muted)] before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-red-400/60"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="hidden w-px bg-[var(--landing-border)] md:block" />
              <div className="md:hidden h-px bg-[var(--landing-border)]" />
              <div>
                <h3 className="mb-5 text-lg font-bold text-[var(--landing-accent-bright)]">
                  {comparison.storyframe.title}
                </h3>
                <ul className="space-y-3">
                  {comparison.storyframe.items.map((item) => (
                    <li
                      key={item}
                      className="relative pl-5 text-[0.9375rem] before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-[var(--landing-accent-bright)]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section
          id="pricing"
          className="scroll-mt-24 bg-[var(--landing-elevated)] px-4 py-24 md:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 text-center">
              <span className="section-tag">Pricing</span>
              <h2 className="text-3xl md:text-4xl">
                Start free. Upgrade when you&apos;re posting weekly.
              </h2>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {pricingPlans.map((plan) => (
                <article
                  key={plan.name}
                  className={`relative rounded-[20px] border border-[var(--landing-border)] bg-[var(--landing-card)] p-8 ${
                    plan.featured ? "price-featured" : ""
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--landing-gradient)] px-4 py-1 text-xs font-semibold text-white">
                      {plan.badge}
                    </span>
                  )}
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="mt-3">
                    <span className="font-[family-name:var(--font-display)] text-4xl font-extrabold">
                      {plan.price}
                    </span>
                    <span className="text-[var(--landing-dim)]">{plan.period}</span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--landing-muted)]">{plan.description}</p>
                  <ul className="my-6 space-y-2.5">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="relative pl-5 text-sm text-[var(--landing-muted)] before:absolute before:left-0 before:font-bold before:text-[var(--landing-accent-bright)] before:content-['✓']"
                      >
                        {f}
                      </li>
                    ))}
                  </ul>
                  {plan.mailto ? (
                    <Button
                      asChild
                      variant="outline"
                      className="w-full rounded-full border-[var(--landing-border-strong)] bg-transparent"
                    >
                      <a href="mailto:hello@storyframe.app">{plan.cta}</a>
                    </Button>
                  ) : plan.featured ? (
                    <Button asChild className="btn-gradient w-full rounded-full">
                      <Link to="/studio">{plan.cta}</Link>
                    </Button>
                  ) : (
                    <Button
                      asChild
                      variant="outline"
                      className="w-full rounded-full border-[var(--landing-border-strong)] bg-transparent"
                    >
                      <Link to="/studio">{plan.cta}</Link>
                    </Button>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-24 px-4 py-24 md:px-8">
          <div className="mx-auto max-w-2xl">
            <div className="mb-12 text-center">
              <span className="section-tag">FAQ</span>
              <h2 className="text-3xl md:text-4xl">Common questions</h2>
            </div>
            <div className="divide-y divide-[var(--landing-border)]">
              {faqs.map(({ q, a, defaultOpen }) => (
                <details key={q} className="faq-item py-5" open={defaultOpen}>
                  <summary className="flex items-center justify-between gap-4 font-[family-name:var(--font-display)] font-semibold">
                    {q}
                    <span className="text-xl text-[var(--landing-accent-bright)]">+</span>
                  </summary>
                  <p className="mt-3 pr-8 text-[0.9375rem] text-[var(--landing-muted)]">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="waitlist" className="scroll-mt-24 px-4 pb-28 pt-8 md:px-8">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[28px] border border-[rgba(224,64,251,0.2)] bg-[var(--landing-card)] px-6 py-14 text-center md:px-12">
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 0%, rgba(224,64,251,0.35) 0%, transparent 60%)",
              }}
              aria-hidden
            />
            <div className="relative space-y-6">
              <h2 className="text-3xl font-bold md:text-4xl">Your next story is 60 seconds away</h2>
              <p className="mx-auto max-w-md text-[var(--landing-muted)]">
                Join the waitlist for early access. First 100 users get Pro free for 3 months.
              </p>
              <WaitlistForm
                id="cta-email"
                placeholder="you@company.com"
                buttonLabel="Join waitlist"
                source="cta"
                className="mx-auto max-w-md"
              />
              <p className="text-sm text-[var(--landing-dim)]">No spam. Unsubscribe anytime.</p>
              <Button asChild variant="link" className="text-[var(--landing-accent-bright)]">
                <Link to="/studio">Or skip the waitlist — open the studio →</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--landing-border)] bg-[var(--landing-elevated)] px-4 py-16 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.4fr_2fr]">
          <div>
            <a
              href="#"
              className="flex items-center gap-2 font-[family-name:var(--font-display)] text-lg font-bold"
            >
              <span className="text-[var(--landing-accent-bright)]">
                <LogoMark />
              </span>
              Storyframe
            </a>
            <p className="mt-3 text-sm text-[var(--landing-dim)]">
              Turn photos into stories. Fast.
            </p>
            <div className="mt-6 max-w-sm">
              <label
                htmlFor="footer-email"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--landing-muted)]"
              >
                Get updates
              </label>
              <WaitlistForm
                id="footer-email"
                placeholder="Email address"
                buttonLabel="Subscribe"
                source="footer"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[var(--landing-dim)]">
                Product
              </h4>
              <div className="flex flex-col gap-2 text-sm text-[var(--landing-muted)]">
                <button
                  type="button"
                  onClick={() => scrollTo("#features")}
                  className="text-left hover:text-[var(--landing-text)]"
                >
                  Features
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo("#pricing")}
                  className="text-left hover:text-[var(--landing-text)]"
                >
                  Pricing
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo("#faq")}
                  className="text-left hover:text-[var(--landing-text)]"
                >
                  FAQ
                </button>
                <Link to="/studio" className="hover:text-[var(--landing-text)]">
                  Open studio
                </Link>
              </div>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[var(--landing-dim)]">
                Company
              </h4>
              <div className="flex flex-col gap-2 text-sm text-[var(--landing-muted)]">
                <span>About</span>
                <span>Blog</span>
                <a href="mailto:hello@storyframe.app" className="hover:text-[var(--landing-text)]">
                  Contact
                </a>
              </div>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[var(--landing-dim)]">
                Legal
              </h4>
              <div className="flex flex-col gap-2 text-sm text-[var(--landing-muted)]">
                <span>Privacy</span>
                <span>Terms</span>
              </div>
            </div>
          </div>
        </div>
        <p className="mx-auto mt-12 max-w-6xl border-t border-[var(--landing-border)] pt-8 text-center text-xs text-[var(--landing-dim)]">
          © {new Date().getFullYear()} Storyframe. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
