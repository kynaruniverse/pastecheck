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
  
  {
    title: "How to fix: Cannot read properties of undefined in JavaScript",
    slug: "cannot-read-properties-of-undefined",
    language: "JavaScript",
    summary:
      "This error means your code tried to access a property on a value that is undefined. The variable exists, but it has no value yet — so JavaScript has nothing to read from.",
    whyItHappens:
      "JavaScript allows variables to exist without a value — their value is undefined until something assigns one. If you try to access a property like .name or .length on undefined, JavaScript throws this error. It usually means data hasn't loaded yet, an API returned nothing, or a function returned undefined instead of the object you expected.",
    brokenExample: `async function getUser() {
  const response = await fetch("/api/user");
  const data = await response.json();
  console.log(data.profile.name);
}

getUser();`,
    fixedExample: `async function getUser() {
  const response = await fetch("/api/user");
  const data = await response.json();

  if (!data.profile) {
    console.log("No profile found");
    return;
  }

  console.log(data.profile.name);
}

getUser();`,
    commonCauses: [
      "Accessing nested properties before checking the parent exists",
      "An API call returned null or an empty object instead of the expected data",
      "A function that should return an object has a missing return statement",
      "Accessing an array item at an index that doesn't exist",
      "Async data used before the await has resolved",
    ],
    primaryCtaCopy: "Check your code and see the exact error line",
    secondaryCtaLabel: "See more JavaScript errors",
    secondaryCtaHref: "/fix/unexpected-token-javascript",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: Missing ) after argument list in JavaScript",
    slug: "missing-parenthesis-after-argument-list",
    language: "JavaScript",
    summary:
      "This error means JavaScript found something unexpected inside a function call. It is almost always a typo — a missing comma, an unclosed string, or a stray character between the arguments.",
    whyItHappens:
      "When JavaScript reads a function call it expects arguments separated by commas and a closing parenthesis at the end. If it finds something that breaks that pattern — an unclosed string, a missing comma, or an illegal character — it throws this error. The mistake is nearly always inside the call itself, not after it.",
    brokenExample: `console.log("Hello" "world");

setTimeout(function() {
  doSomething()
} 1000);`,
    fixedExample: `console.log("Hello", "world");

setTimeout(function() {
  doSomething();
}, 1000);`,
    commonCauses: [
      "Missing comma between two arguments in a function call",
      "Unclosed string inside the argument list — a quote opened but not closed",
      "Missing comma between the function and the delay in setTimeout or setInterval",
      "Extra or misplaced operator inside the arguments",
      "Copy-pasting code that included a line break where a comma should be",
    ],
    primaryCtaCopy: "Drop your code in PasteCheck and get a fix in seconds",
    secondaryCtaLabel: "See more JavaScript errors",
    secondaryCtaHref: "/fix/unexpected-token-javascript",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: Indentation error in Python",
    slug: "python-indentation-error",
    language: "Python",
    summary:
      "Python uses indentation to define code blocks. An IndentationError means a line is indented at a level Python didn't expect — either too far in, not far enough, or mixing tabs and spaces.",
    whyItHappens:
      "Unlike most languages, Python treats whitespace as syntax. Every block — inside an if, a function, a loop — must be indented consistently. If one line is off by even a single space, or if tabs and spaces are mixed in the same file, Python throws an IndentationError. The error is reported on the line that broke the pattern, but the cause is often the line just above it.",
    brokenExample: `def greet(name):
    print("Hello")
  print("Your name is", name)

greet("Alice")`,
    fixedExample: `def greet(name):
    print("Hello")
    print("Your name is", name)

greet("Alice")`,
    commonCauses: [
      "Mixing tabs and spaces in the same file — use one or the other, never both",
      "A line inside a block indented less than the lines around it",
      "Forgetting to indent the body of an if, for, while, or def block",
      "Pasting code from a website or document that used different whitespace",
      "An editor silently converting tabs to spaces or vice versa",
    ],
    primaryCtaCopy: "Paste your Python and find the exact line",
    secondaryCtaLabel: "See more Python errors",
    secondaryCtaHref: "/fix/unexpected-end-of-json-input",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: Unexpected end of JSON input",
    slug: "unexpected-end-of-json-input",
    language: "JavaScript",
    summary:
      "This error means JSON.parse() received a string that cuts off before the JSON is complete. The input started like valid JSON but ended too early — usually an empty string, a truncated response, or an unclosed bracket.",
    whyItHappens:
      "JSON.parse() reads the entire string and expects it to be a complete, valid JSON structure. If the string is empty, ends mid-value, or has an unclosed array or object, the parser hits the end of the input before it has finished — and throws this error. The most common cause is an API response that returned an empty body, or a fetch call where the response was not fully awaited before parsing.",
    brokenExample: `const data = JSON.parse("");

// or

const response = await fetch("/api/data");
const json = JSON.parse(response);`,
    fixedExample: `const raw = '{"name":"Alice"}';
const data = JSON.parse(raw);

// or

const response = await fetch("/api/data");
const json = await response.json();`,
    commonCauses: [
      "Calling JSON.parse() on an empty string — check the value before parsing",
      "Using JSON.parse(response) instead of await response.json() on a fetch response",
      "An API endpoint returning an empty body on error instead of a JSON error object",
      "A truncated string from localStorage or a database that was saved incorrectly",
      "Network timeout cutting off the response before the full JSON body arrived",
    ],
    primaryCtaCopy: "Paste your code and catch this before it hits production",
    secondaryCtaLabel: "See more JavaScript errors",
    secondaryCtaHref: "/fix/unexpected-token-javascript",
    searchIntent: "error-fix",
  },
];