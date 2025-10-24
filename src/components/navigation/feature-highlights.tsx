import { BrainCircuit, Headphones, PencilRuler, Sparkles } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";

const features = [
  {
    title: "Adaptive Leitner decks",
    description: "Prioritize cards when they are due with spaced-repetition scheduling tuned for kana mastery.",
    icon: BrainCircuit
  },
  {
    title: "Native audio",
    description: "Reference open-source recordings and fall back to synthetic speech when offline.",
    icon: Headphones
  },
  {
    title: "Stroke walkthroughs",
    description: "Step through SVG animations that respect reduced motion preferences.",
    icon: PencilRuler
  },
  {
    title: "Research-backed guidance",
    description: "Read concise notes on spaced repetition, active recall, interleaving, and dual coding.",
    icon: Sparkles
  }
];

export function FeatureHighlights() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {features.map(({ title, description, icon: Icon }) => (
        <Card key={title} className="h-full">
          <CardHeader className="flex items-start gap-3">
            <span className="rounded-full bg-primary/10 p-2 text-primary">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
