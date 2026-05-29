import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { format } from "date-fns";
import { CalendarDays, Clock, MapPin, Download, Sparkles, ImageUp, X } from "lucide-react";
import { StoryCanvas, type EventData, type LayoutStyle } from "@/components/StoryCanvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  const [exporting, setExporting] = useState(false);
  const [layout, setLayout] = useState<LayoutStyle>("bold");
  const [image, setImage] = useState<string | null>(null);
  const [data, setData] = useState<EventData>({
    name: "Summer Rooftop Party",
    date: "",
    time: "",
    location: "",
  });

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

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

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

  const layoutOptions: { id: LayoutStyle; label: string }[] = [
    { id: "bold", label: "Bold" },
    { id: "editorial", label: "Editorial" },
    { id: "minimal", label: "Minimal" },
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
              <StoryCanvas ref={canvasRef} data={data} layout={layout} image={image} />
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6 rounded-2xl border border-border bg-card p-6">
          <div className="space-y-2">
            <Label>Layout style</Label>
            <div className="grid grid-cols-3 gap-2">
              {layoutOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLayout(opt.id)}
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

          <div className="space-y-2">
            <Label>Background image</Label>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
            <div className="flex gap-2">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => fileRef.current?.click()}>
                <ImageUp size={18} />
                {image ? "Replace image" : "Upload image"}
              </Button>
              {image && (
                <Button type="button" variant="outline" size="icon" onClick={() => setImage(null)} aria-label="Remove image">
                  <X size={18} />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">A dark shade is applied so text stays readable.</p>
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
