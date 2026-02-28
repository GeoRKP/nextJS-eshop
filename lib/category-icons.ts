import {
  Cog,
  CircleDot,
  ArrowUpDown,
  Zap,
  Wind,
  Settings,
  Car,
  CircleDashed,
  Lightbulb,
  Armchair,
  Package,
  Wrench,
  Fuel,
  Thermometer,
  Shield,
  type LucideIcon,
} from "lucide-react";

const categoryIconMap: Record<string, LucideIcon> = {
  engine: Cog,
  motor: Cog,
  κινητήρας: Cog,
  brake: CircleDot,
  brakes: CircleDot,
  φρένα: CircleDot,
  suspension: ArrowUpDown,
  ανάρτηση: ArrowUpDown,
  electrical: Zap,
  ηλεκτρικά: Zap,
  exhaust: Wind,
  εξάτμιση: Wind,
  transmission: Settings,
  μετάδοση: Settings,
  body: Car,
  αμάξωμα: Car,
  wheel: CircleDashed,
  wheels: CircleDashed,
  tire: CircleDashed,
  tires: CircleDashed,
  τροχοί: CircleDashed,
  ελαστικά: CircleDashed,
  lighting: Lightbulb,
  lights: Lightbulb,
  φώτα: Lightbulb,
  φωτισμός: Lightbulb,
  interior: Armchair,
  εσωτερικό: Armchair,
  tools: Wrench,
  εργαλεία: Wrench,
  fuel: Fuel,
  καύσιμα: Fuel,
  cooling: Thermometer,
  ψύξη: Thermometer,
  safety: Shield,
  ασφάλεια: Shield,
};

export function getCategoryIcon(name: string): LucideIcon {
  const lower = name.toLowerCase();

  // Exact match
  if (categoryIconMap[lower]) return categoryIconMap[lower];

  // Partial match
  for (const [key, icon] of Object.entries(categoryIconMap)) {
    if (lower.includes(key) || key.includes(lower)) return icon;
  }

  return Package;
}

export { categoryIconMap };
