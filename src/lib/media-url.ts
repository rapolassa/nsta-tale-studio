/** Stable slide keys; works on HTTP origins where `crypto.randomUUID` is unavailable. */
export function createSlideId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {
      /* non-secure context */
    }
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function isBlobUrl(url: string | null | undefined): url is string {
  return !!url && url.startsWith("blob:");
}

export function revokeMediaUrl(url: string | null | undefined) {
  if (isBlobUrl(url)) URL.revokeObjectURL(url);
}

type MediaSlideRef = { image?: string | null; video?: string | null };

/** Only revoke a blob URL when no slide still references it. */
export function revokeMediaUrlIfUnused(url: string | null | undefined, slides: MediaSlideRef[]) {
  if (!isBlobUrl(url)) return;
  const stillUsed = slides.some((s) => s.image === url || s.video === url);
  if (!stillUsed) URL.revokeObjectURL(url);
}

/** Duplicate a blob URL so each slide owns its own object URL. */
export async function cloneMediaUrl(url: string | null | undefined): Promise<string | null> {
  if (!url) return null;
  if (!isBlobUrl(url)) return url;
  const blob = await fetch(url).then((r) => r.blob());
  return URL.createObjectURL(blob);
}

const MAX_IMAGE_DIMENSION = 2160;

async function rasterizeImage(img: HTMLImageElement): Promise<string> {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const scale = w > MAX_IMAGE_DIMENSION || h > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / Math.max(w, h) : 1;
  const tw = Math.max(1, Math.round(w * scale));
  const th = Math.max(1, Math.round(h * scale));
  const canvas = document.createElement("canvas");
  canvas.width = tw;
  canvas.height = th;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  ctx.drawImage(img, 0, 0, tw, th);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
  if (!blob) throw new Error("Could not encode image");
  return URL.createObjectURL(blob);
}

/**
 * Store uploaded photos as blob URLs (not base64 data URLs) and downscale very
 * large camera images so the studio stays responsive.
 */
export async function prepareImagePreview(file: File): Promise<string | null> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = objectUrl;
    await img.decode();
    revokeMediaUrl(objectUrl);
    return await rasterizeImage(img);
  } catch {
    revokeMediaUrl(objectUrl);
    return null;
  }
}
