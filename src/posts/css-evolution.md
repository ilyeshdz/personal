---
title: The evolution of how we use CSS
date: 2026-07-08
author: Ilyes Hernandez
tags:
  - CSS
  - Web Development
---

CSS has been around for about 30 years. It is the only styling language built specifically for the web platform, and it is one of the three core technologies that make the web what it is. Without it, every page would be a block of black text on a white background, laid out from top to bottom with no control whatsoever. That is not an exaggeration. That is what the web looks like without CSS.

The original design goal of CSS has never changed. It is a declarative language that describes how documents should be presented. It does one thing and it does it in a standardized way that works across browsers. That restraint is not a weakness. It is the reason CSS has survived for two decades without being replaced. It never tried to be more than a styling language.

Looking back at frontend development in the late 2000s, the frustration is hard to overstate. The gap between what CSS could do and what designs required was so wide that the platform itself felt like the obstacle. The vendor prefix era is the clearest example. You wrote `-webkit-`, `-moz-`, `-ms-`, `-o-` before every experimental property, often all four, because no browser could agree on when a feature was stable. Autoprefixer became a standard dependency not because developers were lazy, but because manual prefix management was genuinely unsustainable. It was not that CSS was badly designed. It was that the pace of the platform could not keep up with what developers were building.

This created a pattern. Every time the platform fell short, the community built a workaround. Those workarounds became tools. Those tools became dependencies. And those dependencies reshaped how we thought about CSS entirely. Each new abstraction solved a real problem, but it also moved us further from writing actual CSS. Eventually, it became natural to assume that any serious project needed a layer on top of CSS to be viable.

However, if CSS is so good at its job, why have we spent so long building alternative ecosystems on top of it? Preprocessors, CSS-in-JS libraries, utility frameworks. The list keeps growing. Every one of them claims to fix something that CSS was supposedly doing wrong.

The answer is that CSS was never wrong. It was incomplete. And for a long time, the only way to get the features we needed was to build them ourselves.

## The preprocessor era: Sass and the missing features

Sass was the first serious attempt to extend CSS with programming language features. At the time, CSS had no variables, no nesting, no mixins, no way to split your styles into multiple files without terrible performance. You repeated the same color value across your entire stylesheet. You wrote the full selector path for every nested element. You copied and pasted vendor prefixes by hand.

```css
$primary: #3498db;
$padding: 1rem;

.card {
  padding: $padding;
  background: white;

  .card-header {
    font-size: 1.25rem;
    color: $primary;
  }
}
```

Sass became the standard because it solved real problems. The SCSS syntax made the transition from CSS trivial. Every valid CSS file was already valid SCSS. Frameworks like Bootstrap built their entire ecosystem on it. For years, starting a serious frontend project without Sass felt irresponsible.

### Custom properties: the first crack

However, the web platform was watching. CSS custom properties (variables) eventually landed in browsers. That alone removed one of the biggest reasons to reach for a preprocessor.

```css
:root {
  --primary: #3498db;
  --padding: 1rem;
}

.card {
  padding: var(--padding);
  background: white;
}
```

What most people do not realize is that custom properties took so long because they are fundamentally different from Sass variables. Sass variables are compiled away at build time. They do not exist in the browser. CSS custom properties cascade, inherit, and are available at runtime. You can change them with JavaScript, override them inside media queries, or set them dynamically based on user interaction. That flexibility required the CSS working group to solve cascade resolution problems that a build-time tool never had to face. The implementation was harder, but the result is more powerful.

### Nesting goes native

Then came native nesting. Now every major browser supports it. After depending on Sass for nested selectors for over a decade and a half, the browser can finally do it natively.

```css
.card {
  padding: 1rem;
  background: white;

  & .card-header {
    font-size: 1.25rem;
    color: var(--primary);
  }
}
```

### The tooling ecosystem

The preprocessor era was also about the tooling ecosystem that grew around it. Tools like PostCSS and Autoprefixer changed how I thought about browser support. Instead of waiting for every browser to implement a feature consistently, I could write modern CSS and let the tooling handle backward compatibility. That was a profound shift. It separated the CSS I write from the CSS the browser receives. Once that separation existed, adding a preprocessing step felt natural rather than exotic.

The same era gave us naming conventions like BEM as workarounds for the lack of real scoping in CSS. BEM was not a tool. It was a discipline. You manually namespaced every class to avoid collisions. `.block__element--modifier`. It worked, but it was tedious. You were effectively writing a scoping system by hand, one class name at a time.

Looking back, I do not think Sass would have become as universal without Node.js changing how we built frontend applications. Once build steps became normal, preprocessing CSS stopped feeling like an exotic choice and started feeling like part of everyday development. Grunt, Gulp, and later Webpack gave developers a way to process assets before they reached the browser. Once you had a build step for JavaScript, adding one for CSS was trivial. The infrastructure that made preprocessing universal was never about CSS. It was about how frontend development itself was evolving.

Sass is not dead. It is still actively maintained and widely used. But the argument for using it on new projects has gotten noticeably weaker. Variables are native. Nesting is native. Cascade layers, `color-mix()`, container queries. The features that once required `@mixin` and `@include` are increasingly available in plain CSS.

Preprocessors were not a mistake. They were a bridge. And like every bridge, once you cross it, you do not need to keep living on it.

However, preprocessing was still about extending CSS syntax. The next generation of tools approached the problem from a completely different direction.

## CSS-in-JS: runtime, build-time, and the object problem

Styled-components changed how a generation of React developers thought about styles. The idea was elegant. Write actual CSS inside your JavaScript file, colocate styles with components, access props directly, and never worry about class name collisions.

```javascript
const Button = styled.button`
  background: ${props => props.variant === 'primary' ? '#3498db' : 'transparent'};
  color: ${props => props.variant === 'primary' ? 'white' : '#3498db'};
  padding: 0.75rem 1.5rem;
  border: 2px solid #3498db;
  border-radius: 6px;

  &:hover {
    opacity: 0.9;
  }
`;
```

### The runtime cost

It felt like magic. And like most magic, it had a hidden cost. Styled-components runs in the browser. Every styled element is parsed, hashed, and injected into the DOM at runtime. If JavaScript fails to load, your styles do not exist. If you are on a slow device, the style injection competes with your application code. Pages that work perfectly on a developer's MacBook stutter on a mid-range Android phone.

The performance cost is easy to overlook when you develop on a modern machine. Runtime CSS-in-JS means every style definition must be serialized, parsed, and inserted as a `<style>` tag during JavaScript execution. The browser's own CSS parser is written in C++ and runs before JavaScript. When you bypass it by generating styles in JavaScript, you lose that performance advantage entirely. On top of that, the library itself adds meaningful overhead to your bundle. That is not a dealbreaker for every project, but it is pure cost that does nothing except enable the abstraction itself.

Then there is the hydration problem. When you server-render styled-components, the server generates class names and injects critical CSS into the response. On the client, the runtime must generate the same class names and reconcile them. If the hashes do not match, you get a flash of unstyled content or a full re-render. This is not a bug. It is a fundamental tension between generating styles at build time or server time and regenerating them on the client.

The deeper problem is architectural. Runtime CSS-in-JS fundamentally depends on JavaScript being present and executing in the browser. For React Server Components, where components run entirely on the server, this model breaks completely. The React team has been clear about this. Runtime CSS-in-JS is not compatible with the server component model, and there is no path to make it compatible without fundamentally changing how it works.

### CSS Modules: the quiet alternative

I have always felt that CSS Modules deserved more attention than they got. The idea is simple: write plain CSS in a `.module.css` file, and the build tool scopes every class name automatically by adding a unique hash. No runtime. No JavaScript dependency. No new syntax to learn. It is just CSS that happens to be scoped.

```css
/* Button.module.css */
.button {
  padding: 0.75rem 1.5rem;
  border: 2px solid #3498db;
  border-radius: 6px;
}

.primary {
  background: #3498db;
  color: white;
}
```

```javascript
import styles from './Button.module.css';

function Button({ variant, children }) {
  return (
    <button className={`${styles.button} ${variant === 'primary' ? styles.primary : ''}`}>
      {children}
    </button>
  );
}
```

CSS Modules solved scoping without any of the runtime overhead. They never got the hype of styled-components because they did not offer anything flashy. They just worked. And for many teams, that was enough.

### Build-time CSS-in-JS

The limitations of runtime CSS-in-JS led to a new category of tools: build-time CSS-in-JS. Panda CSS is the most notable example. It reads your source files at build time, extracts every style call, and generates a plain CSS file before anything reaches the browser. Zero runtime overhead. Works with server components. Type-safe design tokens.

```typescript
import { css } from './styled-system/css';

function App() {
  return (
    <div className={css({
      display: 'flex',
      flexDirection: 'column',
      padding: '4',
      gap: '2',
      bg: 'gray.100',
    })}>
      <h1 className={css({ fontSize: 'xl', fontWeight: 'bold' })}>
        Hello Panda
      </h1>
    </div>
  );
}
```

I appreciate what Panda is trying to do. It solves the runtime problem completely. The generated CSS is clean, modern, and uses cascade layers. But I cannot bring myself to love it. Because look at that syntax. Property names in camelCase, values as strings, no semicolons, no selectors, no cascade. To me, it stops feeling like CSS. It is CSS translated through a JavaScript lens, and that translation loses something fundamental.

CSS was designed to be the best way to describe visual design on the web. Every part of its syntax, the selectors, the cascade, the shorthand properties, was built for that purpose. When you force it into object syntax, you lose the expressiveness that makes CSS what it is. You cannot write `.card h2 + p` in an object. You cannot use the cascade in any meaningful way. Personally, this syntax loses much of what I enjoy about writing CSS.

The irony is that build-time extraction is the right idea, but the syntax it enables is the wrong interface. What we actually need is not CSS expressed in JavaScript objects. It is CSS that can do the things we needed JavaScript for in the first place.

The tension here is that CSS-in-JS solved real problems. Co-location matters. Scoped styles matter. Type safety in styles matters. But the solutions have always felt like workarounds, and the closer native CSS gets to providing these features directly, the less necessary the abstraction becomes. `@scope` for scoping, container queries for context-aware styles, `:has()` for parent selection. The platform is catching up.

Meanwhile, a completely different philosophy was reshaping how developers approached CSS entirely.

## The utility-first shift: Tailwind CSS

No discussion of modern CSS usage is complete without talking about Tailwind CSS. It is, by any measure, one of the most influential CSS tools ever created.

Tailwind's core insight is simple. Instead of writing custom CSS for every component, use a set of predefined utility classes. You want flexbox? Write `flex`. You want padding? Write `p-4`. You want it to be responsive? Add `md:p-6`. The approach eliminates context switching, removes the need to name things, and enforces consistency across your entire codebase.

```html
<div class="flex flex-col md:flex-row gap-4 p-6 bg-white rounded-lg shadow-md">
  <img class="w-full md:w-48 h-48 object-cover rounded-lg" src="photo.jpg" alt="Photo" />
  <div class="flex flex-col gap-2">
    <h2 class="text-xl font-semibold text-gray-900">Card Title</h2>
    <p class="text-gray-600">Card description goes here.</p>
    <button class="self-start px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
      Action
    </button>
  </div>
</div>
```

### The recipe for success

The utility-first idea was not new. Frameworks like Tachyons and BassCSS had already explored atomic CSS, where every class sets exactly one property. But Tailwind was the first to package it with a thoughtful design system, excellent documentation, and a JIT compiler that made the developer experience genuinely fast. It became the standard not because the idea was new, but because the execution was unmatched.

I genuinely love what the Tailwind team has built. The consistency it brings to projects is undeniable. The fact that you can look at any Tailwind component and immediately understand its layout is a huge productivity gain. But I also think we need to be honest about what it is and is not.

It is a convenience layer over CSS. Every utility class maps to one or more CSS properties. You cannot do anything in Tailwind that you cannot also do in CSS. When CSS adds a feature that Tailwind has not generated a utility for, say `@container` queries when they first landed, you drop down to arbitrary values or inline styles.

```html
<div class="[container-type:inline-size]">
  <div class="[@container(min-width:400px)]:grid-cols-2">
  </div>
</div>
```

The syntax also is not CSS. Tailwind ships with a complete baked-in design system. The spacing scale, the color palette, the breakpoints, the font sizes. You can customize all of it, and many teams do. But most developers never touch the config. They use the defaults. And those defaults are someone else's design decisions, inherited without thought.

For me personally, I have found myself reaching for a different approach. UnoCSS is an on-demand atomic CSS engine that takes the utility-first idea and makes it unopinionated. It does not ship with a fixed set of utilities. Instead, it provides presets that you can mix, including one that emulates Tailwind exactly, and lets you build your own system. You define your color palette, your spacing scale, your breakpoints. Truly yours. It is the difference between renting an apartment and building your own house.

### Broader influence

The utility-first approach has been so influential that even traditional frameworks have adopted it. Bootstrap, which started as a component library with `.btn` and `.card` classes, now ships extensive utility classes in its recent versions. The industry has accepted that utilities are useful. The question is not whether to use them, but how much of a system you want to bring along with them.

What is interesting is that utility engines depend on the same build tool infrastructure that made preprocessors universal. They scan your source files, detect which classes you use, and generate only the CSS you need. A modern build pipeline with Vite, PostCSS, and the Tailwind JIT compiler is doing more analysis and transformation than a Sass compilation ever did. The build step has become the foundation of how we use CSS, even when we think we are not using an abstraction.

## Where modern CSS takes us

Walk through the features CSS has gained over the last few years and a pattern emerges. Nearly every major addition closes a gap that previously required an abstraction on top of CSS. The platform is not adding random features. It is systematically replacing the workarounds we built.

Custom properties replaced the variables that Sass provided. Native nesting replaced Sass nesting. `@scope` replaced the scoping that CSS Modules and styled-components handled. Cascade layers replaced the specificity management that naming conventions tried to manage. Container queries replaced responsive utility classes and JavaScript-based resize detection. `color-mix()`, `oklch`, and `light-dark()` replaced color manipulation that previously required Sass functions or JavaScript color libraries.

```css
@layer base {
  :root {
    --surface: #ffffff;
    --text-primary: #1a1a1a;
    --accent: #3498db;
  }
}

@layer components {
  .card {
    container-type: inline-size;
    padding: 1rem;
    background: var(--surface);

    & .card-header {
      font-size: 1.25rem;
      color: var(--text-primary);
    }

    &:has(img) {
      display: grid;
      gap: 1rem;
    }
  }

  @container (min-width: 400px) {
    .card {
      grid-template-columns: 200px 1fr;
    }
  }
}

@layer utilities {
  .surface-dim {
    --surface: #f5f5f5;
  }
}
```

### Cascade layers

Cascade layers deserve special attention because they solve a problem that caused endless frustration. For years, managing specificity meant writing stronger selectors, reaching for `!important`, or relying on naming conventions to keep styles from conflicting. Cascade layers give you explicit control. Define `base`, `components`, `utilities`, and whatever layer comes last wins, regardless of specificity. It does not eliminate the cascade. It gives you a way to organize it that matches how you actually think about your styles. Every preprocessor and CSS-in-JS library built its own version of this. Now it is native.

`@scope` is something I have wanted for years. It lets you define a boundary for your styles without BEM naming or shadow DOM encapsulation. This is exactly what CSS Modules and styled-components were doing, just built into the language.

Container queries changed how I think about responsive design. Instead of tying layout to the viewport, components can respond to their own container size. This matches how component-based architectures actually work, and it removes one of the main reasons teams reached for utility-based responsive classes.

Subgrid, anchor positioning, and view transitions continue this pattern. Each one replaces something developers previously handled with JavaScript or awkward CSS workarounds. Individually, they are quality-of-life improvements. Taken together, they show a platform that has finally started closing the gaps.

None of this means you should stop using your current tools. Tailwind is faster to write than raw CSS for most layouts. Styled-components solved real problems with scoping and co-location that CSS is only now catching up on. And there are massive codebases running Sass in production that will not be rewritten. They should not be. The investment in those tools is already made, and they work well.

However, the question is no longer which abstraction to choose. The frontend community spent nearly twenty years building workarounds that browser vendors have slowly integrated into the platform itself. We built bridges, and then the landscape shifted so they were no longer needed. Not because the bridges were bad, but because the other side moved closer.

CSS was never broken. It was just incomplete. Now it is finishing its sentences.
