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
    secondaryCtaHref: "/fix/python-nameerror-not-defined",
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
  
{
    title: "How to fix: X is not a function in JavaScript",
    slug: "is-not-a-function-javascript",
    language: "JavaScript",
    summary:
      "This TypeError means you called something as a function, but JavaScript found it was undefined, null, a string, or an object instead. The variable exists — it just isn't a function.",
    whyItHappens:
      "JavaScript is dynamically typed, so nothing stops you writing myVar() even if myVar holds a number or is undefined. When execution reaches that line, JavaScript checks the value and throws this error if it can't be called. Common causes: a typo in the function name, calling a method that doesn't exist on that data type, or calling a callback before it has been assigned.",
    brokenExample: `const user = {
  name: "Alice",
  greet: "Hello"
};

user.greet();`,
    fixedExample: `const user = {
  name: "Alice",
  greet: function() {
    return "Hello";
  }
};

user.greet();`,
    commonCauses: [
      "A typo in the function name — check spelling and capitalisation",
      "Calling a property that holds a string or number as if it were a function",
      "Using a method that doesn't exist on that type (e.g. .map() on an object instead of an array)",
      "A callback parameter that was never passed in",
      "Calling a function before it has been defined",
    ],
    primaryCtaCopy: "Paste your code and find the exact line",
    secondaryCtaLabel: "See more JavaScript errors",
    secondaryCtaHref: "/fix/referenceerror-not-defined-javascript",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: ReferenceError — X is not defined in JavaScript",
    slug: "referenceerror-not-defined-javascript",
    language: "JavaScript",
    summary:
      "A ReferenceError means you used a variable name that JavaScript has never seen. It was never declared in the current scope — either it was mistyped, not imported, or declared in a different block.",
    whyItHappens:
      "JavaScript looks up variable names in the current scope, then enclosing scopes, all the way up to the global scope. If it finds nothing, it throws a ReferenceError. This is different from undefined — undefined means the variable exists but has no value. ReferenceError means the name itself doesn't exist at all.",
    brokenExample: `function calculateTotal(price, quantity) {
  const subtotal = price * quantity;
  return subtotal + tax;
}

calculateTotal(10, 3);`,
    fixedExample: `function calculateTotal(price, quantity, tax) {
  const subtotal = price * quantity;
  return subtotal + tax;
}

calculateTotal(10, 3, 2);`,
    commonCauses: [
      "A typo in the variable name — JavaScript is case-sensitive, so total and Total are different",
      "Using a variable declared inside an if block or function outside of it",
      "Forgetting to import a module or component before using it",
      "Using let or const before the line they are declared on",
      "A variable that was removed or renamed elsewhere in the codebase",
    ],
    primaryCtaCopy: "Check your code for undefined references",
    secondaryCtaLabel: "See more JavaScript errors",
    secondaryCtaHref: "/fix/cannot-set-properties-of-null-javascript",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: Cannot set properties of null in JavaScript",
    slug: "cannot-set-properties-of-null-javascript",
    language: "JavaScript",
    summary:
      "This error means your code tried to write a property on a value that is null. Unlike undefined, null is an intentional empty value — but you still cannot assign properties to it.",
    whyItHappens:
      "null is a valid JavaScript value that represents 'no object'. If you try to set a property on null — for example element.style.color when element is null — JavaScript throws this error. It most often happens when a DOM query returns null because the element doesn't exist yet, or an API returned null instead of an object.",
    brokenExample: `const button = document.getElementById("submit-btn");
button.style.backgroundColor = "blue";`,
    fixedExample: `const button = document.getElementById("submit-btn");

if (button) {
  button.style.backgroundColor = "blue";
}`,
    commonCauses: [
      "A DOM query returning null because the element ID is wrong or the script runs before the DOM loads",
      "An API or database returning null instead of an object",
      "A function explicitly returning null when it should return an object",
      "Chaining property access on a null value without checking first",
      "Running script in the <head> before the target element exists in the DOM",
    ],
    primaryCtaCopy: "Paste your code and find the null reference",
    secondaryCtaLabel: "See more JavaScript errors",
    secondaryCtaHref: "/fix/maximum-call-stack-size-exceeded-javascript",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: Maximum call stack size exceeded in JavaScript",
    slug: "maximum-call-stack-size-exceeded-javascript",
    language: "JavaScript",
    summary:
      "This error means a function kept calling itself — or calling other functions that called it back — without ever stopping. JavaScript ran out of stack space and had to abort.",
    whyItHappens:
      "Every function call adds a frame to the call stack. JavaScript has a finite stack size. If a function calls itself recursively with no exit condition, or two functions call each other in a loop, the stack fills up and JavaScript throws this error. It is almost always a missing or unreachable base case in a recursive function.",
    brokenExample: `function countDown(n) {
  console.log(n);
  countDown(n - 1);
}

countDown(5);`,
    fixedExample: `function countDown(n) {
  if (n <= 0) return;
  console.log(n);
  countDown(n - 1);
}

countDown(5);`,
    commonCauses: [
      "A recursive function with no base case — it will always call itself",
      "A base case that is never reached because the condition is wrong",
      "Two functions calling each other in a cycle with no exit",
      "An event handler that triggers the same event it is listening to",
      "JSON.stringify called on an object that contains circular references",
    ],
    primaryCtaCopy: "Paste your code and catch recursive errors",
    secondaryCtaLabel: "See more JavaScript errors",
    secondaryCtaHref: "/fix/unexpected-token-javascript",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: SyntaxError Unexpected identifier in JavaScript",
    slug: "syntaxerror-unexpected-identifier-javascript",
    language: "JavaScript",
    summary:
      "An 'Unexpected identifier' SyntaxError means JavaScript found a plain word where it expected an operator, punctuation, or keyword. It almost always means a missing comma or operator on the line above.",
    whyItHappens:
      "JavaScript tokenises your code into keywords, identifiers, operators, and punctuation. When it encounters an identifier in a position where it was expecting something else — like a comma or closing bracket — it stops and throws this error. The mistake is nearly always one line above the one reported.",
    brokenExample: `const user = {
  name: "Alice"
  age: 30
  city: "London"
};`,
    fixedExample: `const user = {
  name: "Alice",
  age: 30,
  city: "London"
};`,
    commonCauses: [
      "Missing comma between object properties",
      "Missing comma between array items",
      "Two variable declarations on the same line without a separator",
      "Missing operator between two values in an expression",
      "A line break where JavaScript expected the expression to continue",
    ],
    primaryCtaCopy: "Drop your code in PasteCheck and find the missing punctuation",
    secondaryCtaLabel: "See more JavaScript errors",
    secondaryCtaHref: "/fix/unexpected-token-javascript",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: NameError — name is not defined in Python",
    slug: "python-nameerror-not-defined",
    language: "Python",
    summary:
      "A Python NameError means you used a variable or function name that Python has never seen in the current scope. It was never assigned, was misspelled, or was defined somewhere Python can't reach from here.",
    whyItHappens:
      "Python looks up names at runtime, not at parse time. If a name isn't found in the local scope, it checks enclosing scopes, then the global scope, then builtins. If it's found nowhere, Python raises a NameError. This is different from a variable being None — the name itself doesn't exist at all.",
    brokenExample: `def calculate_area(radius):
    area = pi * radius ** 2
    return area

print(calculate_area(5))`,
    fixedExample: `import math

def calculate_area(radius):
    area = math.pi * radius ** 2
    return area

print(calculate_area(5))`,
    commonCauses: [
      "Using a variable before assigning it a value",
      "A typo in the variable or function name — Python is case-sensitive",
      "Forgetting to import a module before using its names",
      "Defining a variable inside an if block and using it outside",
      "A function defined after the line that calls it",
    ],
    primaryCtaCopy: "Paste your Python and find the undefined name",
    secondaryCtaLabel: "See more Python errors",
    secondaryCtaHref: "/fix/python-keyerror",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: KeyError in Python",
    slug: "python-keyerror",
    language: "Python",
    summary:
      "A Python KeyError means you tried to access a dictionary key that doesn't exist. Python raises this instead of returning None — it wants you to handle missing keys explicitly.",
    whyItHappens:
      "Python dictionaries raise a KeyError when you use square bracket access (dict['key']) and the key is not present. This is intentional — Python won't silently return nothing. If you want a safe lookup that returns a default value instead of crashing, use the .get() method.",
    brokenExample: `user = {
    "name": "Alice",
    "email": "alice@example.com"
}

print(user["age"])`,
    fixedExample: `user = {
    "name": "Alice",
    "email": "alice@example.com"
}

print(user.get("age", "not provided"))`,
    commonCauses: [
      "Accessing a key that was never added to the dictionary",
      "A typo in the key name — string keys are case-sensitive",
      "Data loaded from an API or file that is missing an expected field",
      "Using square brackets instead of .get() when the key might not exist",
      "Deleting a key earlier in the code and then trying to access it again",
    ],
    primaryCtaCopy: "Paste your Python and catch KeyErrors before they crash",
    secondaryCtaLabel: "See more Python errors",
    secondaryCtaHref: "/fix/python-syntaxerror-invalid-syntax",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: SyntaxError invalid syntax in Python",
    slug: "python-syntaxerror-invalid-syntax",
    language: "Python",
    summary:
      "A Python SyntaxError means the interpreter found code it cannot parse. Something breaks Python's grammar rules — a missing colon, mismatched bracket, or invalid statement structure.",
    whyItHappens:
      "Python parses your entire file before running any of it. If it finds a line it cannot understand grammatically, it stops immediately and reports a SyntaxError. The reported line is where Python gave up, but the actual mistake is often one or two lines above — a missing colon at the end of a def or if statement is the most common cause.",
    brokenExample: `def greet(name)
    print("Hello", name)

if name == "Alice"
    greet(name)`,
    fixedExample: `def greet(name):
    print("Hello", name)

name = "Alice"
if name == "Alice":
    greet(name)`,
    commonCauses: [
      "Missing colon at the end of a def, if, for, while, or else line",
      "Mismatched or unclosed brackets, parentheses, or quotes",
      "Using a Python 2 print statement (print 'hello') in Python 3",
      "An assignment inside a condition (if x = 1 instead of if x == 1)",
      "Indenting a line that should not be indented",
    ],
    primaryCtaCopy: "Paste your Python and find the exact syntax error",
    secondaryCtaLabel: "See more Python errors",
    secondaryCtaHref: "/fix/python-indentation-error",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: Unclosed HTML tag",
    slug: "html-unclosed-tag",
    language: "HTML",
    summary:
      "An unclosed HTML tag means an element was opened with a start tag but never closed with a matching end tag. Browsers attempt to recover, but the result is broken layout, unexpected nesting, and elements appearing in the wrong place.",
    whyItHappens:
      "HTML requires most elements to have both an opening tag and a matching closing tag. If a closing tag is missing or mismatched, browsers use error-recovery rules to try to fix it — but these rules produce different results across browsers. What looks fine in Chrome may break in Safari. The only safe fix is well-formed HTML.",
    brokenExample: `<div class="card">
  <h2>Article title
  <p>This is the body of the article.</p>
<div class="footer">
  <p>Footer content</p>
</div>`,
    fixedExample: `<div class="card">
  <h2>Article title</h2>
  <p>This is the body of the article.</p>
</div>
<div class="footer">
  <p>Footer content</p>
</div>`,
    commonCauses: [
      "Forgetting the closing tag for a block element like div, section, or article",
      "Closing the wrong tag — closing a div when a p is still open inside it",
      "Copy-pasting a fragment that was already missing its closing tag",
      "Nesting errors — closing an outer element before its inner children are closed",
      "Self-closing void elements like img or input given an unnecessary closing tag",
    ],
    primaryCtaCopy: "Paste your HTML and find unclosed tags instantly",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: CORS policy error in JavaScript",
    slug: "javascript-cors-error",
    language: "JavaScript",
    summary:
      "A CORS error means your browser blocked a network request because the server didn't give permission for your page's origin to access it. This is a server-side restriction — you cannot fix it purely in your JavaScript.",
    whyItHappens:
      "Browsers enforce a Same-Origin Policy — a page at one domain cannot freely request data from another domain. CORS is the mechanism servers use to grant exceptions. If the server's response doesn't include the correct Access-Control-Allow-Origin header, the browser blocks the response. The request does reach the server — the browser blocks the response from reaching your code.",
    brokenExample: `// Your page is at https://myapp.com
// This will be blocked if the API doesn't allow your origin

const response = await fetch("https://api.another-domain.com/data");
const data = await response.json();`,
    fixedExample: `// Option 1: Proxy the request through your own backend
const response = await fetch("/api/proxy/data");
const data = await response.json();

// Option 2: If you control the API server, add this response header:
// Access-Control-Allow-Origin: https://myapp.com`,
    commonCauses: [
      "The API server doesn't include Access-Control-Allow-Origin in its response headers",
      "Making requests directly to a third-party API that doesn't support CORS",
      "A missing or incorrect origin in the server's CORS configuration",
      "Sending custom headers that trigger a CORS preflight check the server doesn't handle",
      "Running your page on localhost and the server not allowing localhost as an origin",
    ],
    primaryCtaCopy: "Paste your JavaScript and check for other issues",
    secondaryCtaLabel: "See more JavaScript errors",
    secondaryCtaHref: "/fix/unexpected-token-javascript",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: Uncaught TypeError in JavaScript",
    slug: "uncaught-typeerror-javascript",
    language: "JavaScript",
    summary:
      "An Uncaught TypeError means JavaScript tried to perform an operation on a value of the wrong type — calling something that isn't a function, or reading a property on null or undefined. 'Uncaught' means nothing handled it, so it crashed the script.",
    whyItHappens:
      "JavaScript is dynamically typed — values carry their type at runtime, not at declaration. When you call a value as a function and it isn't one, or access a property on null, JavaScript throws a TypeError at that exact moment. The word 'Uncaught' means there was no try/catch or .catch() handler anywhere in the call chain, so the error propagated all the way up and terminated the script. The fix is almost always either a type check before the operation, or tracking down where the wrong type entered the variable.",
    brokenExample: `const items = null;
console.log(items.length);

// or

const config = { timeout: 3000 };
config.retry();`,
    fixedExample: `const items = null;
if (items !== null && items !== undefined) {
  console.log(items.length);
}

// or

const config = {
  timeout: 3000,
  retry: function() { return true; }
};
config.retry();`,
    commonCauses: [
      "Accessing .length, .map(), or any property on a value that is null or undefined",
      "Calling a variable as a function when it holds a string, number, or null",
      "An API returning a different shape than expected — object when an array was assumed",
      "A race condition where data is used before it has loaded",
      "A missing default value — function parameter is undefined when no argument is passed",
    ],
    primaryCtaCopy: "Paste your code and find the exact TypeError",
    secondaryCtaLabel: "See more JavaScript errors",
    secondaryCtaHref: "/fix/cannot-read-properties-of-undefined",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: TypeError in Python",
    slug: "python-typeerror",
    language: "Python",
    summary:
      "A Python TypeError means an operation was applied to a value of the wrong type — most often trying to do arithmetic on a string, or passing the wrong kind of value into a function.",
    whyItHappens:
      "Python is strongly typed and will not silently convert between types for you. If you try to subtract a string from a number, or pass a string to a function that expects a list, Python raises a TypeError immediately. Unlike JavaScript, Python never guesses what you meant. The error message tells you exactly which types were involved — read it carefully because it contains the fix.",
    brokenExample: `age = input("Enter your age: ")
years_until_100 = 100 - age
print(years_until_100)`,
    fixedExample: `age = int(input("Enter your age: "))
years_until_100 = 100 - age
print(years_until_100)`,
    commonCauses: [
      "Using input() without converting the result — input() always returns a string, never a number",
      "Trying to add, subtract, or compare a string and a number without converting first",
      "Passing the wrong type to a function (e.g. a string where a list was expected)",
      "Calling a variable as a function when it holds a value, not a callable",
      "A function that returns None implicitly — the caller then tries to use None as a value",
    ],
    primaryCtaCopy: "Paste your Python and find the type mismatch",
    secondaryCtaLabel: "See more Python errors",
    secondaryCtaHref: "/fix/python-nameerror-not-defined",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: AttributeError in Python",
    slug: "python-attributeerror",
    language: "Python",
    summary:
      "A Python AttributeError means you tried to access a method or attribute that doesn't exist on that object. The name is wrong, the object is a different type than you expected, or the attribute hasn't been set yet.",
    whyItHappens:
      "Every Python object has a fixed set of attributes and methods. If you access one that doesn't exist — because you mistyped it, because the object is a different type than you assumed, or because it was never assigned — Python raises an AttributeError. The error message always tells you what was missing and on what type. The most common cause is forgetting parentheses on a method call — accessing the method object instead of calling it.",
    brokenExample: `name = "alice"
print(name.upper)

# or

items = [1, 2, 3]
items.push(4)`,
    fixedExample: `name = "alice"
print(name.upper())

# or

items = [1, 2, 3]
items.append(4)`,
    commonCauses: [
      "Forgetting parentheses on a method call — name.upper is the method object, name.upper() calls it",
      "Using a JavaScript method name on a Python object — .push() doesn't exist, use .append()",
      "Calling a string method on a list, or a list method on a string",
      "An object that is None — None has almost no attributes",
      "Accessing an instance attribute before __init__ has assigned it",
    ],
    primaryCtaCopy: "Paste your Python and find the missing attribute",
    secondaryCtaLabel: "See more Python errors",
    secondaryCtaHref: "/fix/python-typeerror",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: Missing alt attribute on img in HTML",
    slug: "html-missing-alt-attribute",
    language: "HTML",
    summary:
      "A missing alt attribute on an img element is an HTML validation error and an accessibility failure. Screen readers have nothing to say about the image, and if the image fails to load, nothing appears in its place.",
    whyItHappens:
      "The alt attribute provides a text alternative for images. It is required for accessibility compliance (WCAG 2.1) and is flagged by HTML validators, Lighthouse, and most linters. Screen readers read the alt text aloud for visually impaired users. For decorative images that carry no meaning, set alt to an empty string rather than omitting it — an empty string is an intentional signal, a missing attribute is treated as an oversight.",
    brokenExample: `<img src="/images/profile.jpg" width="100" height="100">

<img src="/icons/arrow.svg" class="decorative-arrow">`,
    fixedExample: `<!-- Meaningful image — describe what it shows -->
<img src="/images/profile.jpg" alt="Profile photo of Alice" width="100" height="100">

<!-- Decorative image — use empty alt to signal intentional omission -->
<img src="/icons/arrow.svg" alt="" class="decorative-arrow">`,
    commonCauses: [
      "The attribute was forgotten when the img tag was written",
      "Copy-pasting an img tag that was already missing the attribute",
      "A CMS or template that generates img tags without alt text",
      "Assuming the filename or title attribute is sufficient — neither is a substitute for alt",
      "Decorative images where alt was omitted entirely instead of set to an empty string",
    ],
    primaryCtaCopy: "Paste your HTML and find accessibility issues",
    secondaryCtaLabel: "See more HTML errors",
    secondaryCtaHref: "/fix/html-unclosed-tag",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: UnhandledPromiseRejection in JavaScript",
    slug: "javascript-promise-unhandled-rejection",
    language: "JavaScript",
    summary:
      "An UnhandledPromiseRejection means a Promise failed and nothing caught the error. In Node.js 15 and later this crashes the process. In browsers it logs a warning and your code continues in an unknown state.",
    whyItHappens:
      "Promises represent future values — and they can fail. When a Promise rejects and there is no .catch() handler or try/catch around the await, the rejection is unhandled. In browsers this fires a silent unhandledrejection event. In Node.js 15+ it terminates the process entirely. Even where it doesn't crash, the error is swallowed and your application carries on without knowing something failed — which is usually worse than a visible crash.",
    brokenExample: `async function loadData() {
  const response = await fetch("/api/data");
  const data = await response.json();
  return data;
}

loadData();`,
    fixedExample: `async function loadData() {
  try {
    const response = await fetch("/api/data");
    if (!response.ok) {
      throw new Error("Request failed: " + response.status);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to load data:", error);
    return null;
  }
}

loadData();`,
    commonCauses: [
      "Calling an async function without await and without a .catch() handler",
      "A fetch call where non-2xx responses are not checked — response.ok is never tested",
      "An error thrown inside a .then() callback with no .catch() chained after it",
      "An async function that throws before its return statement is reached",
      "Promise.all() where one promise fails and the rejection is not handled",
    ],
    primaryCtaCopy: "Paste your code and catch unhandled errors",
    secondaryCtaLabel: "See more JavaScript errors",
    secondaryCtaHref: "/fix/is-not-a-function-javascript",
    searchIntent: "error-fix",
  },
{
    title: "How to fix: IndexError — list index out of range in Python",
    slug: "python-indexerror-list-index-out-of-range",
    language: "Python",
    summary:
      "A Python IndexError means you tried to access a position in a list that doesn't exist. Lists are zero-indexed — a list with 3 items has positions 0, 1, and 2. Accessing position 3 throws this error.",
    whyItHappens:
      "Python lists start at index 0, not 1. If your list has 5 items, the valid indexes are 0 through 4. Accessing index 5 — or any index equal to or greater than the length of the list — raises an IndexError. The most common cause is an off-by-one error in a loop, or assuming a list has more items than it does.",
    brokenExample: `items = ["apple", "banana", "cherry"]

for i in range(4):
    print(items[i])`,
    fixedExample: `items = ["apple", "banana", "cherry"]

for i in range(len(items)):
    print(items[i])

# Or more Pythonically:
for item in items:
    print(item)`,
    commonCauses: [
      "Using range(n) where n is larger than the list length",
      "Hardcoding an index without checking the list length first",
      "An off-by-one error — using <= instead of < in a loop condition",
      "A list that is shorter than expected because a filter or slice removed items",
      "Accessing the last item with list[len(list)] instead of list[-1] or list[len(list)-1]",
    ],
    primaryCtaCopy: "Paste your Python and find the exact index error",
    secondaryCtaLabel: "See more Python errors",
    secondaryCtaHref: "/fix/python-typeerror",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: fetch is not defined in JavaScript",
    slug: "javascript-fetch-is-not-defined",
    language: "JavaScript",
    summary:
      "This error means JavaScript cannot find the fetch function. In older Node.js versions fetch does not exist by default — it is a browser API that was only added to Node.js in version 18.",
    whyItHappens:
      "fetch is a browser-native function for making HTTP requests. It was introduced to Node.js in version 18. If you are running Node.js 16 or earlier, fetch does not exist and you will get this ReferenceError. It can also appear in browser code if the script runs in an environment that doesn't support fetch, such as very old browsers or certain server-side rendering setups.",
    brokenExample: `// Running in Node.js 16 or earlier
const response = await fetch("https://api.example.com/data");
const data = await response.json();
console.log(data);`,
    fixedExample: `// Option 1: Upgrade to Node.js 18 or later (fetch is built in)

// Option 2: Use the node-fetch package in older Node.js
import fetch from "node-fetch";

const response = await fetch("https://api.example.com/data");
const data = await response.json();
console.log(data);

// Option 3: Use the built-in https module in Node.js
const https = require("https");`,
    commonCauses: [
      "Running in Node.js 16 or earlier where fetch is not built in",
      "Using fetch in a server-side script that runs outside the browser",
      "A build tool or test runner that doesn't polyfill browser globals",
      "Forgetting to import node-fetch when using it as a package",
      "A typo — fetch spelled incorrectly or called with wrong capitalisation",
    ],
    primaryCtaCopy: "Paste your JavaScript and check for other issues",
    secondaryCtaLabel: "See more JavaScript errors",
    secondaryCtaHref: "/fix/referenceerror-not-defined-javascript",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: async await not working in JavaScript",
    slug: "javascript-async-await-not-working",
    language: "JavaScript",
    summary:
      "When async/await seems to not work, the code usually isn't broken — it's running in the wrong order. The most common cause is forgetting to await a Promise, or using await outside an async function.",
    whyItHappens:
      "async/await is syntactic sugar over Promises. When you call an async function without await, you get a Promise back — not the resolved value. Your code then continues immediately with that unresolved Promise, which looks like undefined or an object rather than the data you expected. The fix is almost always adding a missing await, or making the containing function async so await is valid inside it.",
    brokenExample: `function getData() {
  const response = fetch("/api/data");
  const data = response.json();
  console.log(data);
}

getData();`,
    fixedExample: `async function getData() {
  const response = await fetch("/api/data");
  const data = await response.json();
  console.log(data);
}

getData();`,
    commonCauses: [
      "Forgetting await before fetch, axios, or any function that returns a Promise",
      "Using await inside a function that is not marked async",
      "Calling an async function without await and expecting the result immediately",
      "Using await at the top level in an environment that doesn't support top-level await",
      "A Promise chain mixed with async/await — .then() and await on the same call",
    ],
    primaryCtaCopy: "Paste your code and find the async issue",
    secondaryCtaLabel: "See more JavaScript errors",
    secondaryCtaHref: "/fix/javascript-promise-unhandled-rejection",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: CSS property not working",
    slug: "css-property-not-working",
    language: "CSS",
    summary:
      "When a CSS property has no visible effect, the rule is usually being overridden, applied to the wrong element, or written with a syntax error. The browser is silently ignoring it.",
    whyItHappens:
      "Browsers apply CSS rules based on specificity — the most specific rule wins. If a more specific rule elsewhere sets the same property, your rule loses silently. CSS also ignores properties with invalid values entirely, with no error message. A misspelled property name, a missing unit, or an unsupported value all cause the browser to skip the rule as if it doesn't exist.",
    brokenExample: `/* Rule being overridden by a more specific selector */
p { color: red; }
.content p { color: blue; } /* This wins — more specific */

/* Missing unit — browser ignores this entirely */
.box {
  width: 200;
  margin: 10;
}`,
    fixedExample: `/* Increase specificity or use a more targeted selector */
.content p { color: red; }

/* Add units to numeric values */
.box {
  width: 200px;
  margin: 10px;
}`,
    commonCauses: [
      "A more specific selector elsewhere overrides the rule — check browser DevTools",
      "Missing units on numeric values — width: 200 is invalid, width: 200px is correct",
      "A misspelled property name — the browser silently ignores unknown properties",
      "The property is not inherited and is being set on a parent instead of the target element",
      "A media query or pseudo-class condition is not being met",
    ],
    primaryCtaCopy: "Paste your CSS and find invalid properties instantly",
    secondaryCtaLabel: "See more HTML errors",
    secondaryCtaHref: "/fix/html-unclosed-tag",
    searchIntent: "debug-help",
  },
  {
    title: "How to fix: Cannot read properties of null in JavaScript",
    slug: "cannot-read-properties-of-null-javascript",
    language: "JavaScript",
    summary:
      "This error means your code tried to access a property on null. Unlike undefined, null is an explicit empty value — something intentionally set to nothing. You cannot read properties from it.",
    whyItHappens:
      "null is a deliberate absence of value. It appears when a DOM query finds no matching element, when an API explicitly returns null, or when a variable is initialised as null before a value is assigned. JavaScript throws this error the moment you try to access any property on null — there is nothing there to read from. The fix is always to check for null before accessing properties.",
    brokenExample: `const element = document.querySelector(".does-not-exist");
element.style.display = "none";

// or

const user = null;
console.log(user.name);`,
    fixedExample: `const element = document.querySelector(".does-not-exist");
if (element) {
  element.style.display = "none";
}

// or use optional chaining
const user = null;
console.log(user?.name); // undefined, not an error`,
    commonCauses: [
      "document.querySelector returning null because the element doesn't exist or hasn't loaded yet",
      "An API response explicitly returning null instead of an object",
      "A variable initialised as null and used before being assigned a real value",
      "Optional chaining (?.) not used when navigating potentially null values",
      "A race condition where the DOM element is accessed before it is rendered",
    ],
    primaryCtaCopy: "Paste your code and find the null reference",
    secondaryCtaLabel: "See more JavaScript errors",
    secondaryCtaHref: "/fix/cannot-read-properties-of-undefined",
    searchIntent: "error-fix",
  },
  {
    title: "How to check AI generated code for errors",
    slug: "check-ai-generated-code-errors",
    language: "JavaScript",
    summary:
      "AI-generated code looks confident and complete — but it makes real mistakes. Missing error handling, undefined variables, credential leaks, and logic errors are common. Pasting it through a linter before you run it catches these instantly.",
    whyItHappens:
      "AI models generate code by predicting what code looks like, not by running it. The output is syntactically plausible but untested. Common patterns include functions that never handle the case where a fetch fails, variables used before they are defined, credentials hardcoded in the source, and conditions that are always true or always false. None of these produce a visible error until they do — in production, in front of a user.",
    brokenExample: `// AI-generated code — looks fine at a glance
const API_KEY = "sk-abc123realkey";

async function getUser(id) {
  const response = fetch("/api/users/" + id);
  const data = response.json();
  return data.user.profile.name;
}`,
    fixedExample: `// After linting — issues caught before running
// ⚠ Credential detected: API_KEY looks like a real secret — move to .env
// ⚠ Missing await before fetch()
// ⚠ Missing await before response.json()
// ⚠ No error handling — getUser() has no try/catch

const API_KEY = process.env.API_KEY;

async function getUser(id) {
  try {
    const response = await fetch("/api/users/" + id);
    const data = await response.json();
    return data?.user?.profile?.name ?? null;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
}`,
    commonCauses: [
      "Missing await on fetch or async calls — AI frequently omits these",
      "Hardcoded credentials — API keys, tokens, and passwords left in source",
      "No error handling — AI-generated functions rarely include try/catch",
      "Always-true or always-false conditions — logic errors that never surface until runtime",
      "Variables used before they are defined or returned from a function that returns undefined",
    ],
    primaryCtaCopy: "Paste your AI-generated code and catch errors before they ship",
    secondaryCtaLabel: "See more JavaScript errors",
    secondaryCtaHref: "/fix/unexpected-token-javascript",
    searchIntent: "debug-help",
  },
  {
    title: "How to fix: SyntaxError — cannot use import statement outside a module",
    slug: "cannot-use-import-statement-outside-module",
    language: "JavaScript",
    summary:
      "This error means you used an ES module import statement in a file that Node.js is treating as a CommonJS script. The fix is either adding type: 'module' to your package.json or switching to require().",
    whyItHappens:
      "Node.js supports two module systems: CommonJS (require/module.exports) and ES Modules (import/export). By default, .js files are treated as CommonJS. If you write import syntax in a CommonJS file, Node.js throws this error because the two systems are incompatible. You need to either declare the file as an ES module or use the CommonJS equivalent.",
    brokenExample: `// package.json has no "type": "module"
// This throws in Node.js by default

import express from "express";
import { readFile } from "fs/promises";

const app = express();`,
    fixedExample: `// Option 1: Add to package.json
// { "type": "module" }

// Option 2: Rename the file to .mjs
// myfile.mjs

// Option 3: Use CommonJS require instead
const express = require("express");
const { readFile } = require("fs/promises");

const app = express();`,
    commonCauses: [
      'Missing "type": "module" in package.json when using import syntax',
      "A .js file using import/export when the project expects CommonJS",
      "Running a browser-style ES module file directly in Node.js",
      "A build tool not transpiling import statements before the file reaches Node.js",
      "Mixing require() and import in the same file",
    ],
    primaryCtaCopy: "Paste your JavaScript and find module errors instantly",
    secondaryCtaLabel: "See more JavaScript errors",
    secondaryCtaHref: "/fix/referenceerror-not-defined-javascript",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: Unclosed string literal in JavaScript",
    slug: "javascript-unclosed-string-literal",
    language: "JavaScript",
    summary:
      "An unclosed string literal means a string was opened with a quote but never closed. JavaScript reads everything after it as part of the string — including the rest of your code — until it reaches the end of the line and throws a SyntaxError.",
    whyItHappens:
      "Strings in JavaScript must open and close with matching quote characters — single, double, or backtick. If the closing quote is missing, forgotten, or mismatched (opening with one type, closing with another), the parser never sees the end of the string. Everything on that line after the opening quote is consumed — including other code — and the error is thrown at the end of the line or when the parser encounters something completely invalid.",
    brokenExample: `const message = "Hello, world;
const name = "Alice";

const greeting = \`Welcome back, \${name};`,
    fixedExample: `const message = "Hello, world";
const name = "Alice";

const greeting = \`Welcome back, \${name}\`;`,
    commonCauses: [
      "Forgetting the closing quote at the end of a string",
      "Using a different quote type to close than to open",
      "An apostrophe inside a single-quoted string without escaping it",
      "A template literal with a missing closing backtick",
      "Copy-pasting code that used smart quotes instead of straight quotes",
    ],
    primaryCtaCopy: "Paste your code and find unclosed strings instantly",
    secondaryCtaLabel: "See more JavaScript errors",
    secondaryCtaHref: "/fix/unexpected-token-javascript",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: Expected assignment or function call — no-unused-expressions",
    slug: "javascript-no-unused-expressions",
    language: "JavaScript",
    summary:
      "This warning means a line of code evaluates an expression but does nothing with the result. The most common cause is calling a comparison when an assignment was intended, or writing a ternary without assigning its result.",
    whyItHappens:
      "JavaScript evaluates expressions for their side effects or their return value. A standalone expression that produces a value nobody reads is almost always a mistake — either an assignment using = was accidentally written as a comparison ==, or a function call result was evaluated but never stored or returned. Linters flag this because it indicates the code does less than the developer intended.",
    brokenExample: `let count = 0;

count == 1; // comparison result discarded — should be count = 1

const label = count > 0 ? "items" : "no items"; // unused ternary result`,
    fixedExample: `let count = 0;

count = 1; // assignment

const label = count > 0 ? "items" : "no items";
console.log(label); // result is used`,
    commonCauses: [
      "Using == (comparison) when = (assignment) was intended",
      "A ternary expression whose result is never assigned or returned",
      "A string literal on its own line — often a misplaced JSDoc comment",
      "A function call whose return value was intended to be stored",
      "A semicolon that accidentally terminated a statement too early",
    ],
    primaryCtaCopy: "Paste your code and catch expression warnings",
    secondaryCtaLabel: "See more JavaScript errors",
    secondaryCtaHref: "/fix/unexpected-token-javascript",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: var is function-scoped — use let or const instead",
    slug: "javascript-var-use-let-const",
    language: "JavaScript",
    summary:
      "var has function scope, not block scope — it leaks out of if blocks, loops, and any block that isn't a function. This causes bugs where variables are accessible and modifiable in places you didn't intend. Use let for variables that change, const for everything else.",
    whyItHappens:
      "var was JavaScript's only variable declaration for the first 20 years. It has two problems: it is function-scoped (not block-scoped), and it is hoisted to the top of its function with the value undefined. A var declared inside a for loop is accessible outside it. A var declared inside an if block is accessible outside it. This produces subtle bugs when code is refactored or extended. let and const were introduced in ES6 to fix this — they are block-scoped and not hoisted in the same way.",
    brokenExample: `for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i); // prints 3, 3, 3 — not 0, 1, 2
  }, 100);
}

if (true) {
  var message = "hello";
}
console.log(message); // "hello" — leaks out of the if block`,
    fixedExample: `for (let i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i); // prints 0, 1, 2 — correct
  }, 100);
}

if (true) {
  const message = "hello";
}
// message is not accessible here — block-scoped`,
    commonCauses: [
      "Declaring loop counters with var instead of let",
      "Declaring variables inside if blocks with var — they escape the block",
      "Legacy code written before ES6 that was never updated",
      "Using var in a module where let/const is the expected convention",
      "Hoisting confusion — var declarations are moved to the top of their function silently",
    ],
    primaryCtaCopy: "Paste your JavaScript and catch var usage",
    secondaryCtaLabel: "See more JavaScript errors",
    secondaryCtaHref: "/fix/unexpected-token-javascript",
    searchIntent: "syntax-explanation",
  },
  {
    title: "How to fix: ModuleNotFoundError in Python",
    slug: "python-modulenotfounderror",
    language: "Python",
    summary:
      "A Python ModuleNotFoundError means you tried to import a package that isn't installed in your current environment. Either it needs to be installed with pip, or the import name is wrong.",
    whyItHappens:
      "Python's import system looks for modules in the current directory, then in installed packages, then in the standard library. If a module isn't found in any of these locations, Python raises ModuleNotFoundError. The most common cause is trying to use a third-party package that hasn't been installed yet, or running a script in the wrong virtual environment where the package isn't present.",
    brokenExample: `import requests

response = requests.get("https://api.example.com/data")
print(response.json())`,
    fixedExample: `# First install the package in your terminal:
# pip install requests

import requests

response = requests.get("https://api.example.com/data")
print(response.json())`,
    commonCauses: [
      "The package is not installed — run pip install <package-name>",
      "Running the script in the wrong virtual environment where the package isn't present",
      "A typo in the import name — package names are case-sensitive",
      "The package was installed globally but the script runs in a virtualenv",
      "A package that was renamed — e.g. PIL is installed as Pillow but imported as PIL",
    ],
    primaryCtaCopy: "Paste your Python and check for import errors",
    secondaryCtaLabel: "See more Python errors",
    secondaryCtaHref: "/fix/python-nameerror-not-defined",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: Deprecated HTML element warning",
    slug: "html-deprecated-element",
    language: "HTML",
    summary:
      "A deprecated HTML element is one that was removed from the HTML specification. Browsers may still render it, but it can break at any time, fails accessibility standards, and causes validation errors. Replace it with its modern equivalent.",
    whyItHappens:
      "HTML evolves and elements get replaced when better alternatives exist. Elements like <center>, <font>, <marquee>, and <b> (for bold without meaning) were part of early HTML when styling was done in markup rather than CSS. The HTML5 specification removed them in favour of CSS for visual styling and semantic elements for meaning. Using them today produces validator warnings and risks inconsistent rendering.",
    brokenExample: `<center>
  <font size="5" color="red">Welcome</font>
</center>

<b>Important notice</b>
<i>Additional detail</i>`,
    fixedExample: `<div style="text-align: center;">
  <span style="font-size: 1.5rem; color: red;">Welcome</span>
</div>

<!-- Use strong for importance, em for emphasis -->
<strong>Important notice</strong>
<em>Additional detail</em>`,
    commonCauses: [
      "Using <center> instead of CSS text-align or flexbox/grid centering",
      "Using <font> for text styling instead of CSS",
      "Using <b> and <i> for visual style instead of <strong> and <em> for meaning",
      "Legacy HTML copied from old tutorials or documentation",
      "A CMS or template generator that still outputs outdated markup",
    ],
    primaryCtaCopy: "Paste your HTML and find deprecated elements",
    secondaryCtaLabel: "See more HTML errors",
    secondaryCtaHref: "/fix/html-unclosed-tag",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: RangeError — invalid array length in JavaScript",
    slug: "javascript-rangeerror-invalid-array-length",
    language: "JavaScript",
    summary:
      "A RangeError with 'invalid array length' means you tried to create an array with a negative size, a non-integer size, or a size larger than JavaScript allows. It almost always comes from a variable containing an unexpected value.",
    whyItHappens:
      "JavaScript arrays can only have lengths that are non-negative integers up to 2^32 - 1. If you pass new Array(n) where n is negative, a decimal, NaN, or Infinity — or if n comes from a calculation that produced an unexpected result — JavaScript throws this RangeError. The most common cause is a variable that was supposed to hold a count but ended up as undefined or NaN because a data source returned nothing.",
    brokenExample: `const count = undefined;
const items = new Array(count); // RangeError — undefined is not a valid length

const size = -5;
const buffer = new Array(size); // RangeError — negative length`,
    fixedExample: `const count = undefined;
const safeCount = Number.isInteger(count) && count >= 0 ? count : 0;
const items = new Array(safeCount);

const size = 5;
const buffer = new Array(size);`,
    commonCauses: [
      "Passing undefined or NaN to new Array() because a data source returned nothing",
      "A negative number from a calculation gone wrong",
      "A decimal value where an integer was expected",
      "A very large number that exceeds the maximum array length",
      "Using the result of parseInt() on a non-numeric string — which returns NaN",
    ],
    primaryCtaCopy: "Paste your JavaScript and catch RangeErrors",
    secondaryCtaLabel: "See more JavaScript errors",
    secondaryCtaHref: "/fix/unexpected-token-javascript",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: Python ValueError",
    slug: "python-valueerror",
    language: "Python",
    summary:
      "A Python ValueError means a function received an argument of the right type but an inappropriate value. The most common examples are converting a non-numeric string to int, or unpacking the wrong number of values.",
    whyItHappens:
      "Python raises ValueError when a built-in function or operation gets a value that is structurally correct but semantically wrong. int('hello') fails not because 'hello' is the wrong type (it's a string, which is correct) but because its value can't be represented as an integer. Similarly, trying to unpack 3 values into 2 variables raises ValueError because the counts don't match.",
    brokenExample: `age = int("twenty")

# or

a, b = [1, 2, 3]`,
    fixedExample: `try:
    age = int(input("Enter your age: "))
except ValueError:
    print("Please enter a number")
    age = 0

# or

a, b, c = [1, 2, 3]  # match the number of variables to the list length`,
    commonCauses: [
      "Calling int() or float() on a string that isn't a valid number",
      "Unpacking a list or tuple into the wrong number of variables",
      "Passing an empty string to a conversion function",
      "math.sqrt() or similar called with a negative value",
      "A function parameter that rejects certain values even of the correct type",
    ],
    primaryCtaCopy: "Paste your Python and find ValueErrors before they crash",
    secondaryCtaLabel: "See more Python errors",
    secondaryCtaHref: "/fix/python-typeerror",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: document is not defined in JavaScript",
    slug: "javascript-document-is-not-defined",
    language: "JavaScript",
    summary:
      "This ReferenceError means your code referenced the document object in an environment where it doesn't exist — most commonly Node.js, a server-side renderer, or a build/test environment that isn't the browser.",
    whyItHappens:
      "document is a browser global — it represents the DOM. It only exists in browser environments. Node.js, server-side rendering frameworks, and some testing environments don't have a DOM, so document is simply not defined. Code that accesses document at the top level of a module will throw immediately in these environments. The fix is either to guard the access with an environment check, or to move the DOM code into a function that only runs in the browser.",
    brokenExample: `// This runs in Node.js or SSR — document doesn't exist here
const button = document.getElementById("submit-btn");
button.addEventListener("click", handleClick);`,
    fixedExample: `// Guard with an environment check
if (typeof document !== "undefined") {
  const button = document.getElementById("submit-btn");
  button.addEventListener("click", handleClick);
}

// Or in a framework, run DOM code inside useEffect (React) or onMounted (Vue)`,
    commonCauses: [
      "Running browser code in Node.js — document only exists in the browser",
      "A Next.js or Nuxt.js page accessing the DOM at module level instead of inside a lifecycle hook",
      "A test runner (Jest, Vitest) without jsdom configured",
      "A build script that imports a browser module as a side effect",
      "An SSR framework rendering a component server-side where no DOM exists",
    ],
    primaryCtaCopy: "Paste your JavaScript and find environment errors",
    secondaryCtaLabel: "See more JavaScript errors",
    secondaryCtaHref: "/fix/referenceerror-not-defined-javascript",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: window is not defined in JavaScript",
    slug: "javascript-window-is-not-defined",
    language: "JavaScript",
    summary:
      "This ReferenceError means your code accessed the window object outside the browser — most commonly in Node.js, a server-side renderer, or a test environment. window is a browser-only global and does not exist in these environments.",
    whyItHappens:
      "window is the global object in browsers. It holds browser APIs like localStorage, location, and history. In Node.js and server-side rendering environments, there is no window — so any code that references it at module level throws immediately. The pattern is the same as document is not defined: the fix is to guard the access or move it into a browser-only lifecycle hook.",
    brokenExample: `// Runs in Node.js or SSR — window doesn't exist
const width = window.innerWidth;
const token = window.localStorage.getItem("auth_token");`,
    fixedExample: `// Guard with environment check
if (typeof window !== "undefined") {
  const width = window.innerWidth;
  const token = window.localStorage.getItem("auth_token");
}

// In React — use inside useEffect, which only runs in the browser
useEffect(() => {
  const width = window.innerWidth;
}, []);`,
    commonCauses: [
      "Accessing window at module level in a Next.js or Nuxt.js component",
      "Using localStorage or sessionStorage in a server-side rendered page",
      "A Jest or Vitest test environment without jsdom configured",
      "A utility function that reads window.location being imported in a Node.js script",
      "A browser-only library imported at the top of a file that runs server-side",
    ],
    primaryCtaCopy: "Paste your JavaScript and catch environment errors",
    secondaryCtaLabel: "See more JavaScript errors",
    secondaryCtaHref: "/fix/javascript-document-is-not-defined",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: Unexpected token < in JSON at position 0",
    slug: "javascript-unexpected-token-in-json",
    language: "JavaScript",
    summary:
      "This error means JSON.parse() received HTML instead of JSON. The server returned an error page, a redirect, or a HTML response and your code tried to parse it as JSON. The problem is server-side, not in your JavaScript.",
    whyItHappens:
      "When a server returns a 404, 500, or redirect, the response body is usually an HTML page — not JSON. If your code blindly calls response.json() or JSON.parse() on that response, it hits the opening < of the HTML doctype and throws immediately. The fix is to check response.ok before parsing, so you catch server errors before they become confusing client-side errors.",
    brokenExample: `async function getData() {
  const response = await fetch("/api/users");
  const data = await response.json(); // throws if server returned HTML error page
  return data;
}`,
    fixedExample: `async function getData() {
  const response = await fetch("/api/users");

  if (!response.ok) {
    throw new Error("Server error: " + response.status);
  }

  const data = await response.json();
  return data;
}`,
    commonCauses: [
      "The API endpoint returned a 404 or 500 HTML error page instead of JSON",
      "A server-side redirect returning a HTML page before the API route is reached",
      "A proxy or CDN intercepting the request and returning its own HTML error page",
      "The API URL is wrong — the server is returning the site's 404 page",
      "response.ok not checked — the error was already signalled but ignored",
    ],
    primaryCtaCopy: "Paste your JavaScript and find JSON parsing errors",
    secondaryCtaLabel: "See more JavaScript errors",
    secondaryCtaHref: "/fix/unexpected-end-of-json-input",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: TypeError — map is not a function in JavaScript",
    slug: "javascript-map-is-not-a-function",
    language: "JavaScript",
    summary:
      ".map() is an array method. This error means the value you called it on is not an array — it is undefined, null, an object, or a string. The fix is to confirm you have an array before calling .map().",
    whyItHappens:
      "JavaScript's .map() method only exists on arrays. If the value is undefined (because an API hasn't responded yet), null, a plain object, or any non-array type, calling .map() throws a TypeError. This is extremely common in React when rendering data fetched from an API — the component renders before the data arrives, and the initial state is undefined or an empty object rather than an empty array.",
    brokenExample: `// API returns { users: [...] } but code treats the whole response as an array
const response = await fetch("/api/users");
const data = await response.json();
const names = data.map(user => user.name); // data is an object, not an array

// or in React before data loads
const [users, setUsers] = useState(null);
return users.map(u => <div>{u.name}</div>); // null has no .map()`,
    fixedExample: `const response = await fetch("/api/users");
const data = await response.json();
const names = data.users.map(user => user.name); // access the array property

// or in React — initialise as empty array, not null
const [users, setUsers] = useState([]);
return users.map(u => <div key={u.id}>{u.name}</div>);`,
    commonCauses: [
      "The API returns an object with a nested array — you need to access the property first",
      "Initial state set to null instead of [] — .map() is called before data loads",
      "A fetch response that returned an error object instead of the expected array",
      "Calling .map() on a string or number by mistake",
      "A function that sometimes returns an array and sometimes returns undefined",
    ],
    primaryCtaCopy: "Paste your code and find type errors instantly",
    secondaryCtaLabel: "See more JavaScript errors",
    secondaryCtaHref: "/fix/cannot-read-properties-of-undefined",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: Infinite loop in JavaScript",
    slug: "javascript-infinite-loop",
    language: "JavaScript",
    summary:
      "An infinite loop runs forever because the exit condition is never met. It freezes the browser tab or crashes the Node.js process. The fix is always to ensure the loop condition will eventually become false.",
    whyItHappens:
      "Loops run until their condition evaluates to false. If the condition never becomes false — because the variable controlling it is never updated, or the update moves in the wrong direction — the loop never exits. In browsers this freezes the main thread and makes the tab unresponsive. In Node.js it pegs the CPU until the process is killed.",
    brokenExample: `// Condition never becomes false — i is never incremented
let i = 0;
while (i < 10) {
  console.log(i);
}

// or — wrong direction
let count = 10;
while (count > 0) {
  count++;
}`,
    fixedExample: `let i = 0;
while (i < 10) {
  console.log(i);
  i++; // increment the counter so the condition eventually becomes false
}

let count = 10;
while (count > 0) {
  count--; // decrement toward the exit condition
}`,
    commonCauses: [
      "Forgetting to increment or decrement the loop variable",
      "Updating the variable in the wrong direction — moving away from the exit condition",
      "A break statement inside an if block that is never reached",
      "Mutating an array while iterating over it — the length grows as fast as the index",
      "A while(true) loop with a return or break that is never triggered",
    ],
    primaryCtaCopy: "Paste your code and find loop logic errors",
    secondaryCtaLabel: "See more JavaScript errors",
    secondaryCtaHref: "/fix/maximum-call-stack-size-exceeded-javascript",
    searchIntent: "debug-help",
  },
  {
    title: "How to fix: Python RecursionError — maximum recursion depth exceeded",
    slug: "python-recursionerror-maximum-depth-exceeded",
    language: "Python",
    summary:
      "Python's RecursionError means a function kept calling itself without stopping. Python has a default recursion limit of 1000 calls. The fix is to add a base case that ends the recursion, not to raise the limit.",
    whyItHappens:
      "Every function call in Python uses a stack frame. Python sets a hard limit on how deep the call stack can go — 1000 by default. If a recursive function has no base case, or the base case is never reached, Python hits this limit and raises RecursionError. Raising the limit with sys.setrecursionlimit() is almost never the right fix — a missing or unreachable base case is the real problem.",
    brokenExample: `def factorial(n):
    return n * factorial(n - 1)  # no base case — calls forever

print(factorial(5))`,
    fixedExample: `def factorial(n):
    if n <= 1:          # base case — stops the recursion
        return 1
    return n * factorial(n - 1)

print(factorial(5))`,
    commonCauses: [
      "A recursive function with no base case — it will always call itself",
      "A base case that is unreachable because the condition is wrong",
      "Two functions calling each other with no exit path",
      "Accidentally calling a function from inside itself when it wasn't intended to be recursive",
      "Processing a deeply nested data structure without an iterative alternative",
    ],
    primaryCtaCopy: "Paste your Python and find recursion errors",
    secondaryCtaLabel: "See more Python errors",
    secondaryCtaHref: "/fix/python-typeerror",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: Cannot find module in Node.js",
    slug: "nodejs-cannot-find-module",
    language: "JavaScript",
    summary:
      "This error means Node.js could not locate the file or package you tried to require or import. Either the path is wrong, the package isn't installed, or the file doesn't exist at that location.",
    whyItHappens:
      "Node.js resolves module paths in a specific order: built-in modules first, then node_modules for bare specifiers, then relative file paths. If none of these resolve to a real file, Node.js throws this error. The most common causes are a typo in the path, a missing npm install, or a file that was moved or renamed without updating the import.",
    brokenExample: `// Wrong relative path
const utils = require("./utls"); // typo — should be ./utils

// Package not installed
const axios = require("axios"); // axios not in node_modules`,
    fixedExample: `// Correct relative path
const utils = require("./utils");

// Install the package first, then import
// npm install axios
const axios = require("axios");`,
    commonCauses: [
      "A typo in the file path — Node.js paths are case-sensitive on Linux and macOS",
      "The package is not installed — run npm install",
      "A relative path that points to the wrong directory",
      "The file was moved or renamed but the import wasn't updated",
      "Missing .js extension in environments that require explicit extensions",
    ],
    primaryCtaCopy: "Paste your JavaScript and catch module errors",
    secondaryCtaLabel: "See more JavaScript errors",
    secondaryCtaHref: "/fix/cannot-use-import-statement-outside-module",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: Duplicate ID in HTML",
    slug: "html-duplicate-id",
    language: "HTML",
    summary:
      "An HTML id must be unique across the entire page. Using the same id on more than one element breaks JavaScript DOM queries, CSS selectors, and accessibility tools — only the first match is ever used.",
    whyItHappens:
      "The HTML specification requires every id to appear exactly once per document. Browsers do not enforce this as an error — they silently use the first matching element — but the behaviour is unpredictable and inconsistent across browsers. document.getElementById() returns only the first match. CSS styles only apply to the first match in some browsers. Screen readers and assistive technologies rely on unique IDs for label associations and landmark navigation.",
    brokenExample: `<div id="header">Main header</div>

<!-- Later in the same page -->
<div id="header">Secondary header</div>

<label for="name">Name</label>
<input id="name" type="text">

<!-- Another form further down the page -->
<label for="name">Email</label>
<input id="name" type="email">`,
    fixedExample: `<div id="main-header">Main header</div>
<div id="secondary-header">Secondary header</div>

<label for="contact-name">Name</label>
<input id="contact-name" type="text">

<label for="contact-email">Email</label>
<input id="contact-email" type="email">`,
    commonCauses: [
      "Copy-pasting a block of HTML without updating the id values",
      "A component or partial rendered multiple times on the same page",
      "A template that hardcodes IDs instead of generating unique ones",
      "Form elements reused in modals and inline — same IDs appearing twice",
      "A CMS injecting content blocks with fixed IDs",
    ],
    primaryCtaCopy: "Paste your HTML and find duplicate IDs instantly",
    secondaryCtaLabel: "See more HTML errors",
    secondaryCtaHref: "/fix/html-unclosed-tag",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: console.log showing undefined in JavaScript",
    slug: "javascript-console-log-undefined",
    language: "JavaScript",
    summary:
      "When console.log prints undefined, the variable exists but has no value. The most common causes are a missing return statement, async data used before it has loaded, or a function parameter that was never passed.",
    whyItHappens:
      "undefined in JavaScript means a variable was declared but never assigned a value. It is also the implicit return value of any function that doesn't explicitly return something. When you see it in console.log, it almost always means either the function that was supposed to produce a value didn't return it, an async operation hasn't finished yet, or a property path contains a key that doesn't exist.",
    brokenExample: `function getFullName(user) {
  const full = user.firstName + " " + user.lastName;
  // missing return — function implicitly returns undefined
}

const name = getFullName({ firstName: "Alice", lastName: "Smith" });
console.log(name); // undefined`,
    fixedExample: `function getFullName(user) {
  const full = user.firstName + " " + user.lastName;
  return full; // explicit return
}

const name = getFullName({ firstName: "Alice", lastName: "Smith" });
console.log(name); // "Alice Smith"`,
    commonCauses: [
      "A function that transforms a value but forgets to return it",
      "An async function logged before it has resolved — the Promise object is not the value",
      "A property access on an object where that key doesn't exist",
      "A function parameter not passed when the function is called",
      "Array destructuring where the index doesn't exist in the array",
    ],
    primaryCtaCopy: "Paste your code and find undefined value sources",
    secondaryCtaLabel: "See more JavaScript errors",
    secondaryCtaHref: "/fix/cannot-read-properties-of-undefined",
    searchIntent: "debug-help",
  },
  {
    title: "How to fix: Python FileNotFoundError",
    slug: "python-filenotfounderror",
    language: "Python",
    summary:
      "A Python FileNotFoundError means the file path you provided does not exist at that location. The path is wrong, the file is in a different directory, or the file hasn't been created yet.",
    whyItHappens:
      "Python resolves file paths relative to the current working directory — which is wherever you ran the script from, not where the script file is stored. If you run a script from your home directory but the file is in a subdirectory, a path like 'data.csv' won't find it. Absolute paths avoid this entirely. The error is always about the path being wrong or the file being absent — Python is telling you exactly where it looked and found nothing.",
    brokenExample: `# File is at /project/data/users.csv
# Script is run from /project/

with open("users.csv") as f:  # wrong path — data/ prefix missing
    content = f.read()`,
    fixedExample: `# Option 1: correct relative path
with open("data/users.csv") as f:
    content = f.read()

# Option 2: path relative to the script file (more reliable)
import os
script_dir = os.path.dirname(__file__)
file_path = os.path.join(script_dir, "data", "users.csv")

with open(file_path) as f:
    content = f.read()`,
    commonCauses: [
      "Running the script from a different directory than expected — the path is relative to cwd, not the script",
      "A typo in the filename or directory name — paths are case-sensitive on Linux and macOS",
      "The file hasn't been created yet and the code assumes it already exists",
      "A trailing slash or forward/backslash mismatch on Windows",
      "Using a relative path when an absolute path is required",
    ],
    primaryCtaCopy: "Paste your Python and check for file path errors",
    secondaryCtaLabel: "See more Python errors",
    secondaryCtaHref: "/fix/python-nameerror-not-defined",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: HTML form not submitting",
    slug: "html-form-not-submitting",
    language: "HTML",
    summary:
      "When an HTML form doesn't submit, the most common causes are a missing or incorrect action attribute, a button type that isn't submit, JavaScript preventing the default behaviour, or a required field failing validation silently.",
    whyItHappens:
      "HTML form submission depends on several things aligning: the form must have a valid action (or rely on a JavaScript handler), the button must be type='submit' or the Enter key must be pressed inside a text field, and no script must be calling event.preventDefault() without also handling the submission. Browser-native validation can also silently block a submit if a required field is empty or an input type constraint fails.",
    brokenExample: `<!-- Button type not set — defaults to submit only inside a form, but... -->
<form>
  <input type="text" name="username" required>
  <!-- This button type="button" does NOT submit the form -->
  <button type="button">Submit</button>
</form>`,
    fixedExample: `<form action="/submit" method="POST">
  <input type="text" name="username" required>
  <!-- type="submit" triggers form submission -->
  <button type="submit">Submit</button>
</form>`,
    commonCauses: [
      "Button has type='button' — this explicitly prevents form submission",
      "Missing action attribute with no JavaScript handler to intercept the submit event",
      "JavaScript calling event.preventDefault() without handling the form data",
      "A required input that is empty — browser validation blocks submit silently on some configs",
      "The button is outside the form element — it has no connection to the form",
    ],
    primaryCtaCopy: "Paste your HTML and find form structure errors",
    secondaryCtaLabel: "See more HTML errors",
    secondaryCtaHref: "/fix/html-unclosed-tag",
    searchIntent: "debug-help",
  },
  {
    title: "How to fix: Credentials detected in source code",
    slug: "javascript-credentials-in-source-code",
    language: "JavaScript",
    summary:
      "Hardcoded API keys, passwords, and tokens in source code are a critical security risk. Anyone who can read the file — including anyone with access to your public repository — can use those credentials. Move them to environment variables immediately.",
    whyItHappens:
      "During development it is tempting to paste credentials directly into code to get something working quickly. The problem is that source code gets committed to version control, shared with collaborators, and sometimes made public. Once a secret is in Git history, it is compromised even if you delete it later — the history is permanent. Services like GitHub actively scan for committed secrets and will notify the issuing provider, who may revoke the key automatically.",
    brokenExample: `const stripe = require("stripe")("sk_live_abc123realkey");

const client = new OpenAI({
  apiKey: "sk-proj-xyz789realkey"
});

const db = mysql.createConnection({
  password: "MyDatabasePassword123"
});`,
    fixedExample: `// Store secrets in environment variables — never in source code
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const db = mysql.createConnection({
  password: process.env.DB_PASSWORD
});

// Add a .env file for local development (never commit this file)
// Add .env to your .gitignore`,
    commonCauses: [
      "Pasting an API key directly into code to test quickly — then committing it",
      "Copying example code that included a placeholder key and replacing it with a real one",
      "A .env file committed to version control instead of listed in .gitignore",
      "Credentials stored in a config file that isn't excluded from the repository",
      "Secrets included in client-side JavaScript where they are visible to all users",
    ],
    primaryCtaCopy: "Paste your code and detect exposed credentials",
    secondaryCtaLabel: "See more JavaScript errors",
    secondaryCtaHref: "/fix/unexpected-token-javascript",
    searchIntent: "error-fix",
  },
  {
    title: "How to fix: Missing semicolon warning in JavaScript",
    slug: "javascript-missing-semicolon",
    language: "JavaScript",
    summary:
      "JavaScript uses Automatic Semicolon Insertion (ASI) to add semicolons in most cases — but not all. Relying on ASI produces unpredictable bugs in specific edge cases. Adding explicit semicolons removes the ambiguity entirely.",
    whyItHappens:
      "JavaScript's ASI rules insert a semicolon at the end of a line in most situations, but there are well-known failure cases: lines starting with (, [, or / are not automatically terminated. This means a line ending with a value immediately followed by a line starting with ( will be read as a function call — a silent, hard-to-debug behaviour. Linters flag missing semicolons to protect against these cases.",
    brokenExample: `const a = 1
const b = 2
const c = a + b

// ASI failure case — this is parsed as: const fn = a(b)
const fn = a
(b)`,
    fixedExample: `const a = 1;
const b = 2;
const c = a + b;

const fn = a;
(b);`,
    commonCauses: [
      "Omitting semicolons and relying on ASI — safe most of the time but not always",
      "A line ending with a value followed by a line starting with ( — parsed as a function call",
      "A line ending with a value followed by a line starting with [ — parsed as property access",
      "Inconsistent style in a codebase that enforces semicolons via a linter",
      "Copy-pasting code from a no-semicolon style project into a semicolon-required project",
    ],
    primaryCtaCopy: "Paste your JavaScript and catch semicolon warnings",
    secondaryCtaLabel: "See more JavaScript errors",
    secondaryCtaHref: "/fix/unexpected-token-javascript",
    searchIntent: "syntax-explanation",
  },
  {
    title: "How to fix: Python ZeroDivisionError",
    slug: "python-zerodivisionerror",
    language: "Python",
    summary:
      "A ZeroDivisionError means your code attempted to divide a number by zero. Python raises this immediately rather than returning infinity or NaN. The fix is to check the divisor before dividing.",
    whyItHappens:
      "Division by zero is mathematically undefined. Python raises ZeroDivisionError rather than silently returning a special value like infinity. This is intentional — silent division by zero produces incorrect results that are hard to trace. The error almost always means a variable that was expected to hold a non-zero value is zero — either because of a calculation that went wrong, an empty list, or user input that wasn't validated.",
    brokenExample: `def average(numbers):
    return sum(numbers) / len(numbers)

print(average([]))  # len([]) is 0 — ZeroDivisionError`,
    fixedExample: `def average(numbers):
    if not numbers:
        return 0  # or return None, depending on what makes sense
    return sum(numbers) / len(numbers)

print(average([]))  # returns 0 safely`,
    commonCauses: [
      "Dividing by a variable that is zero because a list or result is empty",
      "A percentage or rate calculation where the total is zero",
      "User input that wasn't validated — the user entered 0 or nothing",
      "An integer division operator // used with a zero divisor",
      "A modulo operation (%) with zero on the right side",
    ],
    primaryCtaCopy: "Paste your Python and find division errors",
    secondaryCtaLabel: "See more Python errors",
    secondaryCtaHref: "/fix/python-valueerror",
    searchIntent: "error-fix",
  },
];