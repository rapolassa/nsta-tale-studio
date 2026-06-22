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

const MAX_IMAGE_DIMENSION = 2160;

/**
 * Store uploaded photos as blob URLs (not base64 data URLs) and downscale very
 * large camera images so the studio stays responsive.
 */
export async function prepareImagePreview(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = objectUrl;
    await img.decode();

    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (!w || !h || (w <= MAX_IMAGE_DIMENSION && h <= MAX_IMAGE_DIMENSION)) {
      return objectUrl;
    }

    revokeMediaUrl(objectUrl);
    const scale = MAX_IMAGE_DIMENSION / Math.max(w, h);
    const tw = Math.round(w * scale);
    const th = Math.round(h * scale);
    const canvas = document.createElement("canvas");
    canvas.width = tw;
    canvas.height = th;
    const ctx = canvas.getContext("2d");
    if (!ctx) return URL.createObjectURL(file);

    ctx.drawImage(img, 0, 0, tw, th);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
    return blob ? URL.createObjectURL(blob) : URL.createObjectURL(file);
  } catch {
    return objectUrl;
  }
}
