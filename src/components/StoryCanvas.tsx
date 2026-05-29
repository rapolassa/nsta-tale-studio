import { forwardRef } from "react";
import bg from "@/assets/story-bg.jpg";
import { CalendarDays, Clock, MapPin } from "lucide-react";

export interface EventData {
  name: string;
  date: string;
  time: string;
  location: string;
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

/**
 * Renders at full 1080x1920 resolution. The parent scales it down with CSS
 * transform so export captures crisp full-size pixels.
 */
export const StoryCanvas = forwardRef<HTMLDivElement, { data: EventData }>(
  ({ data }, ref) => {
    return (
      <div
        ref={ref}
        className="relative overflow-hidden text-story-foreground"
        style={{ width: 1080, height: 1920 }}
      >
        <img
          src={bg}
          alt=""
          width={1080}
          height={1920}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70" />

        <div className="absolute inset-0 flex flex-col justify-between p-24">
          <div className="flex items-center gap-4">
            <span className="h-4 w-4 rounded-full bg-accent" />
            <span className="text-3xl font-medium uppercase tracking-[0.4em] text-white/80">
              You're invited
            </span>
          </div>

          <div className="space-y-12">
            <h1 className="text-[120px] font-extrabold leading-[0.95] tracking-tight text-white drop-shadow-lg">
              {data.name || "Event Name"}
            </h1>

            <div className="space-y-7 text-white/95">
              <Row icon={<CalendarDays size={56} strokeWidth={2.2} />} text={formatDate(data.date) || "Pick a date"} />
              <Row icon={<Clock size={56} strokeWidth={2.2} />} text={formatTime(data.time) || "Pick a time"} />
              <Row icon={<MapPin size={56} strokeWidth={2.2} />} text={data.location || "Add location"} />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

StoryCanvas.displayName = "StoryCanvas";

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