import { useEffect, useState } from "react";
import type { EventData, LayoutStyle } from "@/components/StoryCanvas";

export type SavedEvent = {
  id: string;
  data: EventData;
  layout: LayoutStyle;
};

const KEY = "story-maker:saved-events";

function read(): SavedEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedEvent[]) : [];
  } catch {
    return [];
  }
}

export function useSavedEvents() {
  const [events, setEvents] = useState<SavedEvent[]>([]);

  useEffect(() => {
    setEvents(read());
  }, []);

  const persist = (next: SavedEvent[]) => {
    setEvents(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const save = (data: EventData, layout: LayoutStyle) => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now());
    persist([{ id, data, layout }, ...events]);
  };

  const remove = (id: string) => persist(events.filter((e) => e.id !== id));

  return { events, save, remove };
}