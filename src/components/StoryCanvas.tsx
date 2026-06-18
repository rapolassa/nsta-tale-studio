import { forwardRef, useRef, useImperativeHandle } from "react";
import bg from "@/assets/story-bg.jpg";
import { CalendarDays, Clock, MapPin, Route } from "lucide-react";

export interface EventData {
  name: string;
  date: string;
  time: string;
  location: string;
  distance: string;
}

export type LayoutStyle =
  | "bold"
  | "editorial"
  | "minimal"
  | "ticket"
  | "poster"
  | "festival"
  | "neon"
  | "magazine"
  | "polaroid"
  | "retro"
  | "marquee"
  | "crest"
  | "varsity"
  | "stadium"
  | "heritage"
  | "racebib"
  | "crew"
  | "statement"
  | "splash"
  | "programme"
  | "kickoff"
  | "trophy"
  | "summit"
  | "keynote"
  | "carnival"
  | "glow"
  | "social"
  | "huddle";

export type VAlign = "top" | "middle" | "bottom";

export type StoryFormat = "story" | "post";

/** Pixel dimensions for each output format. */
export const FORMAT_DIMENSIONS: Record<StoryFormat, { width: number; height: number; label: string; ratio: string }> = {
  story: { width: 1080, height: 1920, label: "Story / Reel", ratio: "9:16" },
  post: { width: 1080, height: 1350, label: "Post", ratio: "4:5" },
};

/** Layouts whose content block can be shifted vertically. */
export const LAYOUTS_WITH_ALIGN: readonly LayoutStyle[] = [
  "festival",
  "poster",
  "retro",
  "crest",
  "crew",
] as const;

/** Default vertical alignment for each layout that supports it. */
export const DEFAULT_ALIGN: Partial<Record<LayoutStyle, VAlign>> = {
  festival: "middle",
  poster: "middle",
  retro: "middle",
  crest: "middle",
  crew: "bottom",
};

function vAlignClass(align: VAlign) {
  switch (align) {
    case "top":
      return "justify-start";
    case "bottom":
      return "justify-end";
    default:
      return "justify-center";
  }
}

function formatDate(date: string) {
  if (!date) return "";
  const d = new Date(date + "T00:00:00");
  if (isNaN(d.getTime())) return date;
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(time: string) {
  if (!time) return "";
  const [h, m] = time.split(":");
  const d = new Date();
  d.setHours(Number(h), Number(m));
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

interface StoryCanvasProps {
  data: EventData;
  layout?: LayoutStyle;
  /** Custom uploaded background image (data URL). Falls back to default bg. */
  image?: string | null;
  /** Custom uploaded background video (data URL). Takes priority over image. */
  video?: string | null;
  /** Ref to the underlying <video> element so the parent can capture a frame. */
  videoRef?: React.Ref<HTMLVideoElement>;
  /** Darkness of the overlay shade, 0 (none) – 1 (black). Defaults to 0.45. */
  shade?: number;
  /** Vertical alignment for layouts that support it. */
  align?: VAlign;
  /** Render the uploaded photo/video as black & white. */
  bw?: boolean;
  /** Output format controlling aspect ratio / dimensions. */
  format?: StoryFormat;
}

/**
 * Renders at full 1080x1920 resolution. The parent scales it down with CSS
 * transform so export captures crisp full-size pixels.
 */
export const StoryCanvas = forwardRef<HTMLDivElement, StoryCanvasProps>(
  ({ data, layout = "bold", image, video, videoRef, shade = 0.45, align, bw = false, format = "story" }, ref) => {
    const effectiveAlign: VAlign = align ?? DEFAULT_ALIGN[layout] ?? "middle";
    const { width: cw, height: ch } = FORMAT_DIMENSIONS[format];
    const innerVideoRef = useRef<HTMLVideoElement>(null);
    useImperativeHandle(videoRef, () => innerVideoRef.current as HTMLVideoElement);
    const bgFilter = bw ? "grayscale(100%)" : undefined;
    return (
      <div
        ref={ref}
        className="relative overflow-hidden"
        style={{ width: cw, height: ch }}
      >
        {video ? (
          <video
            ref={innerVideoRef}
            src={video}
            autoPlay
            loop
            muted
            playsInline
            width={cw}
            height={ch}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: bgFilter }}
          />
        ) : (
          <img
            src={image || bg}
            alt=""
            width={cw}
            height={ch}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: bgFilter }}
          />
        )}
        {/* Dark shade so text stays legible on any uploaded image.
            At shade=0 no overlay is rendered at all. */}
        {shade > 0 && (
          <>
            <div className="absolute inset-0 bg-black" style={{ opacity: shade }} />
            <div
              className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"
              style={{ opacity: shade }}
            />
          </>
        )}

        {layout === "bold" && <BoldLayout data={data} />}
        {layout === "editorial" && <EditorialLayout data={data} />}
        {layout === "minimal" && <MinimalLayout data={data} />}
        {layout === "ticket" && <TicketLayout data={data} />}
        {layout === "poster" && <PosterLayout data={data} align={effectiveAlign} />}
        {layout === "festival" && <FestivalLayout data={data} align={effectiveAlign} />}
        {layout === "neon" && <NeonLayout data={data} />}
        {layout === "magazine" && <MagazineLayout data={data} />}
        {layout === "polaroid" && <PolaroidLayout data={data} />}
        {layout === "retro" && <RetroLayout data={data} align={effectiveAlign} />}
        {layout === "marquee" && <MarqueeLayout data={data} />}
        {layout === "crest" && <CrestLayout data={data} align={effectiveAlign} />}
        {layout === "varsity" && <VarsityLayout data={data} />}
        {layout === "stadium" && <StadiumLayout data={data} />}
        {layout === "heritage" && <HeritageLayout data={data} />}
        {layout === "racebib" && <RaceBibLayout data={data} />}
        {layout === "crew" && <CrewLayout data={data} align={effectiveAlign} />}
        {layout === "statement" && <StatementLayout data={data} />}
        {layout === "splash" && <SplashLayout data={data} />}
        {layout === "programme" && <ProgrammeLayout data={data} />}
        {layout === "kickoff" && <KickoffLayout data={data} />}
        {layout === "trophy" && <TrophyLayout data={data} />}
        {layout === "summit" && <SummitLayout data={data} />}
        {layout === "keynote" && <KeynoteLayout data={data} />}
        {layout === "carnival" && <CarnivalLayout data={data} />}
        {layout === "glow" && <GlowLayout data={data} />}
        {layout === "social" && <SocialLayout data={data} />}
        {layout === "huddle" && <HuddleLayout data={data} />}
      </div>
    );
  }
);

StoryCanvas.displayName = "StoryCanvas";

/* ---------------- Layout 1: BOLD (big uppercase sans, bottom-aligned) -------- */
function BoldLayout({ data }: { data: EventData }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-between p-24">
      <div className="flex items-center gap-4">
        <span className="h-4 w-4 rounded-full bg-accent" />
        <span className="text-3xl font-medium uppercase tracking-[0.4em] text-white/80">
          You're invited
        </span>
      </div>

      <div className="space-y-12">
        <h1 className="text-[120px] font-extrabold uppercase leading-[0.92] tracking-tight text-white drop-shadow-lg">
          {data.name || "Event Name"}
        </h1>

        <div className="space-y-7 text-white/95">
          <Row icon={<CalendarDays size={56} strokeWidth={2.2} />} text={formatDate(data.date) || "Pick a date"} />
          <Row icon={<Clock size={56} strokeWidth={2.2} />} text={formatTime(data.time) || "Pick a time"} />
          <Row icon={<MapPin size={56} strokeWidth={2.2} />} text={data.location || "Add location"} />
          {data.distance && (
            <Row icon={<Route size={56} strokeWidth={2.2} />} text={data.distance} />
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-7">
      <span className="flex h-[100px] w-[100px] shrink-0 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-sm">
        {icon}
      </span>
      <span className="text-5xl font-semibold leading-tight">{text}</span>
    </div>
  );
}

/* ---------------- Layout 2: EDITORIAL (centered serif, labeled details) ----- */
function EditorialLayout({ data }: { data: EventData }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between p-24 text-center text-white">
      <h1 className="mt-10 font-serif text-[140px] font-medium leading-[0.95] tracking-tight drop-shadow-lg">
        {data.name || "Event Name"}
      </h1>

      <div className="mb-16 w-full max-w-[820px] space-y-8">
        <div className="flex justify-center gap-5">
          <span className="h-7 w-7 rotate-45 bg-accent" />
          <span className="h-7 w-7 rotate-45 bg-accent" />
          <span className="h-7 w-7 rotate-45 bg-accent" />
        </div>
        <LabelRow label="Date" value={formatDate(data.date) || "Pick a date"} />
        <LabelRow label="Time" value={formatTime(data.time) || "Pick a time"} />
        <LabelRow label="Location" value={data.location || "Add location"} />
        {data.distance && <LabelRow label="Distance" value={data.distance} />}
      </div>
    </div>
  );
}

function LabelRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-t border-white/25 pt-5">
      <span className="text-3xl font-bold uppercase tracking-[0.3em] text-white/80">{label}</span>
      <span className="text-4xl font-semibold">{value}</span>
    </div>
  );
}

/* ---------------- Layout 3: MINIMAL (top-left heading, footer details) ------ */
function MinimalLayout({ data }: { data: EventData }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-between p-24 text-white">
      <h1 className="max-w-[850px] text-[150px] font-extrabold uppercase leading-[0.88] tracking-tighter drop-shadow-lg">
        {data.name || "Event Name"}
      </h1>

      <div className="space-y-4">
        <p className="text-5xl font-bold leading-tight">
          {formatDate(data.date) || "Pick a date"}
        </p>
        <p className="text-5xl font-light leading-tight text-white/90">
          {formatTime(data.time) || "Pick a time"}
        </p>
        <p className="text-4xl font-light uppercase tracking-wide text-white/80">
          {data.location || "Add location"}
        </p>
        {data.distance && (
          <p className="text-4xl font-light uppercase tracking-wide text-white/80">
            {data.distance}
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------------- Layout 4: TICKET (boxed card, stub-style details) -------- */
function TicketLayout({ data }: { data: EventData }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-20">
      <div className="w-full rounded-[2.5rem] border-2 border-white/30 bg-white/10 p-16 text-center text-white backdrop-blur-md">
        <span className="text-3xl font-bold uppercase tracking-[0.5em] text-accent">
          Admit One
        </span>
        <h1 className="my-12 text-[110px] font-extrabold uppercase leading-[0.9] tracking-tight drop-shadow-lg">
          {data.name || "Event Name"}
        </h1>
        <div className="space-y-7 border-t-2 border-dashed border-white/30 pt-12">
          <LabelRow label="Date" value={formatDate(data.date) || "Pick a date"} />
          <LabelRow label="Time" value={formatTime(data.time) || "Pick a time"} />
          <LabelRow label="Location" value={data.location || "Add location"} />
          {data.distance && <LabelRow label="Distance" value={data.distance} />}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Layout 5: POSTER (huge centered title, top + bottom) ----- */
function PosterLayout({ data, align = "middle" }: { data: EventData; align?: VAlign }) {
  return (
    <div className={`absolute inset-0 flex flex-col items-center ${vAlignClass(align)} gap-16 p-20 text-center text-white`}>
      <p className="text-4xl font-bold uppercase tracking-[0.4em] text-white/85">
        {formatDate(data.date) || "Pick a date"}
      </p>
      <h1 className="text-[170px] font-black uppercase leading-[0.85] tracking-tighter drop-shadow-2xl">
        {data.name || "Event Name"}
      </h1>
      <div className="space-y-3">
        <p className="text-5xl font-semibold">{formatTime(data.time) || "Pick a time"}</p>
        <p className="text-4xl font-light uppercase tracking-wide text-white/85">
          {data.location || "Add location"}
        </p>
        {data.distance && (
          <p className="text-4xl font-light uppercase tracking-wide text-white/85">
            {data.distance}
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------------- Layout 6: FESTIVAL (lineup-style stacked, left aligned) -- */
function FestivalLayout({ data, align = "middle" }: { data: EventData; align?: VAlign }) {
  return (
    <div className={`absolute inset-0 flex flex-col ${vAlignClass(align)} gap-10 p-24 text-white`}>
      <div className="h-2 w-40 rounded-full bg-accent" />
      <h1 className="text-[130px] font-black uppercase leading-[0.85] tracking-tighter drop-shadow-lg">
        {data.name || "Event Name"}
      </h1>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-4xl font-bold uppercase tracking-wide">
        <span>{formatDate(data.date) || "Pick a date"}</span>
        <span className="text-accent">/</span>
        <span>{formatTime(data.time) || "Pick a time"}</span>
        <span className="text-accent">/</span>
        <span className="text-white/85">{data.location || "Add location"}</span>
        {data.distance && (
          <>
            <span className="text-accent">/</span>
            <span className="text-white/85">{data.distance}</span>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- Layout 7: NEON (cyberpunk glow, double frame) ------------ */
function NeonLayout({ data }: { data: EventData }) {
  const pink = "#ff3df8";
  const cyan = "#22e7ff";
  return (
    <div className="absolute inset-0 p-16 text-white">
      <div
        className="flex h-full w-full flex-col items-center justify-center p-20 text-center"
        style={{
          border: `3px solid ${pink}`,
          borderRadius: 28,
          boxShadow: `0 0 50px ${pink}, inset 0 0 70px ${pink}55`,
        }}
      >
        <div
          className="mb-16 inline-block px-12 py-4 text-3xl font-bold uppercase tracking-[0.5em]"
          style={{
            border: `2px solid ${cyan}`,
            color: cyan,
            textShadow: `0 0 20px ${cyan}`,
            borderRadius: 999,
          }}
        >
          Live Tonight
        </div>
        <h1
          className="text-[140px] font-black uppercase leading-[0.85] tracking-tight"
          style={{
            color: pink,
            textShadow: `0 0 25px ${pink}, 0 0 55px ${pink}, 0 0 90px ${pink}, 0 0 4px #ffffff`,
          }}
        >
          {data.name || "Event Name"}
        </h1>
        <div
          className="mt-20 space-y-7 text-5xl font-bold uppercase tracking-wide"
          style={{ color: cyan, textShadow: `0 0 18px ${cyan}, 0 0 40px ${cyan}` }}
        >
          <p>{formatDate(data.date) || "Pick a date"}</p>
          <p>{formatTime(data.time) || "Pick a time"}</p>
          <p style={{ color: "#ffffff", textShadow: "0 0 14px #ffffff" }}>
            {data.location || "Add location"}
          </p>
          {data.distance && <p>{data.distance}</p>}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Layout 8: MAGAZINE (editorial split, big serif) ---------- */
function MagazineLayout({ data }: { data: EventData }) {
  return (
    <div className="absolute inset-0 flex flex-col p-20 text-white">
      <div className="flex items-start justify-between border-b border-white/40 pb-6 text-2xl font-medium uppercase tracking-[0.45em]">
        <span>Issue Nº 01</span>
        <span className="text-accent">Vol. MMXXVI</span>
      </div>

      <div className="flex flex-1 items-center">
        <div
          className="mr-12 self-stretch"
          style={{ width: 8, background: "var(--color-accent)" }}
        />
        <div className="flex-1">
          <p className="mb-8 text-3xl font-medium uppercase tracking-[0.4em] text-accent">
            Presenting
          </p>
          <h1 className="font-serif text-[150px] font-medium leading-[0.92] tracking-tight drop-shadow-lg">
            {data.name || "Event Name"}
          </h1>
        </div>
      </div>

      <div
        className={`grid border-t border-white/40 pt-10 ${data.distance ? "grid-cols-4" : "grid-cols-3"}`}
      >
        <MagCol label="When" value={formatDate(data.date) || "TBA"} />
        <MagCol label="Hour" value={formatTime(data.time) || "TBA"} />
        <MagCol label="Where" value={data.location || "TBA"} last={!data.distance} />
        {data.distance && <MagCol label="Distance" value={data.distance} last />}
      </div>
    </div>
  );
}

function MagCol({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      className="px-6"
      style={{ borderRight: last ? "none" : "1px solid rgba(255,255,255,0.25)" }}
    >
      <p className="text-xl uppercase tracking-[0.4em] text-white/65">{label}</p>
      <p className="mt-4 text-4xl font-bold leading-tight">{value}</p>
    </div>
  );
}

/* ---------------- Layout 9: POLAROID (tilted snapshot card) ---------------- */
function PolaroidLayout({ data }: { data: EventData }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-16">
      <div
        className="relative bg-white p-10 pb-24 text-black"
        style={{
          width: 880,
          transform: "rotate(-3deg)",
          boxShadow:
            "0 30px 80px -10px rgba(0,0,0,0.6), 0 8px 20px -8px rgba(0,0,0,0.4)",
        }}
      >
        <div className="absolute -right-6 -top-10 -rotate-12 rounded-md bg-accent px-6 py-3 text-2xl font-bold uppercase tracking-[0.3em] text-accent-foreground shadow-lg">
          Save the date
        </div>
        <div
          className="relative flex aspect-[4/5] w-full flex-col items-center justify-center overflow-hidden p-12 text-center"
          style={{
            background:
              "linear-gradient(135deg, #FFB7DE 0%, #FFD27A 45%, #FF7E5F 100%)",
          }}
        >
          <p className="mb-10 text-3xl font-bold uppercase tracking-[0.5em] text-black/75">
            You're invited
          </p>
          <h1 className="text-[110px] font-black uppercase leading-[0.88] tracking-tight text-black">
            {data.name || "Event Name"}
          </h1>
          <div className="mt-12 h-1 w-32 bg-black/70" />
          <p className="mt-10 text-4xl font-semibold uppercase tracking-[0.25em] text-black/85">
            {formatDate(data.date) || "Pick a date"}
          </p>
        </div>
        <div className="mt-8 text-center">
          <p
            className="text-5xl font-medium italic"
            style={{ fontFamily: "'Brush Script MT','Snell Roundhand','Apple Chancery',cursive" }}
          >
            {formatTime(data.time) || "Pick a time"} · {data.location || "Add location"}
          </p>
          {data.distance && (
            <p
              className="mt-3 text-4xl font-medium italic text-black/75"
              style={{ fontFamily: "'Brush Script MT','Snell Roundhand','Apple Chancery',cursive" }}
            >
              {data.distance}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Layout 10: RETRO (70s sunset gradient) ------------------- */
function RetroLayout({ data, align = "middle" }: { data: EventData; align?: VAlign }) {
  return (
    <div className={`absolute inset-0 flex flex-col items-center ${vAlignClass(align)} gap-12 p-20 text-center text-white`}>
      <p
        className="text-6xl"
        style={{
          fontFamily: "'Brush Script MT','Snell Roundhand','Apple Chancery',cursive",
          color: "#FFD27A",
          textShadow: "0 4px 14px rgba(0,0,0,0.55)",
        }}
      >
        Join us at
      </p>
      <h1
        className="text-[160px] font-black uppercase leading-[0.85] tracking-tighter"
        style={{
          backgroundImage:
            "linear-gradient(180deg, #FFE176 0%, #FFB04A 35%, #FF6F3D 65%, #E73C7E 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          color: "transparent",
          filter: "drop-shadow(0 10px 22px rgba(0,0,0,0.55))",
        }}
      >
        {data.name || "Event Name"}
      </h1>
      <div className="flex items-center gap-8">
        <span className="h-[3px] w-24 rounded-full bg-white/80" />
        <span className="text-3xl uppercase tracking-[0.5em] text-white/85">
          Est. {new Date().getFullYear()}
        </span>
        <span className="h-[3px] w-24 rounded-full bg-white/80" />
      </div>
      <div className="mt-10 space-y-5">
        <p
          className="text-6xl italic"
          style={{
            fontFamily: "'Brush Script MT','Snell Roundhand','Apple Chancery',cursive",
            color: "#FFE7B5",
          }}
        >
          {formatDate(data.date) || "Pick a date"}
        </p>
        <p className="text-4xl uppercase tracking-[0.35em]">
          {formatTime(data.time) || "Pick a time"}
        </p>
        <p className="text-4xl uppercase tracking-[0.35em] text-white/85">
          {data.location || "Add location"}
        </p>
        {data.distance && (
          <p className="text-4xl uppercase tracking-[0.35em] text-white/85">
            {data.distance}
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------------- Layout 11: MARQUEE (brutalist ticker strips) ------------- */
function MarqueeLayout({ data }: { data: EventData }) {
  const name = (data.name || "Event Name").toUpperCase();
  const strip = Array.from({ length: 4 }).fill(name).join("  •  ");
  return (
    <div className="absolute inset-0 flex flex-col text-white">
      <div
        className="flex h-[200px] items-center overflow-hidden bg-accent"
        style={{ transform: "rotate(-3deg)", marginTop: 80, marginLeft: -40, marginRight: -40 }}
      >
        <p className="whitespace-nowrap text-[110px] font-black uppercase leading-none text-accent-foreground">
          {strip}  •  {strip}
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-14 px-16 text-center">
        <h1 className="text-[170px] font-black uppercase leading-[0.85] tracking-tighter drop-shadow-2xl">
          {data.name || "Event Name"}
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-4xl font-extrabold uppercase tracking-wide">
          <span>{formatDate(data.date) || "TBA"}</span>
          <span className="text-accent">/</span>
          <span>{formatTime(data.time) || "TBA"}</span>
          <span className="text-accent">/</span>
          <span className="text-white/85">{data.location || "TBA"}</span>
          {data.distance && (
            <>
              <span className="text-accent">/</span>
              <span className="text-white/85">{data.distance}</span>
            </>
          )}
        </div>
      </div>

      <div
        className="flex h-[200px] items-center overflow-hidden bg-accent"
        style={{ transform: "rotate(-3deg)", marginBottom: 80, marginLeft: -40, marginRight: -40 }}
      >
        <p className="whitespace-nowrap text-[110px] font-black uppercase leading-none text-accent-foreground">
          {strip}  •  {strip}
        </p>
      </div>
    </div>
  );
}

/* ---------------- Layout 12: CREST (classic football/soccer club crest) ---- */
function CrestLayout({ data, align = "middle" }: { data: EventData; align?: VAlign }) {
  const initials =
    (data.name || "Sport Club")
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 3)
      .join("")
      .toUpperCase() || "SC";
  return (
    <div className={`absolute inset-0 flex flex-col items-center ${vAlignClass(align)} gap-10 p-16 text-center text-white`}>
      <div className="relative flex h-[360px] w-[360px] items-center justify-center">
        <div className="absolute inset-0 rounded-full border-[10px] border-accent" />
        <div className="absolute inset-6 rounded-full border-2 border-white/70" />
        <div className="absolute inset-10 flex items-center justify-center rounded-full bg-black/55">
          <span className="font-serif text-[150px] font-black leading-none">{initials}</span>
        </div>
      </div>
      <div className="flex items-center gap-5">
        <span className="text-3xl text-accent">★</span>
        <span className="text-2xl font-bold uppercase tracking-[0.5em] text-accent">Sport Club</span>
        <span className="text-3xl text-accent">★</span>
      </div>
      <h1 className="font-serif text-[110px] font-bold uppercase leading-[0.92] tracking-tight drop-shadow-lg">
        {data.name || "Event Name"}
      </h1>
      <div className="flex items-center gap-6">
        <span className="h-px w-28 bg-white/70" />
        <span className="text-2xl font-bold uppercase tracking-[0.5em] text-white/85">
          EST. {new Date().getFullYear()}
        </span>
        <span className="h-px w-28 bg-white/70" />
      </div>
      <div className="space-y-3 font-serif text-3xl">
        <p>{formatDate(data.date) || "Pick a date"}</p>
        <p>
          {formatTime(data.time) || "Pick a time"} · {data.location || "Add location"}
        </p>
        {data.distance && <p className="italic">{data.distance}</p>}
      </div>
    </div>
  );
}

/* ---------------- Layout 13: VARSITY (collegiate athletic block letters) --- */
function VarsityLayout({ data }: { data: EventData }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between p-20 text-center text-white">
      <div className="flex items-center gap-6 border-y-4 border-white px-10 py-5 text-3xl font-black uppercase tracking-[0.5em]">
        <span className="text-accent">★</span>
        <span>Athletics Dept.</span>
        <span className="text-accent">★</span>
      </div>

      <div className="flex flex-col items-center gap-14">
        <h1
          className="text-[180px] font-black uppercase leading-[0.85] tracking-tighter"
          style={{
            fontFamily: "'Impact','Arial Black','Helvetica Neue',sans-serif",
            WebkitTextStroke: "5px #ffffff",
            color: "transparent",
            textShadow: "10px 10px 0 #000000, 14px 14px 0 var(--color-accent)",
          }}
        >
          {data.name || "Event Name"}
        </h1>
        <div
          className="bg-accent px-16 py-5 text-4xl font-black uppercase tracking-[0.35em] text-accent-foreground"
          style={{
            clipPath: "polygon(4% 0, 96% 0, 100% 50%, 96% 100%, 4% 100%, 0 50%)",
          }}
        >
          Game Day
        </div>
      </div>

      <div className="space-y-3 text-3xl font-black uppercase tracking-widest">
        <p>
          {formatDate(data.date) || "Pick a date"} <span className="text-accent">·</span>{" "}
          {formatTime(data.time) || "Pick a time"}
        </p>
        <p className="text-white/85">{data.location || "Add location"}</p>
        {data.distance && <p className="text-white/85">{data.distance}</p>}
      </div>
    </div>
  );
}

/* ---------------- Layout 14: STADIUM (matchday programme poster) ----------- */
function StadiumLayout({ data }: { data: EventData }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-between p-20 text-white">
      <div className="flex items-baseline justify-between border-b-4 border-accent pb-6">
        <p className="text-3xl font-black uppercase tracking-[0.5em] text-accent">Match Day</p>
        <p className="text-2xl font-bold uppercase tracking-widest">
          {formatDate(data.date) || "Pick a date"}
        </p>
      </div>

      <div className="space-y-10 text-center">
        <p className="text-3xl font-bold uppercase tracking-[0.5em] text-white/75">Featuring</p>
        <h1 className="text-[170px] font-black uppercase leading-[0.82] tracking-tighter drop-shadow-2xl">
          {data.name || "Event Name"}
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-10 border-t-4 border-accent pt-10">
        <div>
          <p className="text-2xl font-bold uppercase tracking-[0.45em] text-accent">Kick-Off</p>
          <p className="mt-4 text-6xl font-black leading-tight">
            {formatTime(data.time) || "TBA"}
          </p>
        </div>
        <div>
          <p className="text-2xl font-bold uppercase tracking-[0.45em] text-accent">Venue</p>
          <p className="mt-4 text-4xl font-black leading-tight">{data.location || "TBA"}</p>
          {data.distance && (
            <p className="mt-2 text-2xl font-bold uppercase tracking-wide text-white/85">
              {data.distance}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Layout 15: HERITAGE (vintage members club, serif) -------- */
function HeritageLayout({ data }: { data: EventData }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-16">
      <div
        className="flex w-full flex-col items-center p-16 text-center text-white"
        style={{
          border: "3px double rgba(255,255,255,0.85)",
          background: "rgba(0,0,0,0.4)",
          boxShadow: "inset 0 0 0 12px rgba(255,255,255,0.06)",
        }}
      >
        <p className="font-serif text-4xl italic tracking-widest text-accent">
          ❦ &nbsp;Since {new Date().getFullYear()}&nbsp; ❦
        </p>
        <div className="mt-8 flex items-center gap-5">
          <span className="h-px w-20 bg-white/70" />
          <span className="text-2xl font-bold uppercase tracking-[0.5em] text-white/85">
            Club Society
          </span>
          <span className="h-px w-20 bg-white/70" />
        </div>
        <h1 className="my-14 font-serif text-[120px] font-medium leading-[0.92] tracking-tight">
          {data.name || "Event Name"}
        </h1>
        <Ornament />
        <div className="mt-12 space-y-4 font-serif text-4xl">
          <p>{formatDate(data.date) || "Pick a date"}</p>
          <p>{formatTime(data.time) || "Pick a time"}</p>
          <p className="italic">{data.location || "Add location"}</p>
          {data.distance && <p className="italic">{data.distance}</p>}
        </div>
        <Ornament className="mt-14" />
        <p className="mt-10 font-serif text-2xl italic uppercase tracking-[0.45em] text-white/65">
          By invitation only
        </p>
      </div>
    </div>
  );
}

function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="h-px w-32 bg-white/55" />
      <span className="h-3 w-3 rotate-45 bg-accent" />
      <span className="h-px w-12 bg-white/55" />
      <span className="h-3 w-3 rotate-45 bg-white" />
      <span className="h-px w-12 bg-white/55" />
      <span className="h-3 w-3 rotate-45 bg-accent" />
      <span className="h-px w-32 bg-white/55" />
    </div>
  );
}

/* ---------------- Layout 16: RACE BIB (marathon-style bib + number) -------- */
function RaceBibLayout({ data }: { data: EventData }) {
  const seed = (data.name || "Race Day")
    .split("")
    .reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const num = String((seed * 31) % 9000 + 100).padStart(4, "0");
  return (
    <div className="absolute inset-0 flex items-center justify-center p-12">
      <div className="relative w-full max-w-[940px] bg-white text-black shadow-2xl">
        <span className="absolute -top-4 left-12 h-7 w-7 rounded-full bg-black/85" />
        <span className="absolute -top-4 right-12 h-7 w-7 rounded-full bg-black/85" />
        <span className="absolute -bottom-4 left-12 h-7 w-7 rounded-full bg-black/85" />
        <span className="absolute -bottom-4 right-12 h-7 w-7 rounded-full bg-black/85" />

        <div className="bg-black px-10 py-6 text-center">
          <p className="truncate text-3xl font-black uppercase tracking-[0.5em] text-white">
            {data.name || "Race Day"}
          </p>
        </div>

        <div className="flex items-center justify-center px-10 py-6">
          <p
            className="font-black tabular-nums leading-none"
            style={{ fontSize: 360, color: "#000" }}
          >
            {num}
          </p>
        </div>

        <div className="grid grid-cols-3 border-y-[6px] border-black">
          <BibCell label="Date" value={formatDate(data.date) || "TBA"} />
          <BibCell label="Start" value={formatTime(data.time) || "TBA"} />
          <BibCell
            label={data.distance ? "Distance" : "Course"}
            value={data.distance || data.location || "TBA"}
            last
          />
        </div>

        {data.distance && data.location && (
          <p className="bg-black py-4 text-center text-2xl font-bold uppercase tracking-[0.5em] text-white">
            {data.location}
          </p>
        )}
      </div>
    </div>
  );
}

function BibCell({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center px-4 py-6 text-center"
      style={{ borderRight: last ? "none" : "4px solid #000" }}
    >
      <p className="text-xl font-bold uppercase tracking-[0.4em] text-black/60">{label}</p>
      <p className="mt-3 text-3xl font-black uppercase leading-tight">{value}</p>
    </div>
  );
}

/* ---------------- Layout 17: CREW (bottom-aligned, eyebrow + huge title) --- */
function CrewLayout({ data, align = "bottom" }: { data: EventData; align?: VAlign }) {
  return (
    <div className={`absolute inset-0 flex flex-col ${vAlignClass(align)} p-20 text-white`}>
      <div className="space-y-6">
        <p className="text-3xl font-bold uppercase tracking-[0.3em]">
          {formatDate(data.date) || "Pick a date"}
          <span className="mx-6 text-white/70">//</span>
          {formatTime(data.time) || "Pick a time"}
        </p>
        <h1 className="text-[160px] font-black uppercase leading-[0.9] tracking-tight">
          {data.name || "Event Name"}
        </h1>
        <div className="flex flex-wrap items-baseline gap-x-12 gap-y-3 pt-2 text-3xl font-bold uppercase tracking-wide">
          <span>{data.location || "Add location"}</span>
          {data.distance && <span className="text-white/85">{data.distance}</span>}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Layout 18: STATEMENT (top title, bottom stack, side date)  */
function StatementLayout({ data }: { data: EventData }) {
  const sideDate = data.date
    ? data.date.split("-").reverse().join(".")
    : "DD.MM.YYYY";
  return (
    <div className="absolute inset-0 p-20 text-white">
      <h1 className="text-[150px] font-black leading-[0.95] tracking-tight">
        {data.name || "Event Name"}
      </h1>

      <div className="absolute bottom-20 left-20 space-y-3">
        <p className="text-5xl font-bold leading-tight">{data.location || "Add location"}</p>
        <p className="text-5xl font-bold leading-tight">
          @{formatTime(data.time) || "Pick a time"}
        </p>
        {data.distance && (
          <p className="text-4xl font-bold leading-tight text-white/90">{data.distance}</p>
        )}
      </div>

      <div
        className="absolute bottom-32 right-16"
        style={{ writingMode: "vertical-rl" }}
      >
        <p className="text-3xl font-medium tracking-[0.4em] text-white/95">{sideDate}</p>
      </div>
    </div>
  );
}

/* ---------------- Layout 19: SPLASH (right-aligned title, scattered italic) */
function SplashLayout({ data }: { data: EventData }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-between p-20 text-white">
      <p className="text-2xl font-bold uppercase tracking-[0.4em] text-white/95">Run Club</p>

      <div className="flex flex-col items-end gap-2">
        <h1 className="text-right text-[140px] font-black uppercase leading-[0.88] tracking-tighter">
          {data.name || "Event Name"}
        </h1>
        {data.distance && (
          <p
            className="text-[110px] italic leading-none"
            style={{
              fontFamily: "'Brush Script MT','Snell Roundhand','Apple Chancery',cursive",
            }}
          >
            {data.distance}
          </p>
        )}
      </div>

      <div className="flex items-end justify-between gap-12">
        <p
          className="text-3xl italic leading-snug"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {formatDate(data.date) || "Pick a date"}
        </p>
        <div
          className="space-y-1 text-right text-3xl italic leading-snug"
          style={{ fontFamily: "Georgia, serif" }}
        >
          <p>meet at {formatTime(data.time) || "Pick a time"}</p>
          <p>{data.location || "Add location"}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Layout 20: PROGRAMME (stacked serif, label : value rows) - */
function ProgrammeLayout({ data }: { data: EventData }) {
  return (
    <div className="absolute inset-0 flex flex-col p-20 text-white">
      <h1 className="text-center font-serif text-[170px] font-medium leading-[0.88] tracking-tight">
        {data.name || "Event Name"}
      </h1>

      <div className="mt-auto space-y-8">
        <ProgrammeRow label="Date" value={formatDate(data.date) || "Pick a date"} />
        <ProgrammeRow label="Time" value={formatTime(data.time) || "Pick a time"} />
        <ProgrammeRow label="Meeting Point" value={data.location || "Add location"} />
        {data.distance && <ProgrammeRow label="Distance" value={data.distance} />}
      </div>
    </div>
  );
}

function ProgrammeRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-10 border-b border-white/15 pb-3">
      <span className="text-2xl font-bold uppercase tracking-[0.3em] text-white/85">
        {label}:
      </span>
      <span className="text-3xl font-bold uppercase tracking-wide">{value}</span>
    </div>
  );
}