# Cursor Project Rules

Before starting any task:

1. Read `AI_CONTEXT.md`.

2. Minimize token usage:

   * Inspect only files directly related to the task.
   * Do NOT scan the entire repository.
   * Avoid reading unrelated directories.

3. Work in surgical mode:

   * Identify the exact location of the issue.
   * Modify only the minimal number of lines required.
   * Do not rewrite entire components.

4. Preserve architecture:

   * Do not refactor code unless explicitly requested.
   * Do not rename files or restructure modules.
   * Do not introduce new dependencies.

5. Output requirements:

   * Apply only the necessary code changes.
   * Keep explanations minimal.
   * Avoid repeating unchanged code.

Goal: implement the smallest safe change that solves the task while minimizing repository scanning and token usage.
