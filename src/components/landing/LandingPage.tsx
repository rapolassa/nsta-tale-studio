import { Link } from "@tanstack/react-router";
import { ArrowRight, Download, ImageIcon, Layers, Palette, Sparkles, Video } from "lucide-react";
import { StoryCanvas } from "@/components/StoryCanvas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
  return (
    <div className="min-h-screen overflow-x-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] opacity-60"
        style={{ background: "var(--gradient-brand)", filter: "blur(120px)" }}
        aria-hidden
      />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-6 md:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles size={20} />
          </span>
          <div>
            <p className="text-lg font-bold leading-tight">Storyframe</p>
            <p className="text-xs text-muted-foreground">Instagram event stories</p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/studio">Open Studio</Link>
        </Button>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-8 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:pb-28 lg:pt-12">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles size={14} className="text-primary" />
              Built for promoters, organizers & creators
            </p>
            <h1 className="max-w-xl text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Event stories that look{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-brand)" }}
              >
                designed, not templated
              </span>
            </h1>
            <p className="max-w-lg text-base text-muted-foreground md:text-lg">
              Storyframe turns your event details into scroll-stopping Instagram Stories and posts
              in seconds. No design skills, no fiddly exports — just fill in, style, and post.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link to="/studio">
                  Start creating
                  <ArrowRight size={18} />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <a href="#how-it-works">See how it works</a>
              </Button>
            </div>
            <div className="flex flex-wrap gap-4 pt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Download size={14} className="text-primary" />
                1080×1920 export
              </span>
              <span>28+ layouts</span>
              <span>Free to try</span>
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

        <section id="how-it-works" className="py-16 md:py-20">
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
                <h2 className="text-2xl font-bold md:text-4xl">
                  Ready to design your next event story?
                </h2>
                <p className="mx-auto max-w-xl text-muted-foreground">
                  Jump into the studio and publish your first story in under a minute.
                </p>
                <Button asChild size="lg">
                  <Link to="/studio">
                    Open Storyframe Studio
                    <ArrowRight size={18} />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground md:flex-row md:px-8">
          <p>© {new Date().getFullYear()} Storyframe</p>
          <Link
            to="/studio"
            className="font-medium text-foreground transition-colors hover:text-primary"
          >
            Go to Studio →
          </Link>
        </div>
      </footer>
    </div>
  );
}
