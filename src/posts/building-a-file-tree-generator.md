---
title: From ts-plate to ts-treegen, an exercise in designing the right API
date: 2026-06-29
author: Ilyes Hernandez
tags:
  - Open Source
  - TypeScript
  - CLI
---

I rewrote the same library twice in two weeks. I'm not sure if that's embarrassing or the smartest thing I've done recently. Maybe both.

It started with a simple idea: building file structures programmatically should feel more natural than stitching together `fs.writeFileSync` calls and manual path joins. I wanted to describe a tree of files as data and hand it off to a function that just *does* it.

## ts-plate, the first pass

The first version was called `ts-plate`. It had everything. Factory functions for files, directories, root wrappers, conditionals, copy nodes. A conflict resolution system with four strategies — overwrite, skip, error, merge. Structured error types with machine-readable metadata. A documentation site built with VitePress. I shipped six releases in three days.

```ts
import { root, dir, file, when, emit, write } from "@ilyeshdz/ts-plate";

const tree = root(
  dir(
    "project",
    file("README.md", "# My Project"),
    when(true, file("debug.log")),
  ),
);

const outputs = await emit(tree);
await write(outputs);
```

The README called it "Build file trees with TypeScript, not templates." I was proud of it. And then I built `create-ts-plate`.

## The meta-scaffold

`create-ts-plate` was a CLI that scaffolds new projects with `ts-plate` pre-configured. You run `pnpm create ts-plate my-project`, it asks you a few questions — project name, which formatter you want, whether to install deps — and it generates a complete, ready-to-use TypeScript CLI skeleton.

The interesting part is that it was built *using ts-plate itself*. The entire project tree is composed with `file()` and `dir()` calls, emitted and written to disk. A scaffolding tool that scaffolds projects using its own scaffolding library. Meta enough?

But using my own library as the engine for a real tool is where the cracks started to show.

The API was too *big*. A user shouldn't need to learn five node types, three runtime functions, four conflict strategies, and a structured error hierarchy to generate a few files. I had added features because I *could*, not because the problem required them. The `copy` node was clever. The `merge` strategy was clever. But cleverness accumulates, and before long the surface area had expanded past what the problem actually needed.

## The rewrite: ts-treegen

So I started over. New package, new repo, new approach. The core question was: *what's the smallest API that solves this problem well?*

```ts
import { file, dir, emit, plan } from "ts-treegen";

const files = await emit(
  file("README.md", "# My New App"),
  dir(
    "src",
    file("index.ts", "console.log('hello');"),
  ),
);

const p = await plan(files, { targetDir: "./output" });
await p.run();
```

Three functions. `file()` and `dir()` to build the tree. `emit()` to resolve it. `plan()` to inspect and write. That's it.

The protocol is simpler too — nodes are branded with a `Symbol.for("ts-plate.node")` instead of being objects with a `type` field. Any code can create compatible nodes without importing constructors. Conditional files? Just use JavaScript: `isProd && file(...)`. No `when()` node needed.

The things I removed are as important as what I kept:
- **Conflict strategies.** The old version had four. The new one has `overwrite: true/false`. If you need more, compose it.
- **Copy nodes.** They were a leaky abstraction around `fs.cp`. If you need to copy a directory, just do it. The library doesn't need to know.
- **Structured errors.** The old errors carried `path`, `nodeType`, `strategy`, `cause`. They were informative. They were also mostly ignored by consumers.
- **Separate `write()` and `render()`.** One planner function, one `.run()` call.

The performance improved too — parallelized file writes with concurrency control, indexed loops instead of `for...of` spreads, deferred array flattening. But honestly, the performance wasn't the point. The *clarity* was.

## ts-create: the next layer

Once `ts-treegen` was stable, I built `ts-create` on top of it. If `ts-treegen` is the low-level engine for describing file trees, `ts-create` is the high-level framework for building interactive generators.

```ts
import { generator, text, confirm, select } from "@ilyeshdz/ts-create";
import { file, dir } from "ts-treegen";

const gen = generator({ name: "my-generator" })
  .prompt(text("name", "Project name?"))
  .prompt(confirm("useTypescript", "Use TypeScript?"))
  .render(({ answers }) => [
    file("README.md", `# ${answers.name}`),
    answers.useTypescript && file("tsconfig.json", "{}"),
  ])
  .cmd("pnpm install");

await gen.run();
```

The key insight is that the type inference flows end-to-end. Define a `text("name", ...)` prompt, and `answers.name` is typed as `string`. Define a `confirm` prompt, and the corresponding answer is `boolean`. Conditional prompts produce `T | undefined`, forcing you to handle the edge case. No casting, no runtime checks, no `as` assertions.

It also ships with a CLI that reverse-engineers an existing project folder into a generator. Point it at any directory, and it produces a `generator.ts` file that recreates the structure. `package.json` files get special treatment — dependencies are resolved to their latest versions automatically via the npm registry.

## What I learned

The difference between `ts-plate` and `ts-treegen` isn't really the features. It's the design philosophy. The first version assumed more features meant more useful. The rewrite assumed that anything not strictly necessary is actively harmful to understanding.

I could have kept adding to `ts-plate`. The API was extensible, the patterns were in place. But I don't think adding features fixes a design that's trying to be too many things. Sometimes you need to start over, not iterate.

`create-ts-plate` was the thing that made me see it — not by failing, but by working well enough that I could feel the friction of the API I was building *on top of the API I had built*. That's a specific kind of feedback that only comes from using your own tools in a real workflow.

The final ecosystem ended up cleaner too. `ts-treegen` stays small and focused. `ts-create` handles the interactive layer. If you just need to describe a tree and write it, reach for `ts-treegen`. If you need prompts, commands, and type-safe answer handling, reach for `ts-create`. Each one does one thing.

All packages are on npm under the `@ilyeshdz` scope, and the source is on [GitHub](https://github.com/ilyeshdz).

I'm keeping `ts-plate` around. It works. But it's going into maintenance mode. The `ts-treegen` approach is the one I'd bet on going forward. It's smaller, faster, and — most importantly — it knows what it is.
