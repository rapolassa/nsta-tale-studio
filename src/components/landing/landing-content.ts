export const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#use-cases", label: "Use cases" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
] as const;

export const proofTags = [
  "Event venues",
  "Promoters",
  "Real estate",
  "Local businesses",
  "Sports clubs",
  "Agencies",
] as const;

export const features = [
  {
    icon: "⚡",
    title: "Photo or video backgrounds",
    description:
      "Upload a single clip or drop 10 photos at once. Every asset gets the same polished layout — perfect for event recaps and listing tours.",
    large: true,
  },
  {
    icon: "🎨",
    title: "Curated layout styles",
    description:
      "Bold, Ticket, Polaroid, Crew — designed for Sport, Corporate, and Festivals. Switch styles without re-entering details.",
  },
  {
    icon: "📐",
    title: "Story, Reel & Post formats",
    description:
      "Toggle between 9:16 Story/Reel and 4:5 Post. One design, every platform size you need.",
  },
  {
    icon: "💾",
    title: "Saved events & campaigns",
    description:
      "Save event details once — name, date, time, location — and prefill your next story in one click.",
  },
  {
    icon: "🎛️",
    title: "Visual controls",
    description:
      "Shade intensity, black & white toggle, and smart text contrast so your copy always reads on any background.",
  },
  {
    icon: "🏷️",
    title: "Brand kit",
    description:
      "Save your logo, colors, and fonts. Every export stays on-brand — no manual adjustments.",
    accent: true,
    comingSoon: true,
  },
] as const;

export const steps = [
  {
    num: "01",
    title: "Drop your media",
    description: "Upload a photo, video, or a whole folder. Storyframe handles the rest.",
  },
  {
    num: "02",
    title: "Pick a layout & fill details",
    description:
      "Choose Bold, Ticket, Polaroid, or Crew. Add event name, date, time, and location. Adjust shade if needed.",
  },
  {
    num: "03",
    title: "Export & post",
    description: "Download PNG or MP4, sized perfectly for Instagram, TikTok, and Facebook.",
  },
] as const;

export const useCases = [
  {
    emoji: "🎉",
    title: "Events & festivals",
    description:
      "Weekly club nights, festivals, private parties — fresh story for every lineup change.",
  },
  {
    emoji: "💼",
    title: "Business & corporate",
    description:
      "Product launches, team updates, and conference promos with a consistent, polished look.",
  },
  {
    emoji: "🏠",
    title: "Real estate",
    description:
      "Turn listing photos into swipe-worthy stories with address, price, and open house details.",
  },
  {
    emoji: "⚽",
    title: "Sports & fitness",
    description: "Match day graphics, class schedules, and membership promos at scale.",
  },
] as const;

export const comparison = {
  other: {
    title: "Canva / CapCut",
    items: [
      "30+ clicks per story",
      "Blank canvas — design decisions everywhere",
      "Batch workflow is manual",
      "Generic templates, easy to spot",
    ],
  },
  storyframe: {
    title: "Storyframe",
    items: [
      "3 clicks, done",
      "Opinionated layouts that always look good",
      "10 photos → 10 stories automatically",
      "Built for recurring weekly content",
    ],
  },
} as const;

export const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    description: "Try it out, post occasionally",
    features: [
      "3 exports per month",
      "All layout styles",
      "Story & Post formats",
      "Watermark on exports",
    ],
    cta: "Get started",
    featured: false,
    ghost: true,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/mo",
    description: "For venues & businesses posting weekly",
    features: [
      "Unlimited exports",
      "All categories: Sport, Corporate, Festivals",
      "Batch export (10+ at once)",
      "Saved events & campaigns",
      "No watermark",
      "Brand kit",
    ],
    cta: "Start free trial",
    featured: true,
    badge: "Most popular",
    ghost: false,
  },
  {
    name: "Business",
    price: "$49",
    period: "/mo",
    description: "Teams & small agencies",
    features: ["Everything in Pro", "3 team seats", "Shared brand presets", "Priority support"],
    cta: "Contact us",
    featured: false,
    ghost: true,
    mailto: true,
  },
] as const;

export const faqs = [
  {
    q: "Do I need design experience?",
    a: "No. Storyframe gives you finished layouts — you just add your photo and text. If you can fill out a form, you can make a story.",
    defaultOpen: true,
  },
  {
    q: "Can I use video backgrounds?",
    a: "Yes. Upload MP4 or MOV clips and overlay your event details on top. Export as video-ready MP4 for Reels and Stories.",
  },
  {
    q: "How does batch export work?",
    a: "Select multiple photos at once. Storyframe applies your chosen layout and event details to each image and lets you download them all together.",
  },
  {
    q: "What layout styles are available?",
    a: "Four curated styles — Bold, Ticket, Polaroid, and Crew — each optimized for different vibes. Categories include Sport, Corporate, and Festivals.",
  },
  {
    q: "Is this only for events?",
    a: "Events are where we started, but the same workflow works for real estate listings, restaurant promos, gym schedules, and any recurring social content.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Pro and Business plans are month-to-month with no lock-in. Your saved campaigns stay accessible on the free plan.",
  },
] as const;

export const heroStats = [
  { value: "60s", label: "Average create time" },
  { value: "10×", label: "Batch from one upload" },
  { value: "9:16", label: "Story, Reel & 4:5 Post" },
] as const;

export const layoutPills = ["Bold", "Ticket", "Polaroid", "Crew"] as const;
