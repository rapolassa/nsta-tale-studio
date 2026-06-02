import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { toPng, toJpeg } from "html-to-image";
import { format } from "date-fns";
import { CalendarDays, Clock, MapPin, Route as RouteIcon, Download, Sparkles, ImageUp, X, Bookmark, Trash2, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, LogIn, LogOut } from "lucide-react";
import { StoryCanvas, type EventData, type LayoutStyle, type VAlign, type StoryFormat, LAYOUTS_WITH_ALIGN, DEFAULT_ALIGN, FORMAT_DIMENSIONS } from "@/components/StoryCanvas";
import { useSavedEvents } from "@/lib/saved-events";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

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
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [exporting, setExporting] = useState(false);
  const [layout, setLayout] = useState<LayoutStyle>("bold");
  const [storyFormat, setStoryFormat] = useState<StoryFormat>("story");
  const [align, setAlign] = useState<VAlign>("middle");
  const supportsAlign = LAYOUTS_WITH_ALIGN.includes(layout);
  const { width: outW, height: outH } = FORMAT_DIMENSIONS[storyFormat];
  const previewScale = 0.3;
  const formatOptions: { id: StoryFormat; label: string; ratio: string }[] = [
    { id: "story", label: "Story", ratio: "9:16" },
    { id: "reel", label: "Reel", ratio: "9:16" },
    { id: "post", label: "Post", ratio: "4:5" },
  ];

  const chooseLayout = (id: LayoutStyle) => {
    setLayout(id);
    setAlign(DEFAULT_ALIGN[id] ?? "middle");
  };
  const [image, setImage] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [shade, setShade] = useState(45);
  const [bw, setBw] = useState(false);
  const [data, setData] = useState<EventData>({
    name: "Summer Rooftop Party",
    date: "",
    time: "",
    location: "",
    distance: "",
  });
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

  const update = (key: keyof EventData) => (e: React.ChangeEvent<HTMLInputElement>) =>
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

  const handleMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo =
      file.type.startsWith("video") || /\.(mov|mp4|webm|m4v)$/i.test(file.name);
    if (isVideo) {
      // Object URLs play far more reliably than huge data URLs (esp. .mov/.mp4).
      if (video) URL.revokeObjectURL(video);
      setVideo(URL.createObjectURL(file));
      setImage(null);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        if (video) URL.revokeObjectURL(video);
        setVideo(null);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const clearMedia = () => {
    if (video) URL.revokeObjectURL(video);
    setImage(null);
    setVideo(null);
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
          setImage(c.toDataURL("image/jpeg", 0.92));
          setVideo(null);
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
        setVideo(restore);
        setImage(null);
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
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 12_000_000 });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);

      let raf = 0;
      const draw = () => {
        const vw = v.videoWidth || outW;
        const vh = v.videoHeight || outH;
        const scale = Math.max(outW / vw, outH / vh);
        const dw = vw * scale;
        const dh = vh * scale;
        // Grayscale only the video frame; the overlay (text + accents) stays
        // colorful, so we save/restore the canvas filter around the video draw.
        ctx.save();
        if (bw) ctx.filter = "grayscale(100%)";
        ctx.drawImage(v, (outW - dw) / 2, (outH - dh) / 2, dw, dh);
        ctx.restore();
        ctx.drawImage(overlay, 0, 0, outW, outH);
        raf = requestAnimationFrame(draw);
      };

      // Record one full loop of the video (capped at 15s).
      const duration = Math.min(v.duration && isFinite(v.duration) ? v.duration : 10, 15);
      v.currentTime = 0;
      await v.play();
      draw();
      recorder.start();

      await new Promise((r) => setTimeout(r, duration * 1000));

      cancelAnimationFrame(raf);
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

  const layoutOptions: { id: LayoutStyle; label: string }[] = [
    { id: "bold", label: "Bold" },
    { id: "editorial", label: "Editorial" },
    { id: "minimal", label: "Minimal" },
    { id: "ticket", label: "Ticket" },
    { id: "poster", label: "Poster" },
    { id: "festival", label: "Festival" },
    { id: "neon", label: "Neon" },
    { id: "magazine", label: "Magazine" },
    { id: "polaroid", label: "Polaroid" },
    { id: "retro", label: "Retro" },
    { id: "marquee", label: "Marquee" },
    { id: "crest", label: "Crest" },
    { id: "varsity", label: "Varsity" },
    { id: "stadium", label: "Stadium" },
    { id: "heritage", label: "Heritage" },
    { id: "racebib", label: "Race Bib" },
    { id: "crew", label: "Crew" },
    { id: "statement", label: "Statement" },
    { id: "splash", label: "Splash" },
    { id: "programme", label: "Programme" },
  ];

  return (
    <main className="min-h-screen px-6 py-10 md:px-12">
      <header className="mx-auto mb-10 flex max-w-6xl items-center gap-3">
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

      <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[1fr_400px]">
        {/* Preview */}
        <div className="flex justify-center">
          <div
            className="relative overflow-hidden rounded-[2rem] border border-border"
            style={{ width: 324, height: 576, boxShadow: "var(--shadow-glow)" }}
          >
            <div
              style={{
                width: 1080,
                height: 1920,
                transform: "scale(0.3)",
                transformOrigin: "top left",
              }}
            >
              <StoryCanvas ref={canvasRef} data={data} layout={layout} image={image} video={video} videoRef={videoRef} shade={shade / 100} align={align} bw={bw} />
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6 rounded-2xl border border-border bg-card p-6">
          <div className="space-y-2">
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

          <div className="space-y-2">
            <Label>Layout style</Label>
            <div className="grid grid-cols-3 gap-2">
              {layoutOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => chooseLayout(opt.id)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    layout === opt.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
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
            <Input id="name" maxLength={60} value={data.name} onChange={update("name")} placeholder="Summer Rooftop Party" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
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
            <div className="space-y-2">
              <Label htmlFor="time"><Clock size={14} className="mr-1 inline" />Time</Label>
              <Input id="time" type="time" value={data.time} onChange={update("time")} />
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
    </main>
  );
}
