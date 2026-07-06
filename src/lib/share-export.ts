export type ShareResult = "shared" | "aborted" | "unsupported";

function getNavigator(): Navigator | undefined {
  return typeof navigator !== "undefined" ? navigator : undefined;
}

/** Whether the browser can share files via the Web Share API (mobile Safari, Chrome Android, etc.). */
export function canShareFiles(files: File[]): boolean {
  const nav = getNavigator();
  if (!nav?.share || !nav.canShare) return false;
  try {
    return nav.canShare({ files });
  } catch {
    return false;
  }
}

export function canUseWebShare(): boolean {
  return !!getNavigator()?.share;
}

export async function shareFiles(
  files: File[],
  opts?: { title?: string; text?: string },
): Promise<ShareResult> {
  if (!canShareFiles(files)) return "unsupported";
  const nav = getNavigator()!;
  try {
    await nav.share({
      files,
      title: opts?.title,
      text: opts?.text,
    });
    return "shared";
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return "aborted";
    if (err instanceof Error && err.name === "AbortError") return "aborted";
    throw err;
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, b64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new File([arr], filename, { type: mime });
}

export function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, { type: blob.type || "application/octet-stream" });
}

/**
 * On mobile, open the native share sheet so the user can pick Instagram,
 * Save to Photos, Messages, etc. Falls back to a file download on desktop.
 */
export async function shareOrDownloadFile(
  file: File,
  opts?: { title?: string; text?: string; preferShare?: boolean },
): Promise<"shared" | "downloaded" | "aborted"> {
  const preferShare = opts?.preferShare ?? canShareFiles([file]);
  if (preferShare && canShareFiles([file])) {
    const result = await shareFiles([file], {
      title: opts?.title ?? "Event story",
      text: opts?.text,
    });
    if (result === "shared") return "shared";
    if (result === "aborted") return "aborted";
  }
  downloadBlob(file, file.name);
  return "downloaded";
}

export async function shareOrDownloadFiles(
  files: File[],
  opts?: { title?: string; text?: string; preferShare?: boolean },
): Promise<"shared" | "downloaded" | "aborted"> {
  if (!files.length) return "aborted";
  if (files.length === 1) {
    return shareOrDownloadFile(files[0], opts);
  }

  const preferShare = opts?.preferShare ?? canShareFiles(files);
  if (preferShare && canShareFiles(files)) {
    const result = await shareFiles(files, {
      title: opts?.title ?? "Event stories",
      text: opts?.text,
    });
    if (result === "shared") return "shared";
    if (result === "aborted") return "aborted";
  }

  for (const file of files) {
    downloadBlob(file, file.name);
    await new Promise((r) => setTimeout(r, 200));
  }
  return "downloaded";
}
