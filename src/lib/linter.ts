import * as acorn from "acorn";
import * as walk from "acorn-walk";
import { parser as pythonParser } from "@lezer/python";
import { parse as parseHTML } from "parse5";

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
  "non-void-html-element-start-tag-with-trailing-solidus": "Self-closing syntax is only valid on void elements",
  "abrupt-closing-of-empty-comment": "Comment is not properly closed",
  "eof-in-comment": "Unexpected end of file inside a comment",
  "eof-in-tag": "Unexpected end of file inside a tag",
  "missing-semicolon-after-character-reference": "Character reference is missing a semicolon",
  "unknown-named-character-reference": "Unknown HTML entity — did you mean &amp; or similar?",
  "eof-before-tag-name": "End of file before a tag name was found",
  "missing-end-tag": "Missing closing tag",
};

function lintHTML(code: string): CodeLine[] {
  const rawLines = code.split("\n");
  const ann = new AnnotationMap();

  parseHTML(code, {
    onParseError(err) {
      const lineIdx = err.startLine - 1;
      const msg =
        HTML_ERROR_MESSAGES[err.code] ??
        `Parse error: ${err.code.replace(/-/g, " ")}`;
      ann.add(lineIdx, "error", msg);
    },
  });

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
    if (/<img\b(?![^>]*\balt\s*=)[^>]*>/i.test(text)) {
      ann.add(idx, "warning", "<img> is missing an 'alt' attribute — required for accessibility");
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
