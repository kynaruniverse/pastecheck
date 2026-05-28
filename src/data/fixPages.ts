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
];