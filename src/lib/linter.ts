import * as acorn from "acorn";
import * as walk from "acorn-walk";
import { parser as pythonParser } from "@lezer/python";
import { parse as parseHTML, defaultTreeAdapter } from "parse5";
import type { Document, Element, ChildNode } from "parse5/dist/tree-adapters/default";
export type LineType = "normal" | "error" | "warning";
export type Language = "javascript" | "python" | "html" | "unknown";

export interface CodeLine {
  text: string;
  type: LineType;
  messages: string[];
}

export interface LintResult {
  language: Language;
  lines: CodeLine[];
}

function posToLine(text: string, pos: number): number {
  return text.slice(0, Math.max(0, pos)).split("\n").length;
}

class AnnotationMap {
  private map = new Map<number, { type: LineType; messages: string[] }>();

  add(lineIdx: number, type: LineType, message: string) {
    const existing = this.map.get(lineIdx);
    if (existing) {
      if (type === "error") existing.type = "error";
      if (!existing.messages.includes(message)) existing.messages.push(message);
    } else {
      this.map.set(lineIdx, { type, messages: [message] });
    }
  }

  get(lineIdx: number) {
    return this.map.get(lineIdx);
  }
}

function buildLines(rawLines: string[], ann: AnnotationMap): CodeLine[] {
  return rawLines.map((text, idx) => {
    const a = ann.get(idx);
    return a ? { text, type: a.type, messages: a.messages } : { text, type: "normal", messages: [] };
  });
}

function looksLikeCode(code: string): boolean {
  const trimmed = code.trim();

  // Obvious code characters: brackets, operators, semicolons, angle brackets
  const codeChars = (trimmed.match(/[{}\[\]();=<>+\-*\/|&!%^~`]/g) ?? []).length;
  const nonSpaceChars = trimmed.replace(/\s/g, "").length;
  const ratio = codeChars / Math.max(nonSpaceChars, 1);

  if (ratio >= 0.02) return true;

  // Common keywords from any supported language
  if (
    /\b(function|const|let|var|if|else|for|while|return|class|import|export|async|await)\b/.test(trimmed) ||
    /\b(def|elif|except|lambda|yield|pass|None|True|False)\b/.test(trimmed) ||
    /<[a-zA-Z][\w-]*[\s/>]/.test(trimmed)
  ) {
    return true;
  }

  return false;
}

export function detectLanguage(code: string): Language {
  const trimmed = code.trim();

  if (!looksLikeCode(trimmed)) {
    return "unknown";
  }

  if (
    /^<!doctype\s+html/i.test(trimmed) ||
    /^<html[\s>]/i.test(trimmed) ||
    /<(div|span|p|h[1-6]|body|head|script|style|link|meta|img|a\b|ul|ol|li|table|form|input)\b/i.test(
      trimmed.slice(0, 600)
    )
  ) {
    return "html";
  }

  if (
    /^#!.*python/i.test(trimmed) ||
    /^(from\s+\w+\s+import\s|import\s+\w+\s*$)/m.test(trimmed) ||
    /\bdef\s+\w+\s*\(/.test(trimmed) ||
    /\bclass\s+\w+\s*[:(]/.test(trimmed) ||
    /^\s*elif\b/m.test(trimmed) ||
    /^\s*except\s*[:\w]/m.test(trimmed) ||
    /\bprint\s*\(/.test(trimmed)
  ) {
    return "python";
  }

  return "javascript";
}

type NodeLoc = { start: { line: number }; end: { line: number } };
function getLoc(node: acorn.Node): NodeLoc | undefined {
  return (node as unknown as { loc?: NodeLoc }).loc;
}

function lintJavaScript(code: string): CodeLine[] {
  const rawLines = code.split("\n");
  const ann = new AnnotationMap();

  function addAt(line1: number, type: LineType, msg: string) {
    ann.add(line1 - 1, type, msg);
  }

  let ast: acorn.Node | null = null;

  try {
    ast = acorn.parse(code, {
      ecmaVersion: "latest",
      sourceType: "module",
      locations: true,
    });
  } catch (e: unknown) {
    if (e && typeof e === "object") {
      const err = e as { loc?: { line: number }; message?: string };
      if (err.loc) {
        const msg = (err.message ?? "Syntax error").replace(/\s*\(\d+:\d+\)\s*$/, "");
        addAt(err.loc.line, "error", `Syntax error: ${msg}`);
      }
    }
    return buildLines(rawLines, ann);
  }

  walk.simple(ast, {
    VariableDeclaration(node: acorn.Node) {
      const n = node as unknown as { kind: string; loc?: NodeLoc };
      if (n.kind === "var" && n.loc) {
        addAt(n.loc.start.line, "warning", "Prefer 'let' or 'const' over 'var'");
      }
    },

    DebuggerStatement(node: acorn.Node) {
      const loc = getLoc(node);
      if (loc) addAt(loc.start.line, "warning", "'debugger' statement left in code");
    },

    BinaryExpression(node: acorn.Node) {
      const n = node as unknown as { operator: string; loc?: NodeLoc };
      if (!n.loc) return;
      if (n.operator === "==")
        addAt(n.loc.start.line, "warning", "Use '===' instead of '==' for strict equality");
      if (n.operator === "!=")
        addAt(n.loc.start.line, "warning", "Use '!==' instead of '!=' for strict inequality");
    },

    CallExpression(node: acorn.Node) {
      const n = node as unknown as {
        callee: { type: string; object?: { name?: string }; property?: { name?: string }; name?: string };
        loc?: NodeLoc;
      };
      if (!n.loc) return;
      const callee = n.callee;

      if (callee.type === "MemberExpression" && callee.object?.name === "console") {
        const method = callee.property?.name;
        if (method === "log") addAt(n.loc.start.line, "warning", "'console.log' left in code");
        if (method === "error") addAt(n.loc.start.line, "warning", "'console.error' left in code");
        if (method === "warn") addAt(n.loc.start.line, "warning", "'console.warn' left in code");
      }

      if (callee.type === "Identifier" && callee.name === "eval") {
        addAt(n.loc.start.line, "error", "'eval()' executes arbitrary code — dangerous and a security risk");
      }

      if (callee.type === "Identifier" && callee.name === "alert") {
        addAt(n.loc.start.line, "warning", "'alert()' blocks the browser — avoid in production");
      }
    },

    ThrowStatement(node: acorn.Node) {
      const n = node as unknown as { argument: { type: string }; loc?: NodeLoc };
      if (n.loc && n.argument.type === "Literal") {
        addAt(n.loc.start.line, "warning", "Throwing a string literal — use 'new Error(...)' instead");
      }
    },

    TryStatement(node: acorn.Node) {
      const n = node as unknown as {
        handler?: acorn.Node & { body: { body: unknown[] } };
        loc?: NodeLoc;
      };
      if (n.handler && n.handler.body.body.length === 0) {
        const loc = getLoc(n.handler);
        if (loc) addAt(loc.start.line, "warning", "Empty catch block — errors are silently swallowed");
      }
    },

    WithStatement(node: acorn.Node) {
      const loc = getLoc(node);
      if (loc) addAt(loc.start.line, "error", "'with' statement is forbidden in strict mode and confuses scope");
    },
  });

  return buildLines(rawLines, ann);
}

function lintPython(code: string): CodeLine[] {
  const rawLines = code.split("\n");
  const ann = new AnnotationMap();

  const tree = pythonParser.parse(code);
  const cursor = tree.cursor();
  const reportedLines = new Set<number>();

  do {
    if (cursor.type.isError) {
      const lineNum = posToLine(code, cursor.from);
      if (!reportedLines.has(lineNum)) {
        reportedLines.add(lineNum);
        const snippet = code.slice(cursor.from, cursor.to).trim().slice(0, 20);
        const detail = snippet ? ` near '${snippet}'` : "";
        ann.add(lineNum - 1, "error", `Syntax error${detail}`);
      }
    }
  } while (cursor.next());

  rawLines.forEach((text, idx) => {
    const trimmed = text.trim();

    if (/^except\s*:/.test(trimmed)) {
      ann.add(idx, "warning", "Bare 'except:' catches everything — be specific (e.g. 'except ValueError:')");
    }

    if (/^print\s+[^(=]/.test(trimmed)) {
      ann.add(idx, "error", "Python 3: 'print' is a function — use print(...)");
    }

    if (/\bdef\s+\w+\s*\([^)]*=\s*[\[{]/.test(trimmed)) {
      ann.add(idx, "warning", "Mutable default argument — use None and assign inside the function body");
    }

    if (/[!=]=\s*None\b/.test(text)) {
      ann.add(idx, "warning", "Use 'is None' or 'is not None' instead of '== None' / '!= None'");
    }

    if (/\b(TODO|FIXME|HACK|XXX)\b/i.test(text)) {
      ann.add(idx, "warning", "Unresolved TODO/FIXME left in code");
    }

    if (/^import\s+\*/.test(trimmed) || /from\s+\S+\s+import\s+\*/.test(trimmed)) {
      ann.add(idx, "warning", "Wildcard import makes it hard to know what names are in scope");
    }
  });

  return buildLines(rawLines, ann);
}

// ─── DROP-IN REPLACEMENT ────────────────────────────────────────────────────
// Replace everything from `const HTML_ERROR_MESSAGES` to the end of
// `function lintHTML` in your existing linter.ts with this block.
// Everything above (imports, types, JS linter, Python linter) stays unchanged.
// ────────────────────────────────────────────────────────────────────────────

// ─── Parse error code → human message ───────────────────────────────────────

const HTML_ERROR_MESSAGES: Record<string, string> = {
  "missing-end-tag-before-doctype": "Missing end tag before DOCTYPE",
  "unexpected-character-in-attribute-name": "Unexpected character in attribute name",
  "unexpected-character-in-unquoted-attribute-value": "Unquoted attribute contains an invalid character",
  "missing-attribute-value": "Attribute is missing its value",
  "missing-whitespace-before-attribute-name": "Missing whitespace before attribute name",
  "unexpected-equals-sign-before-attribute-name": "Unexpected '=' before attribute name",
  "unexpected-null-character": "Null character in document",
  "unexpected-question-mark-instead-of-tag-name": "Unexpected '?' — use <!-- --> for comments",
  "invalid-first-character-of-tag-name": "Invalid character at the start of a tag name",
  "unexpected-solidus-in-tag": "Unexpected '/' inside a tag",
  "end-tag-with-attributes": "End tags must not have attributes",
  "duplicate-attribute": "Duplicate attribute on element",
  "non-void-html-element-start-tag-with-trailing-solidus":
    "Self-closing syntax is only valid on void elements",
  "abrupt-closing-of-empty-comment": "Comment is not properly closed",
  "eof-in-comment": "Unexpected end of file inside a comment",
  "eof-in-tag": "Unexpected end of file inside a tag",
  "missing-semicolon-after-character-reference": "Character reference is missing a semicolon",
  "unknown-named-character-reference": "Unknown HTML entity — did you mean &amp; or similar?",
  "eof-before-tag-name": "End of file before a tag name was found",
  "missing-end-tag": "Missing closing tag",
};

// ─── Constants ───────────────────────────────────────────────────────────────

// Tags that must NOT have a closing tag
const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

// Deprecated HTML tags that have CSS/semantic replacements
const DEPRECATED_TAGS: Record<string, string> = {
  center:   "Use CSS 'text-align: center' instead of <center>",
  font:     "<font> is deprecated — use CSS for styling text",
  marquee:  "<marquee> is deprecated — use CSS animations instead",
  blink:    "<blink> is deprecated and unsupported in modern browsers",
  big:      "<big> is deprecated — use CSS font-size instead",
  strike:   "<strike> is deprecated — use <del> or CSS text-decoration",
  tt:       "<tt> is deprecated — use <code> or <kbd> instead",
  frame:    "<frame> is obsolete — use <iframe> or standard layout",
  frameset: "<frameset> is obsolete",
  noframes: "<noframes> is obsolete",
  applet:   "<applet> is obsolete — use <object> or modern embeds",
  basefont: "<basefont> is deprecated — use CSS instead",
  dir:      "<dir> is deprecated — use <ul> instead",
  isindex:  "<isindex> is obsolete",
};

// Block-level elements that must NOT appear inside inline elements
const BLOCK_ELEMENTS = new Set([
  "div", "p", "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "table", "thead", "tbody", "tr", "th", "td",
  "blockquote", "pre", "figure", "figcaption", "section", "article",
  "aside", "header", "footer", "main", "nav", "form", "fieldset",
]);

const INLINE_ELEMENTS = new Set([
  "span", "a", "strong", "em", "b", "i", "u", "small",
  "label", "abbr", "cite", "code", "kbd", "samp", "sub", "sup",
]);

// ─── Source-line helpers ─────────────────────────────────────────────────────

/**
 * Build a map of { tagName → [1-based line numbers] } by scanning raw source.
 * parse5's location data isn't always reliable for all nodes, so we use
 * a lightweight regex scan as a fallback line-finder.
 */
function buildTagLineMap(source: string): Map<string, number[]> {
  const map = new Map<string, number[]>();
  const lines = source.split("\n");
  lines.forEach((lineText, idx) => {
    const tagMatches = lineText.matchAll(/<\/?([a-zA-Z][a-zA-Z0-9-]*)/g);
    for (const m of tagMatches) {
      const tag = m[1].toLowerCase();
      if (!map.has(tag)) map.set(tag, []);
      map.get(tag)!.push(idx + 1); // 1-based
    }
  });
  return map;
}

/**
 * Find what 1-based line a character offset falls on.
 */
function offsetToLine(source: string, offset: number): number {
  return source.slice(0, offset).split("\n").length;
}

// ─── Tree walker ─────────────────────────────────────────────────────────────

interface WalkResult {
  unclosedTags:    Array<{ tag: string; line: number }>;
  voidMisuse:      Array<{ tag: string; line: number }>;
  deprecatedTags:  Array<{ tag: string; line: number; message: string }>;
  blockInInline:   Array<{ block: string; inline: string; line: number }>;
  missingAlt:      Array<{ line: number }>;
  missingLang:     boolean;
  missingCharset:  boolean;
  missingTitle:    boolean;
}

function walkTree(doc: Document, source: string, tagLineMap: Map<string, number[]>): WalkResult {
  const result: WalkResult = {
    unclosedTags:   [],
    voidMisuse:     [],
    deprecatedTags: [],
    blockInInline:  [],
    missingAlt:     [],
    missingLang:    false,
    missingCharset: false,
    missingTitle:   false,
  };

  let hasHtmlLang  = false;
  let hasCharset   = false;
  let hasTitle     = false;

  // Helper: get source line for a node (uses parse5 sourceCodeLocation when available)
  function lineOf(node: Element): number {
    const loc = (node as unknown as { sourceCodeLocation?: { startLine?: number; startOffset?: number } })
      .sourceCodeLocation;
    if (loc?.startLine) return loc.startLine;
    if (loc?.startOffset !== undefined) return offsetToLine(source, loc.startOffset);
    // Fallback: first occurrence of this tag in source
    const occurrences = tagLineMap.get(node.tagName.toLowerCase());
    return occurrences?.[0] ?? 1;
  }

  function getAttr(node: Element, name: string): string | undefined {
    return node.attrs?.find((a) => a.name === name)?.value;
  }

  function visit(node: ChildNode, parentInlineTag: string | null) {
    if (node.nodeName === "#text" || node.nodeName === "#comment") return;
    if (node.nodeName === "#document" || node.nodeName === "#document-fragment") {
      const doc = node as unknown as { childNodes: ChildNode[] };
      doc.childNodes?.forEach((c) => visit(c, null));
      return;
    }

    const el = node as Element;
    if (!el.tagName) return;

    const tag = el.tagName.toLowerCase();
    const line = lineOf(el);

    // ── <html lang="..."> ────────────────────────────────────────────────────
    if (tag === "html") {
      const lang = getAttr(el, "lang");
      if (lang && lang.trim().length > 0) hasHtmlLang = true;
    }

    // ── <meta charset="..."> ────────────────────────────────────────────────
    if (tag === "meta") {
      if (getAttr(el, "charset") !== undefined) hasCharset = true;
      // <meta http-equiv="Content-Type"> also counts
      if (
        getAttr(el, "http-equiv")?.toLowerCase() === "content-type" &&
        getAttr(el, "content")?.toLowerCase().includes("charset")
      ) {
        hasCharset = true;
      }
    }

    // ── <title> ──────────────────────────────────────────────────────────────
    if (tag === "title") hasTitle = true;

    // ── Deprecated tags ──────────────────────────────────────────────────────
    if (DEPRECATED_TAGS[tag]) {
      result.deprecatedTags.push({ tag, line, message: DEPRECATED_TAGS[tag] });
    }

    // ── Void element children (e.g. <br>text</br>) ───────────────────────────
    if (VOID_ELEMENTS.has(tag) && el.childNodes && el.childNodes.length > 0) {
      const hasRealChildren = el.childNodes.some(
        (c) => c.nodeName !== "#text" || (c as unknown as { value: string }).value.trim().length > 0
      );
      if (hasRealChildren) {
        result.voidMisuse.push({ tag, line });
      }
    }

    // ── <img alt="..."> ──────────────────────────────────────────────────────
    if (tag === "img") {
      if (getAttr(el, "alt") === undefined) {
        result.missingAlt.push({ line });
      }
    }

    // ── Block element inside inline element ──────────────────────────────────
    if (parentInlineTag && BLOCK_ELEMENTS.has(tag)) {
      result.blockInInline.push({ block: tag, inline: parentInlineTag, line });
    }

    // ── Recurse ──────────────────────────────────────────────────────────────
    const nextInlineParent = INLINE_ELEMENTS.has(tag) ? tag : parentInlineTag;
    el.childNodes?.forEach((child) => visit(child, nextInlineParent));
  }

  // Kick off walk from document root
  doc.childNodes?.forEach((c) => visit(c, null));

  // ── Unclosed tag detection ───────────────────────────────────────────────
  // parse5 silently auto-closes unclosed tags. We detect them by comparing
  // how many opening tags appear in raw source vs what the corrected tree has.
  const openCounts  = new Map<string, number>();
  const closeCounts = new Map<string, number>();

  const openMatches  = source.matchAll(/<([a-zA-Z][a-zA-Z0-9-]*)(?:\s[^>]*)?\s*\/?>/g);
  const closeMatches = source.matchAll(/<\/([a-zA-Z][a-zA-Z0-9-]*)\s*>/g);

  for (const m of openMatches) {
    const t = m[1].toLowerCase();
    if (!VOID_ELEMENTS.has(t)) openCounts.set(t, (openCounts.get(t) ?? 0) + 1);
  }
  for (const m of closeMatches) {
    const t = m[1].toLowerCase();
    closeCounts.set(t, (closeCounts.get(t) ?? 0) + 1);
  }

  for (const [tag, openCount] of openCounts) {
    const closeCount = closeCounts.get(tag) ?? 0;
    if (openCount > closeCount) {
      const diff = openCount - closeCount;
      const occurrences = tagLineMap.get(tag) ?? [1];
      // Report the last unclosed occurrence(s)
      for (let i = 0; i < diff; i++) {
        const lineNum = occurrences[occurrences.length - 1 - i] ?? occurrences[0];
        result.unclosedTags.push({ tag, line: lineNum });
      }
    }
  }

  // ── Document-level checks ────────────────────────────────────────────────
  result.missingLang    = !hasHtmlLang;
  result.missingCharset = !hasCharset;
  result.missingTitle   = !hasTitle;

  return result;
}

// ─── Main lintHTML ────────────────────────────────────────────────────────────

function lintHTML(code: string): CodeLine[] {
  const rawLines = code.split("\n");
  const ann = new AnnotationMap();
  const tagLineMap = buildTagLineMap(code);

  // ── 1. parse5 parse-error callback (token-level errors) ──────────────────
  const doc = parseHTML(code, {
    sourceCodeLocationInfo: true,
    onParseError(err) {
      const lineIdx = (err.startLine ?? 1) - 1;
      const msg =
        HTML_ERROR_MESSAGES[err.code] ??
        `Parse error: ${err.code.replace(/-/g, " ")}`;
      ann.add(lineIdx, "error", msg);
    },
  });

  // ── 2. Tree-walk structural checks ───────────────────────────────────────
  const walked = walkTree(doc as unknown as Document, code, tagLineMap);

  walked.unclosedTags.forEach(({ tag, line }) => {
    ann.add(line - 1, "error", `<${tag}> is never closed — add a closing </${tag}> tag`);
  });

  walked.voidMisuse.forEach(({ tag, line }) => {
    ann.add(line - 1, "error", `<${tag}> is a void element and cannot have children or a closing tag`);
  });

  walked.deprecatedTags.forEach(({ line, message }) => {
    ann.add(line - 1, "warning", message);
  });

  walked.blockInInline.forEach(({ block, inline, line }) => {
    ann.add(
      line - 1,
      "warning",
      `Block element <${block}> nested inside inline element <${inline}> — invalid HTML structure`,
    );
  });

  walked.missingAlt.forEach(({ line }) => {
    ann.add(line - 1, "warning", "<img> is missing an 'alt' attribute — required for accessibility");
  });

  // ── 3. Document-level warnings (pin to line 0) ───────────────────────────
  // Only fire these for what looks like a full document (has <html> or <!DOCTYPE>)
  const looksLikeFullDoc = /<!doctype\s+html/i.test(code) || /<html[\s>]/i.test(code);

  if (looksLikeFullDoc) {
    if (walked.missingLang) {
      ann.add(0, "warning", "<html> is missing a 'lang' attribute (e.g. lang=\"en\") — required for accessibility");
    }
    if (walked.missingCharset) {
      ann.add(0, "warning", "No character encoding declared — add <meta charset=\"UTF-8\"> inside <head>");
    }
    if (walked.missingTitle) {
      ann.add(0, "warning", "Document is missing a <title> element inside <head>");
    }
  }

  // ── 4. Line-by-line pattern checks (style, events, todos) ────────────────
  rawLines.forEach((text, idx) => {
    if (/\bstyle\s*=\s*["'][^"']+["']/.test(text)) {
      ann.add(idx, "warning", "Inline style — consider moving to a CSS class");
    }
    if (/\bon\w+\s*=/.test(text)) {
      ann.add(idx, "warning", "Inline event handler — prefer addEventListener() in JavaScript");
    }
    if (/\b(TODO|FIXME)\b/i.test(text)) {
      ann.add(idx, "warning", "Unresolved TODO/FIXME in comment");
    }
  });

  return buildLines(rawLines, ann);
}


export function lint(code: string): LintResult {
  const language = detectLanguage(code);

  let lines: CodeLine[];
  switch (language) {
    case "javascript":
      lines = lintJavaScript(code);
      break;
    case "python":
      lines = lintPython(code);
      break;
    case "html":
      lines = lintHTML(code);
      break;
    default:
      lines = code.split("\n").map((text) => ({ text, type: "normal", messages: [] }));
  }

  return { language, lines };
}
