import type { Metadata } from "next";
import { promises as fs } from "fs";
import path from "path";
import { renderMarkdown } from "@/src/lib/markdown";

export const metadata: Metadata = {
  title: "How to Learn Kana",
  description: "Evidence-based study strategies tailored for Japanese kana learners."
};

export default async function AboutLearningPage() {
  const filePath = path.join(process.cwd(), "content", "learning-tips.md");
  const markdown = await fs.readFile(filePath, "utf-8");
  const html = await renderMarkdown(markdown);

  return (
    <article className="prose prose-neutral mx-auto max-w-3xl dark:prose-invert">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
