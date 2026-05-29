import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { CalendarDays, Clock, MapPin, Download, Sparkles } from "lucide-react";
import { StoryCanvas, type EventData } from "@/components/StoryCanvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [exporting, setExporting] = useState(false);
  const [data, setData] = useState<EventData>({
    name: "Summer Rooftop Party",
    date: "",
    time: "",
    location: "",
  });

  const update = (key: keyof EventData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setData((d) => ({ ...d, [key]: e.target.value }));

  const handleExport = async () => {
    if (!canvasRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(canvasRef.current, {
        width: 1080,
        height: 1920,
        pixelRatio: 1,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `${(data.name || "event").replace(/\s+/g, "-").toLowerCase()}-story.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setExporting(false);
    }
  };

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
              <StoryCanvas ref={canvasRef} data={data} />
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6 rounded-2xl border border-border bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="name">Event name</Label>
            <Input id="name" maxLength={60} value={data.name} onChange={update("name")} placeholder="Summer Rooftop Party" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date"><CalendarDays size={14} className="mr-1 inline" />Date</Label>
              <Input id="date" type="date" value={data.date} onChange={update("date")} />
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

          <Button onClick={handleExport} disabled={exporting} className="w-full" size="lg">
            <Download size={18} />
            {exporting ? "Exporting…" : "Export story image"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">Exports a 1080 × 1920 PNG, ready to post.</p>
        </div>
      </div>
    </main>
  );
}
