function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function markdownToHtml(md: string): string {
  let html = md;

  html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang: string, code: string) => {
    return `<pre><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`;
  });
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");
  html = html.replace(/~~(.+?)~~/g, "<del>$1</del>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.+?)_/g, "<em>$1</em>");

  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<figure class="article-figure"><img src="$2" alt="$1" loading="lazy" /><figcaption>$1</figcaption></figure>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match: string, text: string, href: string) => {
    const isExternal = /^https?:\/\//.test(href) && !href.includes(typeof window !== "undefined" ? window.location.host : "localhost");
    if (isExternal) {
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="outbound-link">${text}<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;margin-left:3px;vertical-align:middle"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>`;
    }
    return `<a href="${href}" class="inbound-link">${text}</a>`;
  });

  html = html.replace(/^> (.+)$/gm, "<blockquote><p>$1</p></blockquote>");

  html = html.replace(/^---$/gm, "<hr />");

  const lines = html.split("\n");
  const result: string[] = [];
  let inUl = false;
  let inOl = false;

  for (const line of lines) {
    const ulMatch = line.match(/^[-*] (.+)/);
    const olMatch = line.match(/^\d+\. (.+)/);

    if (ulMatch) {
      if (!inUl) { result.push("<ul>"); inUl = true; }
      result.push(`<li>${ulMatch[1]}</li>`);
      continue;
    } else if (inUl) {
      result.push("</ul>");
      inUl = false;
    }

    if (olMatch) {
      if (!inOl) { result.push("<ol>"); inOl = true; }
      result.push(`<li>${olMatch[1]}</li>`);
      continue;
    } else if (inOl) {
      result.push("</ol>");
      inOl = false;
    }

    if (
      line.trim() &&
      !line.startsWith("<h") &&
      !line.startsWith("<pre") &&
      !line.startsWith("<blockquote") &&
      !line.startsWith("<hr") &&
      !line.startsWith("<ul") &&
      !line.startsWith("<ol") &&
      !line.startsWith("<li") &&
      !line.startsWith("</")
    ) {
      result.push(`<p>${line}</p>`);
    } else {
      result.push(line);
    }
  }

  if (inUl) result.push("</ul>");
  if (inOl) result.push("</ol>");

  return result.join("\n").replace(/\n{3,}/g, "\n\n");
}

export function extractFirstImage(md: string): string | null {
  const match = md.match(/!\[.*?\]\((.+?)\)/);
  return match?.[1] ?? null;
}

export function stripMarkdown(md: string): string {
  return md
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\(.*?\)/g, "$1")
    .replace(/[*_`#>~-]/g, "")
    .replace(/\n+/g, " ")
    .trim();
}
