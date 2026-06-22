import type { Options } from "html-to-image";

/** Shared html-to-image options for StoryCanvas exports. */
export function storyExportOptions(over: Options = {}): Options {
  return {
    cacheBust: true,
    backgroundColor: "#000000",
    // Avoid SecurityError when reading cssRules from cross-origin stylesheets
    // (e.g. Google Fonts). Layouts still use local/system fallbacks in export.
    skipFonts: true,
    ...over,
  };
}
