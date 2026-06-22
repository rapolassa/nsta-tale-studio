import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Storyframe — Instagram Event Story Maker" },
      {
        name: "description",
        content:
          "Create polished Instagram event stories and posts in seconds. Pick a layout, add your details, and export ready-to-post images or video.",
      },
      { property: "og:title", content: "Storyframe — Instagram Event Story Maker" },
      {
        property: "og:description",
        content:
          "Create polished Instagram event stories and posts in seconds. Pick a layout, add your details, and export ready-to-post images or video.",
      },
    ],
  }),
  component: LandingRoute,
});

function LandingRoute() {
  return <LandingPage />;
}
