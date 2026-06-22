import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Storyframe — Turn photos into stories in 60 seconds" },
      {
        name: "description",
        content:
          "Turn your photos into ready-to-post Instagram stories in 60 seconds. Photo & video backgrounds, curated layouts, batch export — no design skills needed.",
      },
      { property: "og:title", content: "Storyframe — Turn photos into stories in 60 seconds" },
      {
        property: "og:description",
        content:
          "Turn your photos into ready-to-post Instagram stories in 60 seconds. Photo & video backgrounds, curated layouts, batch export — no design skills needed.",
      },
    ],
  }),
  component: LandingRoute,
});

function LandingRoute() {
  return <LandingPage />;
}
