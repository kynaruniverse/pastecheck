import * as acorn from "acorn";
import * as walk from "acorn-walk";
import acornTs from "acorn-typescript";
import { parser as pythonParser } from "@lezer/python";
import { parse as parseHTML } from "parse5";
import type { Document, Element, ChildNode } from "parse5/dist/tree-adapters/default";

export type LineType = "normal" | "error" | "warning";
export type Language = "javascript" | "typescript" | "python" | "html" | "css" | "unknown";

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
  const codeChars = (trimmed.match(/[{}\[\]();=<>+\-*\/|&!%^~`]/g) ?? []).length;
  const nonSpaceChars = trimmed.replace(/\s/g, "").length;
  const ratio = codeChars / Math.max(nonSpaceChars, 1);

  if (ratio >= 0.02) return true;

  return (
    /\b(function|const|let|var|if|else|for|while|return|class|import|export|async|await)\b/.test(trimmed) ||
    /\b(def|elif|except|lambda|yield|pass|None|True|False)\b/.test(trimmed) ||
    /<[a-zA-Z][\w-]*[\s/>]/.test(trimmed)
  );
}

export function detectLanguage(code: string): Language {
  const trimmed = code.trim();
  if (!looksLikeCode(trimmed)) return "unknown";

  if (
    /^[\s\S]*\{[\s\S]*:[\s\S]*\}/.test(trimmed) &&
    !/<[a-zA-Z]/.test(trimmed) &&
    /^\s*([.#]?[\w-]+|\*|\[[\w-]+\])\s*\{/.test(trimmed)
  ) {
    return "css";
  }

  // HTML detection — avoid matching React/JSX files
  if (
    (
      /^<!doctype\s+html/i.test(trimmed) ||
      /^<html[\s>]/i.test(trimmed)
    ) &&
    !/\b(export|import)\b/.test(trimmed)
  ) {
    return "html";
  }

  // TypeScript/TSX detection — must sit above Python to avoid misdetection
  if (
    /\binterface\s+\w+[\s<{]/.test(trimmed) ||
    /\btype\s+\w+\s*(<[^>]+>)?\s*=/.test(trimmed) ||
    /\bimport\s+type\s/.test(trimmed) ||
    /\benum\s+\w+\s*\{/.test(trimmed) ||
    /\b(public|private|protected|readonly)\s+\w+[\s:(!]/.test(trimmed) ||
    /:\s*(string|number|boolean|void|any|never|unknown|object)\b/.test(trimmed) ||
    /import\s+[\w\s{},*]+\s+from\s+["']react["']/.test(trimmed) ||
    /export\s+default\s+function\s+\w+\s*\(/.test(trimmed) ||
    /useState|useEffect|useRef|useCallback|useMemo/.test(trimmed) ||
    /className=/.test(trimmed) ||
    /\.tsx?["']/.test(trimmed)
  ) {
    return "typescript";
  }

  if (
    /^#!.*python/i.test(trimmed) ||
    /^(from\s+\w+\s+import\s|import\s+\w[\w.]*\s*$)/m.test(trimmed) ||
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

// Before the function, create the TS-extended parser once
const TSParser = acorn.Parser.extend(acornTs() as any);

function lintJavaScript(code: string, useTypeScript = false): CodeLine[] {
  const rawLines = code.split("\n");
  const ann = new AnnotationMap();

  function addAt(line1: number, type: LineType, msg: string) {
    ann.add(line1 - 1, type, msg);
  }

  let ast: acorn.Node | null = null;
  const syntaxErrors: Array<{ line: number; msg: string }> = [];

  try {
    const parseOptions: acorn.Options = {
      ecmaVersion: "latest",
      sourceType: "module",
      locations: true,
    };
    ast = useTypeScript
      ? TSParser.parse(code, parseOptions)
      : acorn.parse(code, parseOptions);
  } catch (e: unknown) {
    if (e && typeof e === "object") {
      const err = e as { loc?: { line: number }; message?: string };
      if (err.loc) {
        const msg = (err.message ?? "Syntax error").replace(/\s*\(\d+:\d+\)\s*$/, "");
        syntaxErrors.push({ line: err.loc.line, msg: `Syntax error: ${msg}` });
      }
    }
    
    // JSX/TSX detection — if file contains JSX patterns, skip line-by-line recovery
    // entirely to prevent cascade false positives from JSX syntax acorn can't parse
    const containsJSX = (
      false || // placeholder to structure the check
      /<[A-Z][a-zA-Z]*[\s/>]/.test(code) ||     // <Component or <Component/>
      /<\/[A-Z][a-zA-Z]*>/.test(code) ||         // </Component>
      /return\s*\([\s\S]*?</.test(code) ||        // return ( ... <
      (useTypeScript && (
        /className=/.test(code) ||

        /<[a-z]+[\s\S]*?\/>/.test(code) ||        // self-closing lowercase: <div />
        /useState|useEffect|useRef|useCallback|useMemo/.test(code)
      ))
    );

    const lines = code.split("\n");

    if (!containsJSX && lines.length < 300) {
      // Non-JSX: line-by-line recovery with simple cascade suppression.
      // Rule: always keep the first error. Only add subsequent errors if:
      // 1. message is non-generic (specific errors are always real), OR
      // 2. line distance from last error is > 2 (gap means independent error)
      const CASCADE_MSGS = [
        "Unexpected token", "Unexpected keyword", "Unexpected identifier",
        "Unexpected reserved word", "The keyword", "Identifier directly after number",
      ];
      const isGeneric = (m: string) => CASCADE_MSGS.some(c => m.includes(c));
      let lastErrorLine = -1;


      for (let i = 0; i < lines.length; i++) {
        const partial = lines
          .slice(0, i + 1)
          .join("\n")
          .replace(/([{(\[])\s*$/gm, "");
        try {
          acorn.parse(partial, { ecmaVersion: "latest", sourceType: "module", locations: true });
        } catch (e2: unknown) {
          if (e2 && typeof e2 === "object") {
            const err2 = e2 as { loc?: { line: number }; message?: string };
            if (err2.loc && err2.loc.line === i + 1) {
              const msg2 = (err2.message ?? "Syntax error")
                .replace(/\s*\(\d+:\d+\)\s*$/, "");

              const incompleteStructure =
                /Unexpected token/.test(msg2) &&
                /[{[(]\s*$/.test(partial.trim());

              if (incompleteStructure) continue;

              const entry = `Syntax error: ${msg2}`;
              if (syntaxErrors.find((e) => e.line === err2.loc!.line)) continue;
              const isFirstError = lastErrorLine === -1;
              const isSpecific = !isGeneric(msg2);
              
              // Only allow subsequent errors if they are specific. 
              // Generic errors ("Unexpected token") are almost always structural cascades 
              // triggered by an earlier unclosed block, regardless of line distance.
              if (isFirstError || isSpecific) {
                if (isFirstError) {
                  // We found the root cause! Clear the inaccurate global error from the bottom of the file
                  syntaxErrors.length = 0; 
                }
                syntaxErrors.push({ line: err2.loc.line, msg: entry });
                lastErrorLine = err2.loc.line;
              }
            }
          }
        }
      }
    }

    const filteredErrors: typeof syntaxErrors = [];
    const seen = new Set<string>();

    for (const err of syntaxErrors) {
      const key = `${err.line}:${err.msg}`;

      // Only suppress exact duplicates
      if (seen.has(key)) continue;
  
      seen.add(key);
      filteredErrors.push(err);
    }

    filteredErrors.forEach(({ line, msg }) => {
      addAt(line, "error", msg);
    });

    return buildLines(rawLines, ann);
  }

// TS node stubs — prevent acorn-walk crashing on TS-specific AST nodes
const tsStubs: Record<string, () => void> = {};
[
  "TSTypeAnnotation","TSTypeReference","TSAnyKeyword","TSStringKeyword",
  "TSNumberKeyword","TSBooleanKeyword","TSVoidKeyword","TSNullKeyword",
  "TSUndefinedKeyword","TSNeverKeyword","TSUnknownKeyword","TSObjectKeyword",
  "TSPropertySignature","TSInterfaceDeclaration","TSInterfaceBody",
  "TSTypeAliasDeclaration","TSTypeParameterDeclaration","TSTypeParameter",
  "TSTypeParameterInstantiation","TSTypeLiteral","TSUnionType",
  "TSIntersectionType","TSArrayType","TSTupleType","TSOptionalType",
  "TSRestType","TSConditionalType","TSInferType","TSMappedType",
  "TSIndexedAccessType","TSTypeQuery","TSTypePredicate","TSImportType",
  "TSLiteralType","TSEnumDeclaration","TSEnumMember","TSModuleDeclaration",
  "TSModuleBlock","TSNamespaceExportDeclaration","TSExportAssignment",
  "TSParameterProperty","TSAbstractMethodDefinition","TSAbstractPropertyDefinition",
  "TSAsExpression","TSTypeAssertion","TSNonNullExpression",
  "TSIndexSignature","TSConstructSignatureDeclaration","TSCallSignatureDeclaration",
  "TSMethodSignature","TSQualifiedName","TSExpressionWithTypeArguments",
  "TSFunctionType","TSConstructorType",
].forEach((t) => { tsStubs[t] = () => {}; });

try {
  walk.simple(ast, {
    VariableDeclaration(node: acorn.Node) {
      const n = node as unknown as { kind: string; loc?: NodeLoc };
      if (n.kind === "var" && n.loc) {
        addAt(n.loc.start.line, "warning", "Prefer 'let' or 'const' over 'var' — use 'const' if the value never changes, 'let' if it does");
      }
    },
    DebuggerStatement(node: acorn.Node) {
      const loc = getLoc(node);
      if (loc) addAt(loc.start.line, "warning", "'debugger' statement left in code — remove this line before pushing to production");
    },
    BinaryExpression(node: acorn.Node) {
      const n = node as unknown as { operator: string; loc?: NodeLoc };
      if (!n.loc) return;
      if (n.operator === "==") addAt(n.loc.start.line, "warning", "Use '===' instead of '==' for strict equality — '==' can produce unexpected results due to type coercion");
      if (n.operator === "!=") addAt(n.loc.start.line, "warning", "Use '!==' instead of '!=' for strict inequality — '!=' can produce unexpected results due to type coercion");
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
        if (method === "log" || method === "error" || method === "warn") {
          addAt(n.loc.start.line, "warning", `'console.${method}' left in code — remove before deploying, or wrap in a debug flag`);
        }
      }
      if (callee.type === "Identifier" && callee.name === "eval") {
        addAt(n.loc.start.line, "error", "'eval()' executes arbitrary code — dangerous and a security risk — remove it and find a safer alternative like JSON.parse() or a lookup object");
      }
      if (callee.type === "Identifier" && callee.name === "alert") {
        addAt(n.loc.start.line, "warning", "'alert()' blocks the browser — avoid in production — use a custom modal or console.log() for debugging instead");
      }
      if (callee.type === "Identifier" && (callee.name === "setTimeout" || callee.name === "setInterval")) {
        const args = (n as unknown as { arguments: unknown[] }).arguments;
        if (args && args.length > 0) {
          const firstArg = args[0] as { type: string };
          if (firstArg.type === "Literal") {
            addAt(n.loc.start.line, "warning", `'${callee.name}()' called with a string argument — pass a function instead: ${callee.name}(() => { ... }, delay) — string arguments are evaluated like eval() and are a security risk`);
          }
        }
      }
      if (
        callee.type === "MemberExpression" &&
        (callee.object as unknown as { name?: string })?.name === "document" &&
        callee.property?.name === "write"
      ) {
        addAt(n.loc.start.line, "error", "'document.write()' is deprecated and dangerous — it overwrites the entire page when called after load and blocks rendering — use DOM manipulation methods like appendChild() or innerHTML instead");
      }
    },
    ThrowStatement(node: acorn.Node) {
      const n = node as unknown as { argument: { type: string }; loc?: NodeLoc };
      if (n.loc && n.argument.type === "Literal") {
        addAt(n.loc.start.line, "warning", "Throwing a string literal — use 'new Error(...)' instead — this gives you a proper stack trace when debugging");
      }
    },
    TryStatement(node: acorn.Node) {
      const n = node as unknown as {
        handler?: acorn.Node & { body: { body: unknown[] } };
        loc?: NodeLoc;
      };
      if (n.handler && n.handler.body.body.length === 0) {
        const loc = getLoc(n.handler);
        if (loc) addAt(loc.start.line, "warning", "Empty catch block — errors are silently swallowed — add at least console.error(e) so failures don't disappear silently");
      }
    },
    WithStatement(node: acorn.Node) {
      const loc = getLoc(node);
      if (loc) addAt(loc.start.line, "error", "'with' statement is forbidden in strict mode and confuses scope — remove it and reference the object properties directly");
    },
    IfStatement(node: acorn.Node) {
      const n = node as unknown as {
        test: { type: string; value?: unknown };
        loc?: NodeLoc;
      };
      if (!n.loc) return;
      if (
        n.test.type === "Literal" &&
        (n.test.value === true || n.test.value === false)
      ) {
        addAt(
          n.loc.start.line,
          "warning",
          `Condition is always ${n.test.value} — this branch will ${n.test.value ? "always" : "never"} run. Replace with the actual condition you intended.`
        );
      }
    },
    AssignmentExpression(node: acorn.Node) {
      const n = node as unknown as {
        type: string;
        loc?: NodeLoc;
        parent?: { type: string };
      };
      if (!n.loc) return;
// Catch assignment inside if/while/for condition via parent check
      // acorn-walk doesn't pass parent so we use a regex fallback below
    },
  }, { ...walk.base, ...tsStubs });
} catch {

    // TS-specific AST nodes that acorn-walk can't traverse — skip semantic checks
  }

  // Duplicate variable name check — only run on smaller files to avoid false positives
  const scopeStack: Map<string, number>[] = [new Map()];
  const skipDuplicateCheck = rawLines.length > 200;
  rawLines.forEach((text, idx) => {
    if (skipDuplicateCheck) return;
    const trimmed = text.trim();
    if (trimmed.startsWith("//")) return;

    // Push a new scope on function/arrow/class/block open
    if (/(\bfunction\b|\bclass\b|=>|\b(if|else|for|while|try|catch)\b)[^{]*\{/.test(trimmed) || /^\{/.test(trimmed)) {
      scopeStack.push(new Map());
    }


    // Pop scope on closing brace
    if (/^\}/.test(trimmed) && scopeStack.length > 1) {
      scopeStack.pop();
    }

    const match = trimmed.match(/^(?:const|let|var)\s+([a-zA-Z_$][\w$]*)\s*[=;:,]/);
    if (!match) return;
    const name = match[1];
    const currentScope = scopeStack[scopeStack.length - 1];
    if (currentScope.has(name)) {
      ann.add(idx, "error", `'${name}' is already declared — duplicate variable name in this scope — rename one of them or remove the redeclaration`);
    } else {
      currentScope.set(name, idx);
    }
  });

  // Always-evaluating condition — regex pass for assignment in condition
  // Catches: if (x = 5), while (x = getValue()), for (; x = y ;)
  rawLines.forEach((text, idx) => {
    const trimmed = text.trim();
    if (trimmed.startsWith("//")) return;
    // Match if/while/for followed by a condition containing a bare assignment (= but not == or === or != or !=== or +=, -=, etc.)
    if (/^\s*(if|while|for)\s*\(/.test(text)) {
      // Extract content between first ( and matching )
      const parenStart = text.indexOf("(");
      if (parenStart === -1) return;
      let depth = 0;
      let condContent = "";
      for (let ci = parenStart; ci < text.length; ci++) {
        if (text[ci] === "(") depth++;
        else if (text[ci] === ")") {
          depth--;
          if (depth === 0) break;
        }
        condContent += text[ci];
      }
      // Check for bare assignment: = not preceded or followed by = or ! or + or - or * or / or < or >
      // Also exclude compound assignments like +=, -=, *=, /=, %=, **=
      if (
        /(?:^|[^=!<>])=(?!=)/.test(condContent) &&
        !/[+\-*\/%&|^]=/.test(condContent)
      ) {
        ann.add(idx, "warning", "Possible assignment inside a condition — did you mean '===' instead of '='? Assignment in a condition always evaluates to the assigned value, which is rarely what you intend.");
      }
    }
  });

  // Missing await — scan async functions for known async calls without await
  const KNOWN_ASYNC_CALLS = [
    "fetch", "axios", "axios.get", "axios.post", "axios.put", "axios.delete", "axios.patch",
    "Promise.resolve", "Promise.reject", "Promise.all", "Promise.allSettled", "Promise.race", "Promise.any",
  ];
  const asyncAwaitPattern = new RegExp(
    `(?<!await\\s)(?<!await\\()\\b(${KNOWN_ASYNC_CALLS.map(k => k.replace(".", "\\.")).join("|")})\\s*\\(`,
    "g"
  );
  let insideAsyncFn = false;
  let braceDepth = 0;
  let asyncBraceStart = 0;
  rawLines.forEach((text, idx) => {
    const trimmed = text.trim();
    if (trimmed.startsWith("//")) return;
    if (/\basync\s+function\b|\basync\s+\w+\s*[=(]/.test(text)) {
      insideAsyncFn = true;
      asyncBraceStart = braceDepth;
    }
    if (insideAsyncFn) {
      for (const ch of text) {
        if (ch === "{") braceDepth++;
        else if (ch === "}") braceDepth--;
      }
      if (braceDepth <= asyncBraceStart) {
        insideAsyncFn = false;
      }
      asyncAwaitPattern.lastIndex = 0;
      let m;
      while ((m = asyncAwaitPattern.exec(text)) !== null) {
        const before = text.slice(0, m.index).trimEnd();
        if (/\bawait\b/.test(before.split(/[;{]/).pop() ?? "")) continue;
        ann.add(idx, "warning", `'${m[1]}()' is called without 'await' inside an async function — add 'await' before this call or the Promise will not be resolved before moving to the next line`);
      }
    } else {
      for (const ch of text) {
        if (ch === "{") braceDepth++;
        else if (ch === "}") braceDepth--;
      }
    }
  });

  // No return value — flag functions whose names suggest they return a value but have no return statement
  const RETURN_HINT_NAMES = /^(get|fetch|load|build|create|generate|find|parse|calculate|compute|format|extract|resolve|transform|map|filter|reduce|check|validate|convert)/i;
  const fnRegex = /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\()/g;
  let fnMatch;
  while ((fnMatch = fnRegex.exec(code)) !== null) {
    const fnName = fnMatch[1] || fnMatch[2];
    if (!fnName || !RETURN_HINT_NAMES.test(fnName)) continue;
    const fnStart = fnMatch.index;
    const braceOpen = code.indexOf("{", fnStart);
    if (braceOpen === -1) continue;
    let depth = 0;
    let fnEnd = -1;
    for (let ci = braceOpen; ci < code.length; ci++) {
      if (code[ci] === "{") depth++;
      else if (code[ci] === "}") {
        depth--;
        if (depth === 0) { fnEnd = ci; break; }
      }
    }
    if (fnEnd === -1) continue;
    const fnBody = code.slice(braceOpen, fnEnd);
    if (!/\breturn\b/.test(fnBody)) {
      const fnLine = code.slice(0, fnStart).split("\n").length;
      ann.add(fnLine - 1, "warning", `'${fnName}' appears to compute a value but has no 'return' statement — add 'return' before the result, or rename the function if it's intentionally void`);
    }
  }

  // No error handling — warn on functions that do risky operations with no try/catch
  const RISKY_PATTERNS = [
    /\bfetch\s*\(/,
    /\baxios\s*[\.\(]/,
    /\bJSON\.parse\s*\(/,
    /\bJSON\.stringify\s*\(/,
    /\blocalStorage\s*\./,
    /\bsessionStorage\s*\./,
    /\bdocument\s*\./,
    /\bwindow\s*\./,
    /\bfs\s*\./,
    /\brequire\s*\(/,
    /\bPromise\s*\./,
  ];

  const fnStartRegex = /(?:^|\s)(?:async\s+)?function\s+(\w+)\s*\(|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(/gm;
  let fnStartMatch;
  while ((fnStartMatch = fnStartRegex.exec(code)) !== null) {
    const fnName = fnStartMatch[1] || fnStartMatch[2];
    if (!fnName) continue;
    const braceOpen = code.indexOf("{", fnStartMatch.index + fnStartMatch[0].length - 1);
    if (braceOpen === -1) continue;
    let depth = 0;
    let fnEnd = -1;
    for (let ci = braceOpen; ci < code.length; ci++) {
      if (code[ci] === "{") depth++;
      else if (code[ci] === "}") {
        depth--;
        if (depth === 0) { fnEnd = ci; break; }
      }
    }
    if (fnEnd === -1) continue;
    const fnBody = code.slice(braceOpen, fnEnd);
    const hasRiskyOp = RISKY_PATTERNS.some(p => p.test(fnBody));
    const hasTryCatch = /\btry\s*\{/.test(fnBody);
    if (hasRiskyOp && !hasTryCatch) {
      const fnLine = code.slice(0, fnStartMatch.index).split("\n").length;
      const fnLineIdx = fnLine - 1;
      // Find the actual function declaration line — skip blank lines
      const actualLine = rawLines.findIndex((l, i) => i >= fnLineIdx && l.includes(fnName) && /function|=>|const|let|var/.test(l));
      ann.add(actualLine >= 0 ? actualLine : fnLineIdx, "warning", `'${fnName}' performs a risky operation but has no try/catch — wrap the risky call in try/catch to handle failures gracefully`);
    }
  }

  // TS-specific regex fallbacks — string/regex aware to avoid false positives
  if (useTypeScript && rawLines.length < 200) {
    rawLines.forEach((text, idx) => {
      const trimmed = text.trim();
      if (trimmed.startsWith("//")) return;
      if (/:\s*any\b/.test(text)) {
        ann.add(idx, "warning", "Avoid 'any' — use a specific type or 'unknown' for safer typing — 'any' disables TypeScript's type checking on this value");
      }
      if (/\bvar\s+/.test(text)) {
        ann.add(idx, "warning", "Prefer 'let' or 'const' over 'var' — use 'const' if the value never changes, 'let' if it does");
      }
      if (/\bconsole\s*\./.test(text)) {
        ann.add(idx, "warning", "Avoid console statements in production code — remove before deploying or wrap in a debug flag");
      }
    });
  }

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

  // Indentation checks
  let detectedIndentChar: "spaces" | "tabs" | null = null;
  let detectedIndentSize: number | null = null;
  rawLines.forEach((text, idx) => {
    if (!text.trim() || text.trim().startsWith("#")) return;
    const indentMatch = text.match(/^(\s+)/);
    if (!indentMatch) return;
    const indent = indentMatch[1];
    const hasTabs = indent.includes("\t");
    const hasSpaces = indent.includes(" ");
    if (hasTabs && hasSpaces) {
      ann.add(idx, "error", "Mixed tabs and spaces in indentation — pick one and use it consistently throughout the file");
      return;
    }
    const charUsed = hasTabs ? "tabs" : "spaces";
    if (!detectedIndentChar) {
      detectedIndentChar = charUsed;
    } else if (charUsed !== detectedIndentChar) {
      ann.add(idx, "warning", `Inconsistent indentation — file uses ${detectedIndentChar} but this line uses ${charUsed} — convert this line to match the rest of the file`);
      return;
    }
    // Indent size consistency check (spaces only) — unit = smallest indent seen
    if (charUsed === "spaces") {
      const size = indent.length;
      if (detectedIndentSize === null) {
        detectedIndentSize = size;
      } else {
        // If a smaller indent size is seen, adopt it as the new unit.
        // This handles files where some functions use 2-space and others use 4-space
        // indentation — both are valid as long as each is internally consistent.
        if (size < detectedIndentSize) {
          detectedIndentSize = size;
        }
        if (size % detectedIndentSize !== 0) {
          ann.add(idx, "warning", `Inconsistent indentation size — expected a multiple of ${detectedIndentSize} spaces but this line has ${size} — adjust to match the indentation unit used elsewhere in the file`);
        }
      }
    }
  });

  // Indent-level stack tracking — detects unexpected indents and dedents
  const indentStack: number[] = [0];
  rawLines.forEach((text, idx) => {
    if (!text.trim() || text.trim().startsWith("#")) return;
    const indentMatch = text.match(/^(\s*)/);
    const currentIndent = indentMatch ? indentMatch[1].replace(/\t/g, "    ").length : 0;
    const expectedIndent = indentStack[indentStack.length - 1];
    
    let prevLine: string | undefined;
    for (let i = idx - 1; i >= 0; i--) {
      if (rawLines[i].trim() && !rawLines[i].trim().startsWith("#")) {
        prevLine = rawLines[i];
        break;
      }
    }
    
    const prevIsScopeOpener = prevLine ? /:\s*(#.*)?$/.test(prevLine.trim()) : false;


    if (prevIsScopeOpener && currentIndent <= (indentStack[indentStack.length - 1])) {
      // Line after a colon should always indent deeper
      ann.add(idx, "error", `Expected an indented block after the colon on the previous line — indent this line further`);
    } else if (prevIsScopeOpener && currentIndent > expectedIndent) {
      // Valid indent after scope opener — push new level
      indentStack.push(currentIndent);
    } else if (currentIndent > expectedIndent && !prevIsScopeOpener) {
      // Indented further than expected without a colon opening a block
      ann.add(idx, "warning", `Unexpected indent — this line is indented deeper than the current block allows — check the indentation of surrounding lines`);
    } else if (currentIndent < expectedIndent) {
      // Dedent — pop stack until we find a matching level
      while (indentStack.length > 1 && indentStack[indentStack.length - 1] > currentIndent) {
        indentStack.pop();
      }
      if (indentStack[indentStack.length - 1] !== currentIndent) {
        ann.add(idx, "warning", `Unexpected dedent — this line's indentation (${currentIndent} spaces) doesn't match any outer block level — check the indentation of surrounding lines`);
      }
    }
  });

  rawLines.forEach((text, idx) => {
    const trimmed = text.trim();
    if (trimmed.startsWith("#")) return;

    if (/^except\s*:/.test(trimmed)) {
      ann.add(idx, "warning", "Bare 'except:' catches everything including system exits — be specific, e.g. 'except ValueError:' to only catch what you expect");
    }
    if (/^print\s+[^(=]/.test(trimmed)) {
      ann.add(idx, "error", "Python 3: 'print' is a function — replace with print(...) and wrap your value in parentheses");
    }
    if (/\bdef\s+\w+\s*\([^)]*=\s*[\[{]/.test(trimmed)) {
      ann.add(idx, "warning", "Mutable default argument — lists and dicts as defaults are shared across all calls — use None as the default and assign inside the function body instead");
    }
    if (/[!=]=\s*None\b/.test(text)) {
      ann.add(idx, "warning", "Use 'is None' or 'is not None' instead of '== None' / '!= None' — identity comparison is correct here, not equality");
    }
    if (/\b(TODO|FIXME|HACK|XXX)\b/i.test(text)) {
      ann.add(idx, "warning", "Unresolved TODO/FIXME left in code");
    }
    if (/^import\s+\*/.test(trimmed) || /from\s+\S+\s+import\s+\*/.test(trimmed)) {
      ann.add(idx, "warning", "Wildcard import makes it hard to know what names are in scope — import only what you need, e.g. 'from module import specific_function'");
    }
  });

  // pass in non-empty block check
  rawLines.forEach((text, idx) => {
    if (text.trim() !== "pass") return;
    const passIndent = text.match(/^(\s*)/)?.[1].length ?? 0;
    for (let j = idx + 1; j < rawLines.length; j++) {
      const next = rawLines[j];
      const nextTrimmed = next.trim();
      if (!nextTrimmed || nextTrimmed.startsWith("#")) continue;
      const nextIndent = next.match(/^(\s*)/)?.[1].length ?? 0;
      if (nextIndent < passIndent) break;
      if (nextIndent >= passIndent) {
        ann.add(idx, "warning", "'pass' is redundant — the block already contains other statements — remove this line");
        break;
      }
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

const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

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

function buildTagLineMap(source: string): Map<string, number[]> {
  const map = new Map<string, number[]>();
  const lines = source.split("\n");
  lines.forEach((lineText, idx) => {
    const tagMatches = lineText.matchAll(/<\/?([a-zA-Z][a-zA-Z0-9-]*)/g);
    for (const m of tagMatches) {
      const tag = m[1].toLowerCase();
      if (!map.has(tag)) map.set(tag, []);
      map.get(tag)!.push(idx + 1);
    }
  });
  return map;
}

function offsetToLine(source: string, offset: number): number {
  return source.slice(0, offset).split("\n").length;
}

interface WalkResult {
  unclosedTags:    Array<{ tag: string; line: number }>;
  voidMisuse:      Array<{ tag: string; line: number }>;
  deprecatedTags:  Array<{ tag: string; line: number; message: string }>;
  blockInInline:   Array<{ block: string; inline: string; line: number }>;
  missingAlt:      Array<{ line: number }>;
  duplicateIds:    Array<{ id: string; line: number }>;
  unlabelledInputs: Array<{ line: number }>;
  missingLang:     boolean;
  missingCharset:  boolean;
  missingTitle:    boolean;
}

function walkTree(doc: Document, source: string, tagLineMap: Map<string, number[]>): WalkResult {
  const result: WalkResult = {
    unclosedTags:    [],
    voidMisuse:      [],
    deprecatedTags:  [],
    blockInInline:   [],
    missingAlt:      [],
    duplicateIds:    [],
    unlabelledInputs: [],
    missingLang:     false,
    missingCharset:  false,
    missingTitle:    false,
  };

  const seenIds = new Map<string, number>();
  const labelledForIds = new Set<string>();
  const inputsNeedingLabels: Array<{ line: number }> = [];

  let hasHtmlLang  = false;
  let hasCharset   = false;
  let hasTitle     = false;

  function lineOf(node: Element): number {
    const loc = (node as unknown as { sourceCodeLocation?: { startLine?: number; startOffset?: number } })
      .sourceCodeLocation;
    if (loc?.startLine) return loc.startLine;
    if (loc?.startOffset !== undefined) return offsetToLine(source, loc.startOffset);
    const occurrences = tagLineMap.get(node.tagName.toLowerCase());
    return occurrences?.[0] ?? 1;
  }

  function getAttr(node: Element, name: string): string | undefined {
    return node.attrs?.find((a) => a.name === name)?.value;
  }

  function visit(node: ChildNode, parentInlineTag: string | null) {
    if (node.nodeName === "#text" || node.nodeName === "#comment") return;
    if (node.nodeName === "#document" || node.nodeName === "#document-fragment") {
      const docNode = node as unknown as { childNodes: ChildNode[] };
      docNode.childNodes?.forEach((c) => visit(c, null));
      return;
    }

    const el = node as Element;
    if (!el.tagName) return;

    const tag = el.tagName.toLowerCase();
    const line = lineOf(el);

    if (tag === "html") {
      const lang = getAttr(el, "lang");
      if (lang && lang.trim().length > 0) hasHtmlLang = true;
    }

    if (tag === "meta") {
      if (getAttr(el, "charset") !== undefined) hasCharset = true;
      if (
        getAttr(el, "http-equiv")?.toLowerCase() === "content-type" &&
        getAttr(el, "content")?.toLowerCase().includes("charset")
      ) {
        hasCharset = true;
      }
    }

    if (tag === "title") hasTitle = true;

    if (DEPRECATED_TAGS[tag]) {
      result.deprecatedTags.push({ tag, line, message: DEPRECATED_TAGS[tag] });
    }

    if (VOID_ELEMENTS.has(tag) && el.childNodes && el.childNodes.length > 0) {
      const hasRealChildren = el.childNodes.some(
        (c) => c.nodeName !== "#text" || (c as unknown as { value: string }).value.trim().length > 0
      );
      if (hasRealChildren) {
        result.voidMisuse.push({ tag, line });
      }
    }

    if (tag === "img" && getAttr(el, "alt") === undefined) {
      result.missingAlt.push({ line });
    }

    const idAttr = getAttr(el, "id");
    if (idAttr && idAttr.trim().length > 0) {
      const idVal = idAttr.trim();
      if (seenIds.has(idVal)) {
        result.duplicateIds.push({ id: idVal, line });
      } else {
        seenIds.set(idVal, line);
      }
    }

    if (tag === "label") {
      const forAttr = getAttr(el, "for");
      if (forAttr && forAttr.trim().length > 0) {
        labelledForIds.add(forAttr.trim());
      }
    }

    if (tag === "input") {
      const type = getAttr(el, "type")?.toLowerCase();
      if (type !== "hidden" && type !== "submit" && type !== "button" && type !== "reset") {
        const ariaLabel = getAttr(el, "aria-label")?.trim();
        const ariaLabelledBy = getAttr(el, "aria-labelledby")?.trim();
        if (!ariaLabel && !ariaLabelledBy) {
          const inputId = getAttr(el, "id")?.trim();
          inputsNeedingLabels.push({ line, id: inputId ?? "" } as { line: number; id: string });
        }
      }
    }

    if (parentInlineTag && BLOCK_ELEMENTS.has(tag)) {
      result.blockInInline.push({ block: tag, inline: parentInlineTag, line });
}


    const nextInlineParent = INLINE_ELEMENTS.has(tag) ? tag : (BLOCK_ELEMENTS.has(tag) ? null : parentInlineTag);
    el.childNodes?.forEach((child) => visit(child, nextInlineParent));
}


  doc.childNodes?.forEach((c) => visit(c, null));

  // Hardened multiline / s-flag regex matching for unclosed tags
  const openCounts  = new Map<string, number>();
  const closeCounts = new Map<string, number>();

  const openMatches  = source.matchAll(/<([a-zA-Z][a-zA-Z0-9-]*)(?:[^>]*)\s*\/?>/gs);
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
      for (let i = 0; i < diff; i++) {
        const lineNum = occurrences[occurrences.length - 1 - i] ?? occurrences[0];
        result.unclosedTags.push({ tag, line: lineNum });
      }
    }
  }

  for (const inp of inputsNeedingLabels as Array<{ line: number; id: string }>) {
    if (!inp.id || !labelledForIds.has(inp.id)) {
      result.unlabelledInputs.push({ line: inp.line });
    }
  }

  result.missingLang    = !hasHtmlLang;
  result.missingCharset = !hasCharset;
  result.missingTitle   = !hasTitle;

  return result;
}

function lintEmbeddedScripts(source: string, ann: AnnotationMap): void {
  const scriptRegex = /<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(source)) !== null) {
    const content = match[1];
    if (!content.trim()) continue;
    const contentStart = match.index + match[0].length - content.length - "</script>".length;
    const lineOffset = source.slice(0, contentStart).split("\n").length - 1;

    let ast: acorn.Node | null = null;
    try {
      ast = acorn.parse(content, { ecmaVersion: "latest", sourceType: "script", locations: true });
    } catch (e: unknown) {
      if (e && typeof e === "object") {
        const err = e as { loc?: { line: number }; message?: string };
        if (err.loc) {
          const msg = (err.message ?? "Syntax error").replace(/\s*\(\d+:\d+\)\s*$/, "");
          ann.add(lineOffset + err.loc.line - 1, "error", `<script> syntax error: ${msg}`);
        }
      }
      continue;
    }

    try {
      walk.simple(ast, {
        VariableDeclaration(node: acorn.Node) {
          const n = node as unknown as { kind: string; loc?: NodeLoc };
          if (n.kind === "var" && n.loc)
            ann.add(lineOffset + n.loc.start.line - 1, "warning", "Prefer 'let' or 'const' over 'var' — use 'const' if the value never changes, 'let' if it does");
        },
        DebuggerStatement(node: acorn.Node) {
          const loc = getLoc(node);
          if (loc) ann.add(lineOffset + loc.start.line - 1, "warning", "'debugger' statement left in code — remove this line before pushing to production");
        },
        BinaryExpression(node: acorn.Node) {
          const n = node as unknown as { operator: string; loc?: NodeLoc };
          if (!n.loc) return;
          if (n.operator === "==") ann.add(lineOffset + n.loc.start.line - 1, "warning", "Use '===' instead of '==' for strict equality — '==' can produce unexpected results due to type coercion");
          if (n.operator === "!=") ann.add(lineOffset + n.loc.start.line - 1, "warning", "Use '!==' instead of '!=' for strict inequality — '!=' can produce unexpected results due to type coercion");
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
            if (method === "log" || method === "error" || method === "warn")
              ann.add(lineOffset + n.loc.start.line - 1, "warning", `'console.${method}' left in code — remove before deploying, or wrap in a debug flag`);
          }
          if (callee.type === "Identifier" && callee.name === "eval")
            ann.add(lineOffset + n.loc.start.line - 1, "error", "'eval()' executes arbitrary code — dangerous and a security risk — remove it and find a safer alternative like JSON.parse() or a lookup object");
          if (callee.type === "Identifier" && callee.name === "alert")
            ann.add(lineOffset + n.loc.start.line - 1, "warning", "'alert()' blocks the browser — avoid in production — use a custom modal or console.log() for debugging instead");
        },
        WithStatement(node: acorn.Node) {
          const loc = getLoc(node);
          if (loc) ann.add(lineOffset + loc.start.line - 1, "error", "'with' statement is forbidden in strict mode and confuses scope — remove it and reference the object properties directly");
        },
      });
    } catch { /* skip unknown nodes */ }
  }
}

const COMMON_CSS_MISSPELLINGS: Record<string, string> = {
  "colour":            "color",
  "backround":         "background",
  "backround-color":   "background-color",
  "backgroud":         "background",
  "backgroud-color":   "background-color",
  "font-weigh":        "font-weight",
  "font-wieght":       "font-weight",
  "font-stlye":        "font-style",
  "font-styel":        "font-style",
  "marign":            "margin",
  "marign-top":        "margin-top",
  "marign-left":       "margin-left",
  "marign-right":      "margin-right",
  "marign-bottom":     "margin-bottom",
  "paddig":            "padding",
  "pading":            "padding",
  "positon":           "position",
  "postion":           "position",
  "dipslay":           "display",
  "disply":            "display",
  "dispaly":           "display",
  "heigth":            "height",
  "hieght":            "height",
  "widht":             "width",
  "wdith":             "width",
  "boreder":           "border",
  "boder":             "border",
  "boreder-radius":    "border-radius",
  "border-raduis":     "border-radius",
  "border-raidus":     "border-radius",
  "overfow":           "overflow",
  "overlow":           "overflow",
  "visiblity":         "visibility",
  "visibilty":         "visibility",
  "opactiy":           "opacity",
  "opcaity":           "opacity",
  "trasition":         "transition",
  "tranistion":        "transition",
  "transtion":         "transition",
  "animaiton":         "animation",
  "animaton":          "animation",
  "flexdirection":     "flex-direction",
  "flex-direcion":     "flex-direction",
  "aign-items":        "align-items",
  "algn-items":        "align-items",
  "jusify-content":    "justify-content",
  "justfy-content":    "justify-content",
  "justify-contnet":   "justify-content",
  "z-idex":            "z-index",
  "zindex":            "z-index",
  "cursur":            "cursor",
  "cusor":             "cursor",
  "pinter-events":     "pointer-events",
  "pointer-evnets":    "pointer-events",
  "text-aign":         "text-align",
  "text-algn":         "text-align",
  "text-decoraion":    "text-decoration",
  "text-decortion":    "text-decoration",
  "box-shaodw":        "box-shadow",
  "box-shdaow":        "box-shadow",
  "leter-spacing":     "letter-spacing",
  "letter-spacng":     "letter-spacing",
  "line-heigth":       "line-height",
  "line-hieght":       "line-height",
  "white-spce":        "white-space",
  "whit-space":        "white-space",
  "word-brek":         "word-break",
  "word-braek":        "word-break",
  "transform-orgin":   "transform-origin",
  "transform-origni":  "transform-origin",
};

function lintEmbeddedStyles(source: string, ann: AnnotationMap): void {
  const styleRegex = /<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/gi;
  let match;
  while ((match = styleRegex.exec(source)) !== null) {
    const content = match[1];
    if (!content.trim()) continue;
    const contentStart = match.index + match[0].length - content.length - "</style>".length;
    const lineOffset = source.slice(0, contentStart).split("\n").length - 1;

    content.split("\n").forEach((text, idx) => {
      const trimmed = text.trim();
      if (!trimmed || trimmed.startsWith("/*") || trimmed.startsWith("*")) return;
      const absLine = lineOffset + idx;

      if (/!important/.test(trimmed))
        ann.add(absLine, "warning", "'!important' overrides the cascade — use a more specific selector instead — overusing it makes CSS very hard to debug");
      if (/\b(TODO|FIXME)\b/i.test(trimmed))
        ann.add(absLine, "warning", "Unresolved TODO/FIXME in CSS");

      // Misspelled property check
      const propMatch = trimmed.match(/^([\w-]+)\s*:/);
      if (propMatch) {
        const prop = propMatch[1].toLowerCase();
        const suggestion = COMMON_CSS_MISSPELLINGS[prop];
        if (suggestion) {
          ann.add(absLine, "error", `Unknown CSS property '${prop}' — did you mean '${suggestion}'? — fix the spelling and the rule will apply correctly`);
        }
      }
    });
  }
}

function lintHTML(code: string): CodeLine[] {
  const rawLines = code.split("\n");
  const ann = new AnnotationMap();
  const tagLineMap = buildTagLineMap(code);

  const looksLikeFullDoc = /<!doctype\s+html/i.test(code) || /<html[\s>]/i.test(code);

  const doc = parseHTML(code, {
    sourceCodeLocationInfo: true,
    onParseError(err) {
      // Suppress missing-doctype on fragments — only relevant for full documents
      if (err.code === "missing-doctype" && !looksLikeFullDoc) return;
      const lineIdx = (err.startLine ?? 1) - 1;
      const msg = HTML_ERROR_MESSAGES[err.code] ?? `Parse error: ${err.code.replace(/-/g, " ")}`;
      ann.add(lineIdx, "error", msg);
    },
  });

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
    ann.add(line - 1, "warning", `Block element <${block}> nested inside inline element <${inline}> — invalid HTML structure`);
  });

  // Table child validation — regex-based because parse5 silently moves invalid children out of <table> in the AST
  // Strip nested valid container blocks first so we only see direct children of <table>
  const VALID_TABLE_CHILDREN = new Set(["thead", "tbody", "tfoot", "tr", "caption", "colgroup", "col", "table"]);
  const tableRegex = /<table\b[^>]*>(?![\s\S]*<table\b)[\s\S]*?<\/table>/gi;
  let tableMatch;
  while ((tableMatch = tableRegex.exec(code)) !== null) {
    const tableStartLine = code.slice(0, tableMatch.index).split("\n").length;
    // Strip out valid container blocks and their contents so only direct children remain
    const stripped = tableMatch[0]
      .replace(/<thead[\s\S]*?<\/thead>/gi, "")
      .replace(/<tbody[\s\S]*?<\/tbody>/gi, "")
      .replace(/<tfoot[\s\S]*?<\/tfoot>/gi, "")
      .replace(/<tr[\s\S]*?<\/tr>/gi, "")
      .replace(/<caption[\s\S]*?<\/caption>/gi, "")
      .replace(/<colgroup[\s\S]*?<\/colgroup>/gi, "");
    const innerTagRegex = /<([a-zA-Z][a-zA-Z0-9-]*)[\s>]/g;
    let innerMatch;
    while ((innerMatch = innerTagRegex.exec(stripped)) !== null) {
      const innerTag = innerMatch[1].toLowerCase();
      if (!VALID_TABLE_CHILDREN.has(innerTag)) {
        // Find the actual line number by searching for this tag in the original source
        const tagSearch = new RegExp(`<${innerTag}[\\s>]`,"i");
        const originalIndex = tableMatch[0].search(tagSearch);
        const lineNum = originalIndex >= 0
          ? tableStartLine + tableMatch[0].slice(0, originalIndex).split("\n").length - 1
          : tableStartLine;
        ann.add(lineNum - 1, "error", `<${innerTag}> is not a valid direct child of <table> — only <thead>, <tbody>, <tfoot>, <tr>, <caption>, and <colgroup> are allowed inside <table>`);
        break;
      }
    }
  }

  walked.missingAlt.forEach(({ line }) => {
    ann.add(line - 1, "warning", "<img> is missing an 'alt' attribute — add alt=\"description of image\" or alt=\"\" if the image is decorative");
  });

  walked.duplicateIds.forEach(({ id, line }) => {
    ann.add(line - 1, "error", `Duplicate id="${id}" — IDs must be unique across the entire document — rename one of them or switch to a class`);
  });

  walked.unlabelledInputs.forEach(({ line }) => {
    ann.add(line - 1, "warning", "<input> has no associated <label> — add <label for=\"inputId\"> above it, or add aria-label=\"description\" directly on the input");
  });

  if (looksLikeFullDoc) {
    // Use line index 1 (the <html> line) to avoid collision with doctype parse errors on line 0
    const metaLine = rawLines.findIndex((l) => /<html[\s>]/i.test(l));
    const langLine = metaLine >= 0 ? metaLine : 0;
    if (walked.missingLang) {
      ann.add(langLine, "warning", '<html> is missing a "lang" attribute (e.g. lang="en") — required for accessibility');
    }
    if (walked.missingCharset) {
      ann.add(langLine, "warning", 'No character encoding declared — add <meta charset="UTF-8"> inside <head>');
    }
    if (walked.missingTitle) {
      ann.add(langLine, "warning", "Document is missing a <title> element inside <head>");
    }
  }

  rawLines.forEach((text, idx) => {
    if (/\bstyle\s*=\s*["'][^"']+["']/.test(text)) {
      ann.add(idx, "warning", "Inline style — consider moving to a CSS class — inline styles are hard to maintain and override");
    }
    if (/\bon\w+\s*=/.test(text)) {
      ann.add(idx, "warning", "Inline event handler — move this to JavaScript using addEventListener() — keeps your HTML clean and your logic in one place");
    }
    if (/\b(TODO|FIXME)\b/i.test(text)) {
      ann.add(idx, "warning", "Unresolved TODO/FIXME in comment");
    }
    if (new RegExp(`</(${[...VOID_ELEMENTS].join("|")})\\s*>`, "i").test(text)) {
      const match = text.match(new RegExp(`</(${[...VOID_ELEMENTS].join("|")})\\s*>`, "i"));
      if (match) {
        ann.add(idx, "error", `<${match[1].toLowerCase()}> is a void element and cannot have a closing tag`);
      }
    }
  });

  lintEmbeddedScripts(code, ann);
    lintEmbeddedStyles(code, ann);

    return buildLines(rawLines, ann);
  }

function lintCSS(code: string): CodeLine[] {
  const rawLines = code.split("\n");
  const ann = new AnnotationMap();

  rawLines.forEach((text, idx) => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.startsWith("/*") || trimmed.startsWith("*")) return;

    if (/!important/.test(trimmed))
      ann.add(idx, "warning", "'!important' overrides the cascade — use a more specific selector instead");
    if (/\b(TODO|FIXME)\b/i.test(trimmed))
      ann.add(idx, "warning", "Unresolved TODO/FIXME in CSS");

    const propMatch = trimmed.match(/^([\w-]+)\s*:/);
    if (propMatch) {
      const prop = propMatch[1].toLowerCase();
      const suggestion = COMMON_CSS_MISSPELLINGS[prop];
      if (suggestion)
        ann.add(idx, "error", `Unknown CSS property '${prop}' — did you mean '${suggestion}'?`);
    }

    // Missing units on non-zero numeric values
    const UNIT_PROPS = new Set([
      "margin","margin-top","margin-right","margin-bottom","margin-left",
      "padding","padding-top","padding-right","padding-bottom","padding-left",
      "width","height","min-width","max-width","min-height","max-height",
      "top","right","bottom","left","font-size","letter-spacing",
      "line-height","border-width","border-radius","gap","row-gap","column-gap",
      "outline-width","text-indent","word-spacing",
    ]);
    const unitPropMatch = trimmed.match(/^([\w-]+)\s*:\s*(-?\d+\.?\d*)\s*;?$/);
    if (unitPropMatch) {
      const prop = unitPropMatch[1].toLowerCase();
      const val = unitPropMatch[2];
      if (UNIT_PROPS.has(prop) && val !== "0") {
        ann.add(idx, "warning", `'${prop}: ${val}' is missing a unit — did you mean '${val}px'? — unitless values on dimension properties are ignored by the browser`);
      }
    }
  });

  return buildLines(rawLines, ann);
}

export function lint(code: string): LintResult {
  const language = detectLanguage(code);
  let lines: CodeLine[];

  switch (language) {
    case "javascript":
      lines = lintJavaScript(code, false);
      break;
    case "typescript":
      lines = lintJavaScript(code, true);
      break;
    case "python":
      lines = lintPython(code);
      break;
    case "html":
      lines = lintHTML(code);
      break;
    case "css":
      lines = lintCSS(code);
      break;
    default:
      lines = code.split("\n").map((text) => ({ text, type: "normal", messages: [] }));
  }

  // Credential / secret detection — runs across all languages
  if (language !== "unknown") {
    const credentialPatterns: Array<{ pattern: RegExp; message: string }> = [
      {
        pattern: /(['"`])[A-Za-z0-9\/+]{40,}\1/,
        message: "Possible hardcoded secret detected — long base64-like string found. Never commit API keys or tokens — use environment variables instead.",
      },
      {
        pattern: /sk_(live|test)_[a-zA-Z0-9]{20,}/,
        message: "Possible Stripe secret key detected — starts with 'sk_live_' or 'sk_test_'. Move this to an environment variable immediately — never expose secret keys in code.",
      },
      {
        pattern: /pk_(live|test)_[a-zA-Z0-9]{20,}/i,
        message: "Possible Stripe publishable key detected — move API keys to environment variables even if publishable keys are less sensitive.",
      },
      {
        pattern: /AIza[0-9A-Za-z\-_]{35}/,
        message: "Possible Google API key detected — starts with 'AIza'. Move this to an environment variable — exposed keys can be abused and billed to your account.",
      },
      {
        pattern: /AKIA[0-9A-Z]{16}/,
        message: "Possible AWS Access Key ID detected — starts with 'AKIA'. Rotate this key immediately and move it to an environment variable.",
      },
      {
        pattern: /ghp_[a-zA-Z0-9]{36}/,
        message: "Possible GitHub Personal Access Token detected — starts with 'ghp_'. Revoke and regenerate this token, then use environment variables.",
      },
      {
        pattern: /xox[baprs]-[0-9A-Za-z\-]{10,}/,
        message: "Possible Slack API token detected — starts with 'xox'. Move this to an environment variable — exposed tokens can compromise your workspace.",
      },
      {
        pattern: /password\s*[:=]\s*['"`][^'"`\s]{6,}['"`]/i,
        message: "Possible hardcoded password detected — never store passwords in source code. Use environment variables or a secrets manager.",
      },
      {
        pattern: /secret\s*[:=]\s*['"`][^'"`\s]{6,}['"`]/i,
        message: "Possible hardcoded secret value detected — move this to an environment variable and remove it from source code.",
      },
      {
        pattern: /api[_-]?key\s*[:=]\s*['"`][^'"`\s]{8,}['"`]/i,
        message: "Possible hardcoded API key detected — move this to an environment variable. Exposed API keys can be stolen from public repositories.",
      },
    ];

    const rawLines = code.split("\n");
    const credAnn = new AnnotationMap();

    rawLines.forEach((lineText, idx) => {
      const trimmed = lineText.trim();
      if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("#") || trimmed.startsWith("*")) return;
      for (const { pattern, message } of credentialPatterns) {
        if (pattern.test(lineText)) {
          credAnn.add(idx, "error", message);
          break; // one warning per line maximum
        }
      }
    });

    // Merge credential annotations into existing lines
    lines = lines.map((line, idx) => {
      const credEntry = credAnn.get(idx);
      if (!credEntry) return line;
      return {
        ...line,
        type: "error" as LineType,
        messages: [...line.messages, ...credEntry.messages],
      };
    });
  }

  // GA: track language used
  if (typeof window !== "undefined" && typeof (window as any).gtag === "function" && language !== "unknown") {
    (window as any).gtag("event", "language_checked", {
      event_category: "Linter",
      event_label: language,
    });
  }

  return { language, lines };
}
