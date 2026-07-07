---
title: "A tiny engine for generating file trees"
date: 2026-06-29
author: Ilyes Hernandez
tags:
  - Open Source
  - TypeScript
  - CLI
---

I just tagged 1.0.0 of ts-treegen, a small TypeScript library for describing file structures as data and writing them to disk.

If you've ever built a CLI, a scaffolding tool, or anything that needs to generate a bunch of files and folders, you know the usual approach: a pile of `fs.writeFileSync` calls, manual path joins, and conditional logic scattered everywhere. ts-treegen is my attempt at making that feel less like plumbing and more like just describing what you want.

## What it looks like

```ts
import { file, dir, emit, plan } from "ts-treegen/node";

const files = await emit(
  file("README.md", "# My New App"),
  dir("src", file("index.ts", "console.log('hello');")),
);

const p = await plan(files, { targetDir: "./output" });
await p.run();
```

`file()` and `dir()` build a tree. `emit()` resolves it. `plan()` figures out what needs to be written and gives you a chance to inspect it before anything touches disk. That's the whole API.

Conditional files don't need any special syntax either. It's just JavaScript:

```ts
isProd && file(".env.production", "NODE_ENV=production");
```

No template tags, no wrapper nodes to learn. If a value is falsy, it's filtered out.

## Why I built it this way

The goal from the start was to keep the surface area small enough that you could hold the whole API in your head after reading the README once. I went through a few iterations before landing here, and each one was mostly about removing things rather than adding them. Conflict resolution collapsed down to a single `overwrite` flag. Copy helpers got cut because `fs.cp` already does the job. Custom error types got replaced with things you'd actually reach for in normal code. Every feature I kept had to earn its place by solving something real, not just being possible to build.

Along the way the library also became runtime-agnostic. The core has zero dependencies and works against a small `FileSystem` interface, so I/O is fully pluggable. `ts-treegen/node` wires up Node's `fs/promises` for you out of the box, and there are equivalents for Deno, Bun, Cloudflare Workers, and an in-memory implementation for testing. Implementing your own is easy too, since the interface only has four methods.

Under the hood there's also fail-fast path safety: directory traversal and absolute path escapes get caught before anything is written, so a bad path in your data can't silently write somewhere it shouldn't.

## Where it landed

Getting to 1.0 mostly meant settling on names and shapes I was confident wouldn't need to change again. `access()` became `exists()` because it better describes what the method actually does, and it now returns a boolean instead of throwing. `write()` became `plan()`, giving you a proper object you can inspect and run rather than a fire-and-forget call. Small changes, but they're the kind you want to get right before people start depending on them.

## Try it

```sh
npm install ts-treegen
```

It's zero-dependency, tiny, and works anywhere JavaScript runs. Docs and source are on [GitHub](https://github.com/ilyeshdz/ts-treegen). I'd love to hear what you build with it.
