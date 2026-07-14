---
title: "Let's talk about Deno Desktop"
date: 2026-07-10
author: Ilyes Hernandez
tags:
  - Deno
  - Desktop
---

I've been building web applications for a long time. But there's one thing I've always wanted to build: a desktop application.

There are plenty of solutions out there that let you build desktop apps with web technologies. Some of them use completely different languages for the backend, which never felt right to me. Others, like Electron, use Node.js with Chromium or the host's native web engine. They're genuinely impressive.

However, they wouldn't use Deno.

Deno is built to be minimal. And there was no minimal solution based on Deno that provided the same capabilities as Electron, in a simple way, mostly compatible with most Deno projects.

I've always wanted an Electron-like but for the Deno landscape. When 2.9 shipped, it was finally there.

## Every desktop framework asks you to learn a second project

This is what frustrates me about desktop web frameworks.

Electron wants a `main.js` and a `renderer.js` and a preload script and a build step before you get a single pixel. Tauri wants a whole Rust project living alongside your frontend. You have to learn a second project structure just to open a native window.

Deno Desktop makes a different bet. You already know how to serve HTML.

```ts
Deno.serve(() =>
  new Response(`<!DOCTYPE html><h1>Hello from desktop</h1>`, {
    headers: { "content-type": "text/html" },
  })
);
```

```sh
deno desktop main.ts
```

That's the whole thing. The runtime picks a local port. Your handler binds to it automatically. A window opens. No port management, no extra config, no learning a second mental model.

The reason I like this is simple: the best API is the one you don't have to learn. That sounds obvious, but almost every desktop framework violates it.

## You get to choose your engine, and the default is the right one

What I like is that Deno Desktop supports both approaches. You can use your OS native web engine, or you can bundle Chromium if you need pixel-perfect consistency everywhere. The default is the OS engine.

That default tells you a lot about their thinking. WebView keeps your app around 66 MB uncompressed, or 19 MB with `--compress`. CEF bumps that to roughly 150 MB. By making webview the default and CEF opt-in, Deno is saying: most apps don't need Chromium's rendering fidelity, and the people who do will know it. 19 MB versus 150 MB is not a small difference.

There's also a raw mode underneath that removes the browser engine entirely, meant for WebGPU or custom rendering. I don't think it's useful yet. But maybe someday someone will build a Deno library on top of it that lets you draw directly to the screen with no web engine at all. That would be fun. I haven't heard of anyone doing it yet.

However, the flexibility itself is what matters. And the binary size argument isn't even the thing I find most interesting.

## In-process channels are my favorite part

Here's the thing nobody talks about with desktop frameworks: once your page is on screen, it still needs to talk to the backend. Most frameworks send messages across processes to do that. It works, but you feel it in startup sequences that query the backend for initial state. Those round trips add up.

Deno Desktop keeps everything closer. The runtime and the renderer don't cross process boundaries just to talk to each other.

You register a function on the Deno side:

```ts
const win = new Deno.BrowserWindow();
win.bind("readSettings", async () => {
  const text = await Deno.readTextFile("settings.json");
  return JSON.parse(text);
});
```

And call it from the webview:

```ts
const settings = await bindings.readSettings();
```

That's it. No message channels, no serialization ceremony. If you've used Electron, the mapping is straightforward: `ipcMain.handle` becomes `win.bind`, `ipcRenderer.invoke` becomes `bindings.name()`, and `contextBridge` just disappears.

Why do I care? Because this removes friction you don't notice until it's gone. Each individual call is fast enough in any framework. But they accumulate. The app starts feeling slightly heavy, slightly remote. You can't point at why. In-process calls fix that. Not a revolution, just removing something that shouldn't have been there.

## This philosophy is the whole story

What I keep coming back to is that none of these decisions are random.

Deno already has everything needed to run and package your code. Desktop uses those pieces instead of inventing a second system. The same code that powers your server powers your desktop app. No extra build step.

That consistency is what makes it feel like Deno. Batteries included, zero config, escape hatches when you need them.

Every choice in Deno Desktop follows from that same belief:

- Default to webview, not Chromium.
- Ship in-process channels instead of IPC.
- Auto-detect your framework instead of asking what you're using.

These aren't isolated technical optimizations. They're all the same thesis: the default path should be the right path, and configuration should be opt-in for people who actually need it.

## What I'd honestly tell someone considering it

I should be straight about what's missing. Windows auto-update isn't implemented yet. Notarization is a separate manual step. Mobile support doesn't exist.

I'm not sure all of those are blockers for most projects. The foundation is what matters. Default webview, in-process channels, single command output. The value of a desktop framework is making the easy path the correct one, and this does that.

`deno desktop` is the first desktop framework that made me think I could reach for it today. Not when the ecosystem fills in, not after another rewrite cycle. Today. I think that's worth saying out loud.
