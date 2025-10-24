import { remark } from "remark";
import html from "remark-html";

export async function renderMarkdown(markdown: string) {
  const processed = await remark().use(html, { sanitize: false }).process(markdown);
  return processed.toString();
}
