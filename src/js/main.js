import Comments from "./comments.js";

customElements.define("mastodon-comments", Comments);

document.addEventListener("DOMContentLoaded", () => {
  for (const pre of document.querySelectorAll("pre")) {
    const btn = document.createElement("button");
    btn.className = "copy-btn";
    const svg = (path) => `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
    btn.innerHTML = svg(`<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>`);
    btn.addEventListener("click", async () => {
      const code = pre.querySelector("code");
      if (!code) return;
      try {
        await navigator.clipboard.writeText(code.textContent || "");
        btn.innerHTML = svg(`<polyline points="20 6 9 17 4 12"/>`);
        setTimeout(() => {
          btn.innerHTML = svg(`<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>`);
        }, 1500);
      } catch {
        btn.innerHTML = svg(`<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>`);
      }
    });
    pre.appendChild(btn);
  }
});
