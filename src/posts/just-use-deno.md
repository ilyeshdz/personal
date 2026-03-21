---
title: Just use Deno
date: 2026-03-21
author: Ilyes Hernandez
tags:
  - JavaScript Runtime
---

Every time I start a new project, there's a moment where I open my terminal and type `npm init`. Not because I thought about it. Just because that's what you do. Node.js is the water JavaScript developers swim in, and most of us never stop to notice we're wet.

My answer, at least for new projects, is no. **Just use Deno.**

---

## The Node years

I started with [Node](https://nodejs.org) like almost everyone else. It was everywhere, the community was massive, and every problem I ran into had three Stack Overflow answers and a Medium post from 2017 to go with it. I got good at it, not just "can build a REST API" good, but the kind of comfortable where you stop thinking about the tool and just think about the problem.

But somewhere along the way, that comfort started to feel expensive.

I'm not talking about the runtime itself. What I mean is the *ecosystem overhead*. The moment you start a real project, you're not just writing code. You're picking a linter, configuring ESLint, wiring Prettier, writing a `tsconfig.json`, deciding on a test runner, installing `ts-node` just to run a TypeScript file. Before you've written a single line of business logic, you've made fifteen decisions and touched seven config files.

For a while I assumed this was just the cost of doing things properly. Then I started to wonder if it was just the cost of Node.

The existence of `create-next-app`, `create-remix`, `create-t3-app` and the rest of the `create-*` CLIs is basically a confession. The stack got so heavy, so *fixed*, that the community built scaffolding tools just to make it bearable to start. That's not a feature. That's a workaround for a problem that became so normalized nobody questions it anymore.

---

## First look at Deno, and why I dismissed it

I ran into [Deno](https://deno.com) in 2021. Ryan Dahl's ["10 things I regret about Node.js"](https://www.youtube.com/watch?v=M3BM9TB-8yA) talk had been making the rounds, and Deno felt like the answer he was building toward: TypeScript baked in, a proper security model, no `node_modules` in sight.

It was interesting. It was also not ready for me.

The ecosystem was small in the "the package I need doesn't exist yet" sense. The permission flags felt like friction. And the URL-based imports made me uneasy in a way I couldn't fully articulate at first. It's the same feeling I got with Go's module system early on: something about pulling a random URL as a dependency just felt *off*. What happens when that URL disappears? Who's auditing this? It had a security smell I didn't trust yet.

I filed it under "promising, check back later" and went back to Node.

---

## The turning point

What changed wasn't Deno. What changed was how tired I got.

Not from a single bad project, but from the accumulation. The fifteenth time I copy-pasted a `tsconfig.json`. The third time in a week I spent twenty minutes debugging a module resolution error that had nothing to do with my actual code.

So I went back to Deno. This time with different eyes.

The thing that hit me wasn't a feature. It was an *absence*. I cloned nothing. I installed nothing. I ran a TypeScript file with `deno run` and it just worked:

```bash
deno run hello.ts
# No build step. No config. Just runs.
```

The formatter, linter, and test runner were already there, as quiet defaults I could override if I wanted. And the security model, which had annoyed me before, suddenly made sense. When you run `deno run --allow-net script.ts`, you know exactly what that script can do. That's not a nuisance. That's a professional safeguard. With the task system in `deno.json`, you define your permissions once and stop thinking about them:

```jsonc
// deno.json
{
  "tasks": {
    "dev": "deno run --allow-net --watch main.ts"
  },
  "imports": {
    "hono": "npm:hono"
  }
}
```

Scripts, internal tools, lightweight APIs felt noticeably faster to build. Not because Deno is magic, but because I was spending more time on the actual problem.

---

## The honest tension

Deno originally aimed to be genuinely different, not just a better Node but a different philosophy. URL-based imports, web-standard APIs, a security model that assumed nothing. The vision was coherent. And also, honestly, the URL imports were part of why I stayed skeptical for so long. Pulling a dependency from a raw URL felt weird, same vibe I got from Go's early module system. A dependency that's just a URL lives and dies with that URL. Not a small concern.

Then reality hit. The Node ecosystem is enormous, load-bearing for the internet kind of enormous. For Deno to be usable, it had to support npm packages and Node APIs. Throughout 2023, [that's exactly what happened](https://docs.deno.com/runtime/fundamentals/node/): npm-style imports landed properly, Node built-ins like `node:fs` became supported, and `package.json` interop started working. That's the moment the URL anxiety became mostly moot, you could just use `npm:` specifiers like a normal person.

Then in March 2024, they announced [JSR](https://jsr.io) in public beta. A TypeScript-first registry, works with Node and Bun too, no build step to publish. It's a superset of npm, not a replacement, so it plays nice with everything you already use. That one-two punch from 2023 to early 2024 is honestly what made Deno feel like something you could actually bet on.

I don't think the original tension resolves cleanly. The more Node-compatible Deno becomes, the more it risks just being Node with better defaults. But what it *can* be, and increasingly is, is a better place to build *new* things, even if it never displaces the old ones.

---

## Why enterprises won't move

If Deno is so good, why isn't everyone using it?

Because migration is expensive and organizations are rational. If you're running a production Node.js service with six years of history and a team of twenty, switching runtimes isn't a technical decision, it's a risk management one. Auditing compatibility, retraining the team, updating CI/CD, defending the call when something breaks. Hard sell for a marginal gain.

Ecosystem inertia isn't stupidity. It's survival instinct at scale.

But that argument only applies to existing projects. For something new, a greenfield API, a CLI tool, a prototype, there's no migration cost. There's only a choice.

---

## So just use Deno

For scripts, tools, prototypes, and small-to-medium APIs, especially in TypeScript, Deno gives you a cleaner start. Integrated toolchain, secure-by-default, a modern registry in [JSR](https://jsr.io) that takes TypeScript seriously, and zero setup before your first function.

And if you need npm packages? You can. Deno's compatibility is good enough now that it doesn't force a binary choice anymore.

Deno is not perfect. It may never fully replace Node, and that's fine. But defaulting to Node for new projects is increasingly a habit rather than a decision.

Break the habit. **[Just use Deno.](https://deno.com)**