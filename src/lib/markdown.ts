import sanitizeHtml from "sanitize-html";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const DANGEROUS_SCHEME = /^\s*(?:javascript|data|vbscript|file):/i;

// Returns a safe URL for use in href/src, or "#" when the scheme is dangerous.
function sanitizeUrl(url: string): string {
  const cleaned = url.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  if (DANGEROUS_SCHEME.test(cleaned)) return "#";
  return cleaned;
}

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1", "h2", "h3", "h4", "p", "br", "strong", "em", "del", "code", "pre",
    "blockquote", "hr", "ul", "ol", "li", "a", "img", "figure", "figcaption",
    "table", "thead", "tbody", "tr", "th", "td",
    "svg", "path", "polyline", "line",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel", "class"],
    img: ["src", "alt", "loading", "class"],
    figure: ["class"],
    code: ["class"],
    th: ["align"],
    td: ["align"],
    svg: [
      "xmlns", "width", "height", "viewBox", "fill", "stroke", "stroke-width",
      "stroke-linecap", "stroke-linejoin", "style",
    ],
    path: ["d"],
    polyline: ["points"],
    line: ["x1", "y1", "x2", "y2"],
  },
  // Only safe URL schemes; blocks javascript:, data:, vbscript:, etc.
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: {
    img: ["http", "https"],
  },
  allowProtocolRelative: false,
  // Preserve camelCase SVG attribute names (e.g. viewBox).
  parser: { lowerCaseAttributeNames: false },
};

function splitTableRow(row: string): string[] {
  const trimmed = row.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((cell) => cell.trim());
}

function isTableSeparator(line: string): boolean {
  return /^\s*\|?[\s:|-]+\|[\s:|-]+\|?\s*$/.test(line) && /---/.test(line);
}

/** Convert contiguous GFM pipe-table blocks to HTML tables. */
function convertMarkdownTables(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const header = lines[i];
    const separator = lines[i + 1];
    if (
      header &&
      separator &&
      header.includes("|") &&
      isTableSeparator(separator)
    ) {
      const headers = splitTableRow(header);
      const body: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].includes("|") && !isTableSeparator(lines[i])) {
        body.push(splitTableRow(lines[i]));
        i += 1;
      }
      out.push("<table>");
      out.push("<thead><tr>");
      for (const h of headers) out.push(`<th>${h}</th>`);
      out.push("</tr></thead>");
      out.push("<tbody>");
      for (const row of body) {
        out.push("<tr>");
        for (let c = 0; c < headers.length; c++) {
          out.push(`<td>${row[c] ?? ""}</td>`);
        }
        out.push("</tr>");
      }
      out.push("</tbody></table>");
      continue;
    }
    out.push(header);
    i += 1;
  }
  return out.join("\n");
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
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");
  // Underscore italics must not match SCREAMING_SNAKE placeholders (LEGAL_ENTITY_NAME, etc.).
  html = html.replace(/(?<![A-Za-z0-9])_(?!_)(.+?)(?<!_)_(?![A-Za-z0-9])/g, "<em>$1</em>");

  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match: string, alt: string, src: string) => {
    return `<figure class="article-figure"><img src="${sanitizeUrl(src)}" alt="${alt}" loading="lazy" /><figcaption>${alt}</figcaption></figure>`;
  });
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match: string, text: string, href: string) => {
    const safeHref = sanitizeUrl(href);
    const isExternal = /^https?:\/\//.test(safeHref) && !safeHref.includes(typeof window !== "undefined" ? window.location.host : "localhost");
    if (isExternal) {
      return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer" class="outbound-link">${text}<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;margin-left:3px;vertical-align:middle"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>`;
    }
    return `<a href="${safeHref}" class="inbound-link">${text}</a>`;
  });

  html = html.replace(/^> (.+)$/gm, "<blockquote><p>$1</p></blockquote>");

  html = html.replace(/^---$/gm, "<hr />");

  // GFM pipe tables (used by legal/policy pages).
  html = convertMarkdownTables(html);

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
      !line.startsWith("<table") &&
      !line.startsWith("<thead") &&
      !line.startsWith("<tbody") &&
      !line.startsWith("<tr") &&
      !line.startsWith("<th") &&
      !line.startsWith("<td") &&
      !line.startsWith("</")
    ) {
      result.push(`<p>${line}</p>`);
    } else {
      result.push(line);
    }
  }

  if (inUl) result.push("</ul>");
  if (inOl) result.push("</ol>");

  const rendered = result.join("\n").replace(/\n{3,}/g, "\n\n");
  return sanitizeHtml(rendered, SANITIZE_OPTIONS);
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
