export const ICON_EMOJI = {
  scissors: "✂",
  nails: "💅",
  makeup: "💄",
  spa: "🧖",
  star: "⭐",
  facial: "✨",
  massage: "💆",
  waxing: "🔥",
  hair: "👱",
  beard: "🧔",
  eyebrow: "👁",
  treatment: "💊",
};

export const DEFAULT_CATS = [
  { value: "scissors", icon: "scissors", label: "Hair Services" },
  { value: "nails", icon: "nails", label: "Nail Care" },
  { value: "makeup", icon: "makeup", label: "Makeup" },
  { value: "spa", icon: "spa", label: "Spa Treatments" },
  { value: "star", icon: "star", label: "Premium Services" },
  { value: "facial", icon: "facial", label: "Facial Care" },
  { value: "massage", icon: "massage", label: "Massage" },
  { value: "waxing", icon: "waxing", label: "Waxing" },
];

const CATEGORY_PALETTE = {
  scissors: {
    gradient: "from-[#FFF4E0] via-white to-[#FFE8CC]",
    ring: "ring-[#E39B34]/50",
    dot: "bg-[#E39B34]",
  },
  nails: {
    gradient: "from-[#FFE8F3] via-white to-[#FFF0F7]",
    ring: "ring-rose-300/60",
    dot: "bg-rose-400",
  },
  makeup: {
    gradient: "from-[#F7E8FF] via-white to-[#FFEFFC]",
    ring: "ring-[#c084fc]/50",
    dot: "bg-[#9333ea]",
  },
  spa: {
    gradient: "from-[#E4F5F1] via-white to-[#DDF3FF]",
    ring: "ring-emerald-300/60",
    dot: "bg-emerald-500",
  },
  star: {
    gradient: "from-[#FFF7E5] via-white to-[#FFEFD1]",
    ring: "ring-amber-200/70",
    dot: "bg-amber-500",
  },
  facial: {
    gradient: "from-[#E6F0FF] via-white to-[#EEF5FF]",
    ring: "ring-sky-300/60",
    dot: "bg-sky-500",
  },
  massage: {
    gradient: "from-[#EDFFF4] via-white to-[#E6F5FF]",
    ring: "ring-emerald-200/80",
    dot: "bg-emerald-600",
  },
  waxing: {
    gradient: "from-[#FFF1E7] via-white to-[#FFE4D5]",
    ring: "ring-orange-200/70",
    dot: "bg-orange-500",
  },
  default: {
    gradient: "from-slate-50 via-white to-slate-100",
    ring: "ring-slate-200",
    dot: "bg-slate-500",
  },
};

export function normalizeCategories(categories = []) {
  const base = Array.isArray(categories) && categories.length ? categories : DEFAULT_CATS;
  return base.map((c) => {
    const iconKey = c.icon || c.value;
    return {
      value: c.value,
      label: c.label || c.value,
      iconKey,
      emoji: ICON_EMOJI[c.icon] || ICON_EMOJI[c.value] || c.icon || "⭐",
    };
  });
}

export function getCategoryPalette(key) {
  return CATEGORY_PALETTE[key] || CATEGORY_PALETTE.default;
}
