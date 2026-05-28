export type SearchIntent = "error-fix" | "debug-help" | "syntax-explanation";

export interface ErrorFixPageConfig {
  title: string;
  slug: string;
  language: string;
  summary: string;
  whyItHappens: string;
  brokenExample: string;
  fixedExample: string;
  commonCauses: string[];
  primaryCtaCopy: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  searchIntent: SearchIntent;
}

export const fixPages: ErrorFixPageConfig[] = [
  {
    title: "How to fix: Unexpected token in JavaScript",
    slug: "unexpected-token-javascript",
    language: "JavaScript",
    summary:
      "An 'Unexpected token' error means JavaScript found a character it didn't expect at that point in your code. It almost always points to a missing bracket, brace, or punctuation — often on the line above the one reported.",
    whyItHappens:
      "JavaScript parses your code top to bottom. When it hits a character that doesn't fit the grammar at that position — a closing bracket with no matching open, a comma where a semicolon should be, or a keyword in the wrong place — it stops and throws this error. The reported line is where the parser gave up, not always where the mistake is. Check the line above first.",
    brokenExample: `function getUser() {
  const name = "Alice"
  const age = 30
  return { name, age
}

console.log(getUser())`,
    fixedExample: `function getUser() {
  const name = "Alice";
  const age = 30;
  return { name, age };
}

console.log(getUser());`,
    commonCauses: [
      "Missing closing } or ) on the line above the reported error",
      "Missing comma between object properties or array items",
      "Using a reserved keyword (class, return, new) as a variable name",
      "Unclosed template literal — a backtick opened but never closed",
      'Copy-pasting code with smart quotes ("") instead of straight quotes ("")',
    ],
    primaryCtaCopy: "Paste your code and find the exact line",
    secondaryCtaLabel: "See more JavaScript errors",
    secondaryCtaHref: "/fix/missing-parenthesis-after-argument-list",
    searchIntent: "error-fix",
  },
];