import sanitizeHtml from "sanitize-html";

/**
 * microCMS リッチエディタの HTML を安全に扱うためのサニタイズ。
 * script / iframe / インラインイベントは除去。画像と外部リンクは許可。
 */
export function sanitizeCmsHtml(html: string | undefined | null): string {
  if (!html) return "";
  return sanitizeHtml(html, {
    allowedTags: [
      "h2", "h3", "h4", "p", "br", "hr", "strong", "em", "u", "s", "a", "ul", "ol", "li",
      "blockquote", "code", "pre", "img", "figure", "figcaption", "table", "thead", "tbody",
      "tr", "th", "td", "span",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["https"] },
    transformTags: {
      a: (tagName, attribs) => {
        const isExternal = /^https?:\/\//.test(attribs.href ?? "");
        return {
          tagName,
          attribs: isExternal
            ? { ...attribs, target: "_blank", rel: "noopener noreferrer" }
            : attribs,
        };
      },
      img: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, loading: "lazy" },
      }),
    },
  });
}

/** プレーンテキストの改行を <p> に変換（siteSettings.aboutText などテキストエリア用） */
export function textToParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}|\r\n\r\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}
