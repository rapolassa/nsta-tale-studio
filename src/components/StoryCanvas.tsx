import { forwardRef, useRef, useImperativeHandle } from "react";
import bg from "@/assets/story-bg.jpg";
import { CalendarDays, Clock, MapPin } from "lucide-react";

export interface EventData {
  name: string;
  date: string;
  time: string;
  location: string;
}

export type LayoutStyle =
  | "bold"
  | "editorial"
  | "minimal"
  | "ticket"
  | "poster"
  | "festival";

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
}

/**
 * Renders at full 1080x1920 resolution. The parent scales it down with CSS
 * transform so export captures crisp full-size pixels.
 */
export const StoryCanvas = forwardRef<HTMLDivElement, StoryCanvasProps>(
  ({ data, layout = "bold", image, video, videoRef, shade = 0.45 }, ref) => {
    const innerVideoRef = useRef<HTMLVideoElement>(null);
    useImperativeHandle(videoRef, () => innerVideoRef.current as HTMLVideoElement);
    return (
      <div
        ref={ref}
        className="relative overflow-hidden"
        style={{ width: 1080, height: 1920 }}
      >
        {video ? (
          <video
            ref={innerVideoRef}
            src={video}
            autoPlay
            loop
            muted
            playsInline
            width={1080}
            height={1920}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <img
            src={image || bg}
            alt=""
            width={1080}
            height={1920}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {/* Dark shade so text stays legible on any uploaded image */}
        <div className="absolute inset-0 bg-black" style={{ opacity: shade }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80" />

        {layout === "bold" && <BoldLayout data={data} />}
        {layout === "editorial" && <EditorialLayout data={data} />}
        {layout === "minimal" && <MinimalLayout data={data} />}
        {layout === "ticket" && <TicketLayout data={data} />}
        {layout === "poster" && <PosterLayout data={data} />}
        {layout === "festival" && <FestivalLayout data={data} />}
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
      </div>
    </div>
  );
}