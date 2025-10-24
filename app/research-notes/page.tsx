import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";

const notes = [
  {
    title: "Spaced repetition keeps kana fresh",
    summary:
      "Reviews scheduled just before forgetting dramatically improve long-term retention compared to massed practice.",
    takeaway: "Stick with daily sessions; the Leitner ladder adjusts intervals to your performance.",
    reference: "Pimsleur, 1967"
  },
  {
    title: "Active recall beats passive rereading",
    summary:
      "Prompting yourself to produce the sound or character engages retrieval, the key driver of durable memory traces.",
    takeaway: "Say the sound aloud and draw the strokes from memory before peeking.",
    reference: "Kornell et al., 2011"
  },
  {
    title: "Interleaving prevents kana confusion",
    summary:
      "Mixing similar syllables in practice reduces interference and sharpens discrimination across rows.",
    takeaway: "Rotate between vowel, k-, s-, and t-row cards each session.",
    reference: "Rohrer, 2012"
  },
  {
    title: "Dual coding multiplies cues",
    summary:
      "Combining visual stroke order with audio pronunciation creates richer retrieval routes.",
    takeaway: "Pair the stroke player with native recordings or speech synthesis.",
    reference: "Paivio, 1991"
  }
];

export const metadata: Metadata = {
  title: "Research Notes",
  description: "Concise evidence summaries behind Kana Companion's learning approach."
};

export default function ResearchNotesPage() {
  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-6">
      <header className="space-y-3 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Research Notes</p>
        <h1 className="text-balance text-3xl font-bold">Why these study techniques work</h1>
        <p className="text-muted-foreground">
          Each core feature of Kana Companion is grounded in memory research. Use this cheat sheet to
          plan sessions with purpose.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {notes.map((note) => (
          <Card key={note.title} className="h-full">
            <CardHeader>
              <CardTitle>{note.title}</CardTitle>
              <CardDescription>{note.summary}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium text-foreground">Takeaway: {note.takeaway}</p>
              <p className="text-muted-foreground">Reference: {note.reference}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
