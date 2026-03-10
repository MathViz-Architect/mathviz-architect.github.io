# AI Context for Cursor

General behavior:

* Respond primarily in Russian.
* Keep answers concise by default.
* Provide detailed explanations only when explicitly requested.

Development principles:

* Make the smallest possible change required to solve the task.
* Do NOT perform large refactors unless explicitly requested.
* Preserve the existing architecture and project structure.
* Avoid introducing new dependencies unless clearly necessary.

Token efficiency rules:

* Inspect only files directly related to the task.
* Do NOT scan the entire repository.
* Avoid reading unrelated directories.
* Prefer targeted file inspection instead of global search.

Code change rules:

* Always reference the exact file where the change should be made.
* Modify the minimal number of lines possible.
* Do not rewrite entire components if a small patch is enough.
* Avoid repeating unchanged code.

Output format:

* Provide only the required code modifications.
* Include a short explanation if needed.
* Prefer production-ready TypeScript + React patterns.

Assumptions:

* Assume this is a TypeScript + React project unless stated otherwise.

Goal:

Implement the smallest safe change that solves the task while minimizing repository scanning and token usage.
