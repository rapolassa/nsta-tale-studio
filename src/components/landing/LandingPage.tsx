import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Download,
  ImageIcon,
  Layers,
  LogIn,
  LogOut,
  Palette,
  Sparkles,
  Video,
  Zap,
} from "lucide-react";
import { StoryCanvas } from "@/components/StoryCanvas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

const demoData = {
  name: "Summer Rooftop\nParty",
  date: "2026-07-18",
  time: "19:00",
  location: "Skyline Terrace, NYC",
  distance: "",
};

const features = [
  {
    icon: Palette,
    title: "28+ layout styles",
    description:
      "Sport, corporate, festivals, and meetups — each category ships with polished templates ready for your brand.",
  },
  {
    icon: ImageIcon,
    title: "Photo & video backgrounds",
    description:
      "Upload images or clips, tune shade and B&W, and export crisp 1080×1920 stories or 4:5 posts.",
  },
  {
    icon: Layers,
    title: "Multi-slide workflows",
    description:
      "Batch several images at once, style each slide independently, and export everything in one go.",
  },
  {
    icon: Video,
    title: "Video story export",
    description:
      "Composite live video with your text overlay and download an Instagram-ready MP4 or WebM.",
  },
];

const earlyAccessPerks = [
  "Full studio access — all layouts & export formats",
  "Save events to your account and reuse details later",
  "Multi-slide batch export at no extra cost",
  "Video story export while in beta",
  "Direct input on what we ship next",
];

const steps = [
  {
    step: "01",
    title: "Add your event details",
    description: "Name, date, time, location — everything your audience needs at a glance.",
  },
  {
    step: "02",
    title: "Pick a layout & media",
    description:
      "Choose from sport, corporate, festival, or meetup styles and upload a background.",
  },
  {
    step: "03",
    title: "Export & post",
    description: "Download a super-sampled JPEG or video and drop it straight into Instagram.",
  },
];

const faqs = [
  {
    q: "Is Storyframe really free right now?",
    a: "Yes. Early access is free — no credit card required. Jump in, design stories, and export without a paywall.",
  },
  {
    q: "Do I need to sign in?",
    a: "You can use the studio without an account. Sign in with Google to save events and pick up where you left off.",
  },
  {
    q: "What formats can I export?",
    a: "Instagram Stories and Reels at 1080×1920 (9:16), plus feed posts at 1080×1350 (4:5). Video export is supported too.",
  },
];

function HeroPreview() {
  const scale = 0.22;
  const width = 1080;
  const height = 1920;

  return (
    <div
      className="relative overflow-hidden rounded-[2rem] border border-border"
      style={{
        width: width * scale,
        height: height * scale,
        boxShadow: "var(--shadow-glow)",
      }}
    >
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
  );
}

export function LandingPage() {
  const [user, setUser] = useState<{ email?: string } | null>(null);

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

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div
        className="relative z-20 border-b border-primary/20 bg-primary/10 px-4 py-2 text-center text-sm"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.62 0.24 350 / 0.12), oklch(0.75 0.16 70 / 0.12))",
        }}
      >
        <span className="inline-flex flex-wrap items-center justify-center gap-2 text-foreground/90">
          <Badge variant="secondary" className="border-primary/30 bg-primary/15 text-primary">
            Early access
          </Badge>
          Storyframe is in beta — start free, no credit card required.
          <Link
            to="/studio"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Get started →
          </Link>
        </span>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] opacity-60"
        style={{ background: "var(--gradient-brand)", filter: "blur(120px)" }}
        aria-hidden
      />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-6 md:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles size={20} />
          </span>
          <div>
            <p className="text-lg font-bold leading-tight">Storyframe</p>
            <p className="text-xs text-muted-foreground">Instagram event stories</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <span className="hidden max-w-[160px] truncate text-sm text-muted-foreground sm:inline">
                {user.email}
              </span>
              <Button type="button" variant="ghost" size="sm" onClick={signOut}>
                <LogOut size={14} />
                <span className="hidden sm:inline">Log out</span>
              </Button>
            </>
          ) : (
            <Button type="button" variant="ghost" size="sm" onClick={signIn}>
              <LogIn size={14} />
              Log in
            </Button>
          )}
          <Button asChild size="sm">
            <Link to="/studio">Start free</Link>
          </Button>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-8 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:pb-28 lg:pt-12">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-0 bg-primary text-primary-foreground">Early access</Badge>
              <p className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Zap size={14} className="text-accent" />
                Free while in beta
              </p>
            </div>
            <h1 className="max-w-xl text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Instagram event stories,{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-brand)" }}
              >
                ready in seconds
              </span>
            </h1>
            <p className="max-w-lg text-base text-muted-foreground md:text-lg">
              Storyframe turns your event details into scroll-stopping Stories and posts. Pick a
              layout, add your info, export — no design skills or fiddly tools required.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link to="/studio">
                  Start free
                  <ArrowRight size={18} />
                </Link>
              </Button>
              {!user && (
                <Button type="button" size="lg" variant="secondary" onClick={signIn}>
                  <LogIn size={18} />
                  Log in with Google
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              No credit card required · 28+ layouts · 1080×1920 export
            </p>
            <div className="flex flex-wrap gap-4 pt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Download size={14} className="text-primary" />
                Story & post formats
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-primary" />
                Saved events when signed in
              </span>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <HeroPreview />
          </div>
        </section>

        <section className="border-y border-border bg-card/40 py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 md:px-8">
            <div className="mb-10 max-w-2xl">
              <h2 className="text-2xl font-bold md:text-3xl">
                Everything you need to ship stories fast
              </h2>
              <p className="mt-3 text-muted-foreground">
                The studio packs pro-level layouts, media tools, and export options into a workflow
                you can finish before your coffee gets cold.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({ icon: Icon, title, description }) => (
                <Card key={title} className="border-border/80 bg-background/70">
                  <CardContent className="space-y-3 p-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <Icon size={20} />
                    </span>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="early-access" className="py-16 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2 md:px-8 md:gap-16">
            <div>
              <Badge variant="outline" className="mb-4 border-primary/40 text-primary">
                Early access
              </Badge>
              <h2 className="text-2xl font-bold md:text-3xl">
                What you get while we&apos;re in beta
              </h2>
              <p className="mt-3 text-muted-foreground">
                We&apos;re opening the studio early so promoters, organizers, and creators can shape
                the product. Jump in now — pricing comes later, access is free today.
              </p>
              <Button asChild className="mt-6" size="lg">
                <Link to="/studio">
                  Start free in the studio
                  <ArrowRight size={18} />
                </Link>
              </Button>
            </div>
            <ul className="space-y-3 rounded-2xl border border-border bg-card p-6 md:p-8">
              {earlyAccessPerks.map((perk) => (
                <li key={perk} className="flex items-start gap-3 text-sm md:text-base">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Check size={12} />
                  </span>
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="how-it-works" className="border-y border-border bg-card/30 py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 md:px-8">
            <div className="mb-10 max-w-2xl">
              <h2 className="text-2xl font-bold md:text-3xl">Three steps to a finished story</h2>
              <p className="mt-3 text-muted-foreground">
                Open the studio, fill in your event, and export — the whole flow lives at{" "}
                <code className="rounded bg-secondary px-1.5 py-0.5 text-sm">/studio</code>.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {steps.map(({ step, title, description }) => (
                <div key={step} className="rounded-2xl border border-border bg-card p-6">
                  <p className="text-sm font-semibold text-primary">{step}</p>
                  <h3 className="mt-2 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-4 md:px-8">
            <h2 className="text-center text-2xl font-bold md:text-3xl">Common questions</h2>
            <div className="mt-10 space-y-4">
              {faqs.map(({ q, a }) => (
                <div key={q} className="rounded-2xl border border-border bg-card p-5 md:p-6">
                  <h3 className="font-semibold">{q}</h3>
                  <p className="mt-2 text-sm text-muted-foreground md:text-base">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-20 pt-4 md:pb-28">
          <div className="mx-auto max-w-6xl px-4 md:px-8">
            <div
              className="relative overflow-hidden rounded-3xl border border-border px-6 py-12 text-center md:px-12 md:py-16"
              style={{
                background: "linear-gradient(135deg, oklch(0.21 0.035 280), oklch(0.26 0.06 320))",
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-30"
                style={{ background: "var(--gradient-brand)", filter: "blur(80px)" }}
                aria-hidden
              />
              <div className="relative space-y-5">
                <Badge className="border-0 bg-primary/90 text-primary-foreground">
                  Early access
                </Badge>
                <h2 className="text-2xl font-bold md:text-4xl">
                  Ready to design your next event story?
                </h2>
                <p className="mx-auto max-w-xl text-muted-foreground">
                  Start free — no credit card. Log in anytime to save events across sessions.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Button asChild size="lg">
                    <Link to="/studio">
                      Start free
                      <ArrowRight size={18} />
                    </Link>
                  </Button>
                  {!user && (
                    <Button type="button" size="lg" variant="secondary" onClick={signIn}>
                      Log in
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground md:flex-row md:px-8">
          <div className="flex flex-col items-center gap-1 md:items-start">
            <p>© {new Date().getFullYear()} Storyframe</p>
            <p className="text-xs">Early access — free while in beta</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="#early-access" className="transition-colors hover:text-primary">
              Early access
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-primary">
              How it works
            </a>
            <Link
              to="/studio"
              className="font-medium text-foreground transition-colors hover:text-primary"
            >
              Start free →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
