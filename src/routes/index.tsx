import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { toPng, toJpeg } from "html-to-image";
import { format } from "date-fns";
import { CalendarDays, Clock, MapPin, Route as RouteIcon, Download, Sparkles, ImageUp, X, Bookmark, Trash2, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, LogIn, LogOut, Plus, Copy, DownloadCloud } from "lucide-react";
import { StoryCanvas, type EventData, type LayoutStyle, type VAlign, type StoryFormat, LAYOUTS_WITH_ALIGN, DEFAULT_ALIGN, FORMAT_DIMENSIONS } from "@/components/StoryCanvas";
import { useSavedEvents } from "@/lib/saved-events";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

type EventCategory = "sport" | "corporate" | "festivals" | "meetups";
const CATEGORIES: { id: EventCategory; label: string; emoji: string }[] = [
  { id: "sport", label: "Sport", emoji: "🏅" },
  { id: "corporate", label: "Corporate", emoji: "💼" },
  { id: "festivals", label: "Festivals", emoji: "🎉" },
  { id: "meetups", label: "Meetups", emoji: "👥" },
];

/** A single output image with its own independent style + content. */
interface Slide {
  id: string;
  image: string | null;
  video: string | null;
  layout: LayoutStyle;
  storyFormat: StoryFormat;
  align: VAlign;
  category: EventCategory;
  shade: number;
  bw: boolean;
  data: EventData;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Story Maker — Create Instagram Event Stories" },
      { name: "description", content: "Fill in your event details and export a ready-to-post Instagram Story image in seconds." },
      { property: "og:title", content: "Story Maker — Create Instagram Event Stories" },
      { property: "og:description", content: "Fill in your event details and export a ready-to-post Instagram Story image in seconds." },
    ],
  }),
  component: Index,
});

function Index() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [exporting, setExporting] = useState(false);
  const makeSlide = (over: Partial<Slide> = {}): Slide => ({
    id: crypto.randomUUID(),
    image: null,
    video: null,
    layout: "bold",
    storyFormat: "story",
    align: "middle",
    category: "meetups",
    shade: 45,
    bw: false,
    data: { name: "Summer Rooftop Party", date: "", time: "", location: "", distance: "" },
    ...over,
  });
  const [slides, setSlides] = useState<Slide[]>(() => [makeSlide()]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pendingExport, setPendingExport] = useState<Slide | null>(null);
  const active = slides.find((s) => s.id === activeId) ?? slides[0];
  const { image, video, layout, storyFormat, align, category, shade, bw, data } = active;

  const patchSlide = (id: string, partial: Partial<Slide>) =>
    setSlides((arr) => arr.map((s) => (s.id === id ? { ...s, ...partial } : s)));
  const patch = (partial: Partial<Slide>) => patchSlide(active.id, partial);

  const supportsAlign = LAYOUTS_WITH_ALIGN.includes(layout);
  const { width: outW, height: outH } = FORMAT_DIMENSIONS[storyFormat];
  const isMobile = useIsMobile();
  const previewScale = isMobile ? 0.16 : 0.3;
  const formatOptions: { id: StoryFormat; label: string; ratio: string }[] = [
    { id: "story", label: "Story / Reel", ratio: "9:16" },
    { id: "post", label: "Post", ratio: "4:5" },
  ];

  const setStoryFormat = (f: StoryFormat) => patch({ storyFormat: f });
  const setLayout = (l: LayoutStyle) => patch({ layout: l });
  const setAlign = (a: VAlign) => patch({ align: a });
  const setShade = (n: number) => patch({ shade: n });
  const setBw = (b: boolean) => patch({ bw: b });
  const setData = (val: EventData | ((d: EventData) => EventData)) =>
    patch({ data: typeof val === "function" ? (val as (d: EventData) => EventData)(active.data) : val });

  const chooseLayout = (id: LayoutStyle) => {
    patch({ layout: id, align: DEFAULT_ALIGN[id] ?? "middle" });
  };

  const chooseCategory = (id: EventCategory) => {
    const first = layoutCatalog.find((opt) => opt.category === id);
    patch({
      category: id,
      ...(first ? { layout: first.id, align: DEFAULT_ALIGN[first.id] ?? "middle" } : {}),
    });
  };
  const { events: savedEvents, save: saveEvent, remove: removeEvent } = useSavedEvents();

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
      redirect_uri: window.location.origin,
    });
    if (result.error) toast.error("Could not sign in. Please try again.");
  };
  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
  };

  const update = (key: keyof EventData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setData((d) => ({ ...d, [key]: e.target.value }));

  const [dateOpen, setDateOpen] = useState(false);
  const selectedDate = data.date ? new Date(data.date + "T00:00:00") : undefined;
  const setDate = (d: Date | undefined) => {
    setData((prev) => ({ ...prev, date: d ? format(d, "yyyy-MM-dd") : "" }));
    setDateOpen(false);
  };
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isVideoFile = (file: File) =>
    file.type.startsWith("video") || /\.(mov|mp4|webm|m4v)$/i.test(file.name);

  // Each uploaded image becomes (or fills) its own slide so you can build
  // several output images in one go. A video applies to the active slide.
  const handleMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const vids = files.filter(isVideoFile);
    const imgs = files.filter((f) => !isVideoFile(f));

    if (vids.length) {
      if (active.video) URL.revokeObjectURL(active.video);
      patch({ video: URL.createObjectURL(vids[0]), image: null });
    }

    imgs.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setSlides((arr) => {
          const emptyIdx = arr.findIndex((s) => !s.image && !s.video);
          if (emptyIdx !== -1) {
            const copy = [...arr];
            copy[emptyIdx] = { ...copy[emptyIdx], image: url, video: null };
            return copy;
          }
          const base = arr.find((s) => s.id === active.id) ?? arr[arr.length - 1];
          return [
            ...arr,
            makeSlide({
              image: url,
              layout: base.layout,
              storyFormat: base.storyFormat,
              align: base.align,
              category: base.category,
              shade: base.shade,
              bw: base.bw,
              data: { ...base.data },
            }),
          ];
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const clearMedia = () => {
    if (video) URL.revokeObjectURL(video);
    patch({ image: null, video: null });
  };

  const addSlide = () => {
    const s = makeSlide({
      layout: active.layout,
      storyFormat: active.storyFormat,
      align: active.align,
      category: active.category,
      shade: active.shade,
      bw: active.bw,
      data: { ...active.data },
    });
    setSlides((arr) => [...arr, s]);
    setActiveId(s.id);
  };

  const duplicateSlide = (id: string) => {
    setSlides((arr) => {
      const idx = arr.findIndex((s) => s.id === id);
      if (idx === -1) return arr;
      const copy = makeSlide({ ...arr[idx], id: crypto.randomUUID(), data: { ...arr[idx].data } });
      const next = [...arr];
      next.splice(idx + 1, 0, copy);
      setActiveId(copy.id);
      return next;
    });
  };

  const removeSlide = (id: string) => {
    setSlides((arr) => {
      if (arr.length === 1) return arr;
      const target = arr.find((s) => s.id === id);
      if (target?.video) URL.revokeObjectURL(target.video);
      const next = arr.filter((s) => s.id !== id);
      if (activeId === id) setActiveId(next[0].id);
      return next;
    });
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;
    setExporting(true);
    try {
      // Video frames can't be captured by html-to-image, so snapshot the
      // current frame to a still image and render that during export.
      let restore: string | null = null;
      if (video && videoRef.current) {
        const v = videoRef.current;
        const c = document.createElement("canvas");
        c.width = outW;
        c.height = outH;
        const ctx = c.getContext("2d");
        if (ctx) {
          const vw = v.videoWidth || outW;
          const vh = v.videoHeight || outH;
          const scale = Math.max(outW / vw, outH / vh);
          const dw = vw * scale;
          const dh = vh * scale;
          if (bw) ctx.filter = "grayscale(100%)";
          ctx.drawImage(v, (outW - dw) / 2, (outH - dh) / 2, dw, dh);
          ctx.filter = "none";
          restore = video;
          patch({ image: c.toDataURL("image/jpeg", 0.92), video: null });
          await new Promise((r) => setTimeout(r, 100));
        }
      }
      // Rendered at 2x for crisp text/edges, then saved as high-quality JPEG.
      const dataUrl = await toJpeg(canvasRef.current, {
        width: outW,
        height: outH,
        pixelRatio: 2,
        quality: 0.95,
        cacheBust: true,
        backgroundColor: "#000000",
      });
      const link = document.createElement("a");
      link.download = `${(data.name || "event").replace(/\s+/g, "-").toLowerCase()}-story.jpg`;
      link.href = dataUrl;
      link.click();
      if (restore) {
        patch({ video: restore, image: null });
      }
    } finally {
      setExporting(false);
    }
  };

  // Export a real video story: composite the live video frame with the text
  // overlay onto a canvas and capture it with MediaRecorder.
  const handleExportVideo = async () => {
    if (!canvasRef.current || !videoRef.current || !video) return;
    setExporting(true);
    try {
      const v = videoRef.current;
      // Rasterize the overlay (shade + text) once, excluding the video element.
      // Render at 2x so when it composites onto the 1080x1920 record canvas,
      // text/edges stay crisp after downsampling.
      const overlayUrl = await toPng(canvasRef.current, {
        width: outW,
        height: outH,
        pixelRatio: 2,
        cacheBust: true,
        filter: (node) => node !== v,
      });
      const overlay = new Image();
      overlay.src = overlayUrl;
      await overlay.decode();

      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d")!;

      // Prefer MP4/H.264 — Instagram Stories only accept MP4 (H.264) videos.
      // Fall back to WebM where MP4 recording isn't supported (Chromium on
      // desktop currently records WebM only; you can convert later if needed).
      const candidates = [
        "video/mp4;codecs=avc1.640028",
        "video/mp4;codecs=avc1",
        "video/mp4",
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
      ];
      const mimeType =
        candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? "video/webm";
      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);

      // Precompute the cover-fit geometry once (it never changes per frame).
      const vw = v.videoWidth || outW;
      const vh = v.videoHeight || outH;
      const scale = Math.max(outW / vw, outH / vh);
      const dw = vw * scale;
      const dh = vh * scale;
      const dx = (outW - dw) / 2;
      const dy = (outH - dh) / 2;
      // Set the grayscale filter once instead of toggling it every frame.
      ctx.filter = bw ? "grayscale(100%)" : "none";

      const drawFrame = () => {
        ctx.drawImage(v, dx, dy, dw, dh);
        ctx.drawImage(overlay, 0, 0, outW, outH);
      };

      // Prefer requestVideoFrameCallback so canvas draws stay in lock-step with
      // the actual decoded video frames — this removes the stutter you get when
      // a plain rAF loop runs out of sync with the video's real frame rate.
      const hasRVFC = "requestVideoFrameCallback" in v;
      let raf = 0;
      let stopped = false;
      const pump = () => {
        if (stopped) return;
        drawFrame();
        if (hasRVFC) {
          (v as unknown as { requestVideoFrameCallback: (cb: () => void) => void }).requestVideoFrameCallback(pump);
        } else {
          raf = requestAnimationFrame(pump);
        }
      };

      // Record one full loop of the video (capped at 15s).
      const duration = Math.min(v.duration && isFinite(v.duration) ? v.duration : 10, 15);
      v.currentTime = 0;
      await v.play();
      pump();
      recorder.start();

      await new Promise((r) => setTimeout(r, duration * 1000));

      stopped = true;
      cancelAnimationFrame(raf);
      ctx.filter = "none";
      await new Promise<void>((resolve) => {
        recorder.onstop = () => resolve();
        recorder.stop();
      });

      const blob = new Blob(chunks, { type: mimeType });
      const ext = mimeType.startsWith("video/mp4") ? "mp4" : "webm";
      const link = document.createElement("a");
      link.download = `${(data.name || "event").replace(/\s+/g, "-").toLowerCase()}-story.${ext}`;
      link.href = URL.createObjectURL(blob);
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    } finally {
      setExporting(false);
    }
  };

  // Render a slide into the hidden full-size canvas and save it as a JPEG.
  const exportSlideToFile = async (slide: Slide, index: number) => {
    setPendingExport(slide);
    // Wait for the hidden canvas to paint the slide (and decode its image).
    await new Promise((r) => setTimeout(r, 250));
    const node = exportRef.current;
    if (!node) return;
    const { width, height } = FORMAT_DIMENSIONS[slide.storyFormat];
    const dataUrl = await toJpeg(node, {
      width,
      height,
      pixelRatio: 2,
      quality: 0.95,
      cacheBust: true,
      backgroundColor: "#000000",
    });
    const base = (slide.data.name || "event").replace(/\s+/g, "-").toLowerCase();
    const link = document.createElement("a");
    link.download = `${base}-${index + 1}-story.jpg`;
    link.href = dataUrl;
    link.click();
  };

  const handleExportAll = async () => {
    setExporting(true);
    try {
      for (let i = 0; i < slides.length; i++) {
        await exportSlideToFile(slides[i], i);
        await new Promise((r) => setTimeout(r, 150));
      }
    } finally {
      setPendingExport(null);
      setExporting(false);
    }
  };

  const layoutCatalog: { id: LayoutStyle; label: string; category: EventCategory }[] = [
    // Sport
    { id: "varsity", label: "Varsity", category: "sport" },
    { id: "stadium", label: "Stadium", category: "sport" },
    { id: "racebib", label: "Race Bib", category: "sport" },
    { id: "crest", label: "Crest", category: "sport" },
    { id: "marquee", label: "Marquee", category: "sport" },
    { id: "kickoff", label: "Kickoff", category: "sport" },
    { id: "trophy", label: "Trophy", category: "sport" },
    // Corporate
    { id: "minimal", label: "Minimal", category: "corporate" },
    { id: "editorial", label: "Editorial", category: "corporate" },
    { id: "magazine", label: "Magazine", category: "corporate" },
    { id: "statement", label: "Statement", category: "corporate" },
    { id: "programme", label: "Programme", category: "corporate" },
    { id: "summit", label: "Summit", category: "corporate" },
    { id: "keynote", label: "Keynote", category: "corporate" },
    // Festivals
    { id: "festival", label: "Festival", category: "festivals" },
    { id: "neon", label: "Neon", category: "festivals" },
    { id: "splash", label: "Splash", category: "festivals" },
    { id: "poster", label: "Poster", category: "festivals" },
    { id: "retro", label: "Retro", category: "festivals" },
    { id: "carnival", label: "Carnival", category: "festivals" },
    { id: "glow", label: "Glow", category: "festivals" },
    // Meetups
    { id: "bold", label: "Bold", category: "meetups" },
    { id: "ticket", label: "Ticket", category: "meetups" },
    { id: "polaroid", label: "Polaroid", category: "meetups" },
    { id: "crew", label: "Crew", category: "meetups" },
    { id: "heritage", label: "Heritage", category: "meetups" },
    { id: "social", label: "Social", category: "meetups" },
    { id: "huddle", label: "Huddle", category: "meetups" },
  ];
  const layoutOptions = layoutCatalog.filter((opt) => opt.category === category);

  return (
    <main className="min-h-screen overflow-x-hidden px-4 py-6 md:px-12 md:py-10">
      <header className="mx-auto mb-6 flex max-w-6xl items-center gap-3 md:mb-10">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Sparkles size={20} />
        </span>
        <div>
          <h1 className="text-xl font-bold leading-tight">Story Maker</h1>
          <p className="text-sm text-muted-foreground">Design an Instagram event story</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>
              <Button type="button" variant="outline" size="sm" onClick={signOut}>
                <LogOut size={14} />
                Sign out
              </Button>
            </>
          ) : (
            <Button type="button" variant="outline" size="sm" onClick={signIn}>
              <LogIn size={14} />
              Sign in with Google
            </Button>
          )}
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl min-w-0 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12">
        {/* Preview */}
        <div className="sticky top-0 z-20 -mx-4 flex min-w-0 flex-col items-center gap-3 border-b border-border bg-background/85 px-4 py-4 backdrop-blur lg:static lg:mx-0 lg:gap-4 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
          {/* Format selector — lives right above the output preview */}
          <div className="hidden w-full max-w-[324px] space-y-2 lg:block">
            <Label>Format</Label>
            <div className="grid grid-cols-2 gap-2">
              {formatOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStoryFormat(opt.id)}
                  className={`flex flex-col items-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    storyFormat === opt.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {opt.label}
                  <span className="text-xs font-normal opacity-70">{opt.ratio}</span>
                </button>
              ))}
            </div>
          </div>
          {/* Compact format toggle on mobile — keeps the sticky bar short */}
          <div className="flex w-full items-center justify-center gap-2 lg:hidden">
            {formatOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setStoryFormat(opt.id)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  storyFormat === opt.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-secondary text-secondary-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div
            className="relative overflow-hidden rounded-2xl border border-border lg:rounded-[2rem]"
            style={{ width: outW * previewScale, height: outH * previewScale, boxShadow: "var(--shadow-glow)" }}
          >
            <div
              style={{
                width: outW,
                height: outH,
                transform: `scale(${previewScale})`,
                transformOrigin: "top left",
              }}
            >
              <StoryCanvas ref={canvasRef} data={data} layout={layout} image={image} video={video} videoRef={videoRef} shade={shade / 100} align={align} bw={bw} format={storyFormat} />
            </div>
          </div>
        </div>

        {/* Right column: saved events box + settings form */}
        <div className="flex min-w-0 flex-col gap-5 md:gap-6">
        {/* Saved events — kept in its own box; moves to the bottom on mobile */}
        <div className="order-2 space-y-2 rounded-2xl border-border p-0 lg:order-1 md:border md:bg-card md:p-6">
          <div className="flex items-center justify-between">
            <Label>Saved events</Label>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => saveEvent(data, layout)}
              disabled={!data.name.trim()}
            >
              <Bookmark size={14} />
              Save current
            </Button>
          </div>
          {savedEvents.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Save an event to quickly prefill its details later.
            </p>
          ) : (
            <div className="flex max-h-40 flex-col gap-2 overflow-y-auto">
              {savedEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2"
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => {
                      setData({ ...ev.data, distance: ev.data.distance ?? "" });
                      setLayout(ev.layout);
                      setAlign(DEFAULT_ALIGN[ev.layout] ?? "middle");
                    }}
                  >
                    <p className="truncate text-sm font-medium">{ev.data.name || "Untitled event"}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[ev.data.date, ev.data.time, ev.data.location, ev.data.distance].filter(Boolean).join(" · ") || "No details"}
                    </p>
                  </button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0"
                    onClick={() => removeEvent(ev.id)}
                    aria-label="Delete saved event"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings form */}
        <div className="order-1 space-y-5 rounded-2xl border-border p-0 lg:order-2 md:space-y-6 md:border md:bg-card md:p-6">
          {/* Background media — first thing in the settings */}
          <div className="space-y-2">
            <Label>Background photo or video</Label>
            <input ref={fileRef} type="file" accept="image/*,video/*,.mov,.mp4,.webm,.m4v,video/quicktime" className="hidden" onChange={handleMedia} />
            <div className="flex gap-2">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => fileRef.current?.click()}>
                <ImageUp size={18} />
                {image || video ? "Replace media" : "Upload photo / video"}
              </Button>
              {(image || video) && (
                <Button type="button" variant="outline" size="icon" onClick={clearMedia} aria-label="Remove media">
                  <X size={18} />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              A dark shade is applied so text stays readable. Photos export as PNG; videos can export as a WebM clip.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Layout style</Label>
            <div className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => chooseCategory(cat.id)}
                  className={`flex shrink-0 snap-start items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    category === cat.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <span aria-hidden>{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2">
              {layoutOptions.map((opt) => {
                const thumbScale = 72 / outW;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => chooseLayout(opt.id)}
                    className={`flex shrink-0 snap-start flex-col items-center gap-1.5 rounded-xl border p-1.5 transition-colors ${
                      layout === opt.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary hover:bg-accent"
                    }`}
                  >
                    <div
                      className="overflow-hidden rounded-md border border-border/50"
                      style={{ width: outW * thumbScale, height: outH * thumbScale }}
                    >
                      <div
                        style={{
                          width: outW,
                          height: outH,
                          transform: `scale(${thumbScale})`,
                          transformOrigin: "top left",
                          pointerEvents: "none",
                        }}
                      >
                        <StoryCanvas
                          data={data}
                          layout={opt.id}
                          image={image}
                          video={null}
                          shade={shade / 100}
                          align={DEFAULT_ALIGN[opt.id] ?? "middle"}
                          bw={bw}
                          format={storyFormat}
                        />
                      </div>
                    </div>
                    <span className={`text-xs font-medium ${layout === opt.id ? "text-foreground" : "text-muted-foreground"}`}>
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">Swipe sideways to browse all styles.</p>
          </div>

          {supportsAlign && (
            <div className="space-y-2">
              <Label>Vertical position</Label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: "top", label: "Top", Icon: AlignVerticalJustifyStart },
                    { id: "middle", label: "Middle", Icon: AlignVerticalJustifyCenter },
                    { id: "bottom", label: "Bottom", Icon: AlignVerticalJustifyEnd },
                  ] as const
                ).map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setAlign(id)}
                    className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      align === id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Shade intensity</Label>
              <span className="text-xs text-muted-foreground">{shade}%</span>
            </div>
            <Slider value={[shade]} onValueChange={(v) => setShade(v[0])} min={0} max={90} step={5} />
            <p className="text-xs text-muted-foreground">Darken the background so text stays readable.</p>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-secondary px-4 py-3">
            <div className="space-y-0.5">
              <Label htmlFor="bw" className="cursor-pointer">Black &amp; white</Label>
              <p className="text-xs text-muted-foreground">Desaturate the background image or video.</p>
            </div>
            <Switch id="bw" checked={bw} onCheckedChange={setBw} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Event name</Label>
            <Textarea
              id="name"
              maxLength={60}
              rows={2}
              value={data.name}
              onChange={update("name")}
              placeholder={"Summer Rooftop\nParty"}
              className="resize-none"
            />
            <p className="text-[0.7rem] text-muted-foreground">Press Enter to split the name onto a new line.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 min-w-0">
              <Label htmlFor="date"><CalendarDays size={14} className="mr-1 inline" />Date</Label>
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    type="button"
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
                  >
                    <CalendarDays size={16} />
                    {selectedDate ? format(selectedDate, "PP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="flex gap-2 border-b p-3">
                    <Button type="button" size="sm" variant="secondary" className="flex-1" onClick={() => setDate(today)}>
                      Today
                    </Button>
                    <Button type="button" size="sm" variant="secondary" className="flex-1" onClick={() => setDate(tomorrow)}>
                      Tomorrow
                    </Button>
                  </div>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2 min-w-0">
              <Label htmlFor="time"><Clock size={14} className="mr-1 inline" />Time</Label>
              <Input id="time" type="time" value={data.time} onChange={update("time")} className="block w-full min-w-0 max-w-full appearance-none" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location"><MapPin size={14} className="mr-1 inline" />Location</Label>
            <Input id="location" maxLength={80} value={data.location} onChange={update("location")} placeholder="123 Skyline Ave, NYC" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="distance"><RouteIcon size={14} className="mr-1 inline" />Distance <span className="text-xs font-normal text-muted-foreground">(optional)</span></Label>
            <Input id="distance" maxLength={40} value={data.distance} onChange={update("distance")} placeholder="5K · 10 mi · 42.2 km" />
          </div>

          <Button onClick={handleExport} disabled={exporting} className="w-full" size="lg" variant={video ? "outline" : "default"}>
            <Download size={18} />
            {exporting ? "Exporting…" : "Export story image"}
          </Button>
          {video && (
            <Button onClick={handleExportVideo} disabled={exporting} className="w-full" size="lg">
              <Download size={18} />
              {exporting ? "Exporting…" : "Export story video"}
            </Button>
          )}
          <p className="text-center text-xs text-muted-foreground">
            {video
              ? "Exports a 1080 × 1920 video (MP4 when supported, else WebM) — drop it straight into an Instagram Story."
              : "Exports a high-quality 1080 × 1920 JPEG (2× super-sampled) — Instagram Story spec, ready to post."}
          </p>
        </div>
        </div>
      </div>
    </main>
  );
}
