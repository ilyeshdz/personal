---
title: Yapmod
description: Themes, plugins, and a desktop app for Yapin. A project I rebuilt around one shared client and the tools to extend it.
date: 2026-10-20
language: TypeScript / Rust
source: https://github.com/yapmod
stack:
  - SolidJS
  - Tauri
  - Browser extensions
---

<img class="project-banner" src="/uploads/yapmod-banner.svg" alt="Yapmod's pink cat logo and wordmark on a softly dotted background" width="870" height="351">

Yapmod is an open-source client modification for [Yapin](https://yapin.gg), a
chat application with servers, voice calls, and screen sharing. It lets you
change how Yapin looks with CSS themes and extend how it works with JavaScript
plugins, from the settings of the app you already use.

I started it in October 2026 as a desktop application. It has since become a
shared client, a browser extension, a desktop app, and a set of tools for
building plugins. It is an independent community project.

## The first desktop app

The [original codebase](https://github.com/ilyeshdz/yapmod) used Tauri and Rust
to open Yapin in the system WebView and inject my own client code into the page.
It grew quickly: native notifications, a system tray, themes, a plugin system,
community catalogs, and application updates. The interface moved to SolidJS, and
I added a browser extension target too.

A lot of the work was in the details around those features. Making settings
survive a restart. Getting window controls to work inside Yapin's own title bar.
Sorting out Linux AppImage packaging. Keeping plugins working when the page
replaced the elements they were attached to.

I had already started separating the client from its host and updating it
independently, but the desktop application and the modification still lived in
one codebase. Maintaining them together was becoming difficult. In November, I
archived that version and rebuilt the foundations.

## One client in both places

The new [client](https://github.com/yapmod/client) builds into one JavaScript
file that runs inside Yapin. The
[Chrome and Firefox extension](https://github.com/yapmod/web) loads it into a
browser tab. The [desktop app](https://github.com/yapmod/desktop) loads the same
client in a Tauri window on macOS, Windows, and Linux.

That separation is the most useful change I made. A fix to the plugin system can
reach both places without rebuilding the desktop application. The desktop host
handles native notifications, launch at login, window controls, and app updates.
Its own integration with Yapmod's settings is a plugin too.

The first stable release of the rebuilt client shipped on November 19, 2026. The
new desktop app followed on November 20. It is still actively developing.

## Most of the rewrite was the plugin system

I wanted plugins to have a proper place in the application. They can register
settings pages, use shared SolidJS controls, and save preferences through a
typed, reactive storage API. Turning a plugin off removes its registered UI and
resources while keeping its preferences for the next time it is enabled.

Yapin is a React application, so integrating another interface into it means
dealing with elements that can disappear and be recreated during navigation. The
client watches the relevant parts of the page and mounts its settings again when
needed. Plugin authors can register a section without having to solve that
problem themselves.

There are constraints beyond the interface too. Yapin's Content Security Policy
rules out `eval` and `new Function`, so the runtime executes plugins through
temporary inline scripts. Loading, replacing, and unloading a plugin all need to
leave the page in a usable state.

## Making it easier to build something

I built a plugin CLI with hot reload, published the TypeScript definitions, and
made a [plugin starter](https://github.com/yapmod/plugin-starter). It can build
a catalog with a download page and import URLs, so sharing a plugin is part of
the workflow.

My own [plugin collection](https://ilyeshdz.github.io/yapmod-plugin/) includes a
character counter in the message composer and a quick-reply shortcut. They give
me small, practical ways to use the API as it grows.

The project now involves as much work on the tools for other developers as on
the app itself. That is the part I want to keep building: making a small change
to Yapin easy to write, try, and share.

[Website and downloads](https://yapmod.vercel.app/) ·
[Why I rewrote it](https://yapmod.vercel.app/blog/welcome-to-yapmod) ·
[Yapmod community](https://yapin.gg/invite/yapmod)
