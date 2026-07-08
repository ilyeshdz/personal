import date, { Options as DateOptions } from "lume/plugins/date.ts";
import postcss from "lume/plugins/postcss.ts";
import terser from "lume/plugins/terser.ts";
import shiki, { Options as ShikiOptions } from "https://deno.land/x/lume_shiki/mod.ts";
import basePath from "lume/plugins/base_path.ts";
import slugifyUrls from "lume/plugins/slugify_urls.ts";
import resolveUrls from "lume/plugins/resolve_urls.ts";
import ogImages from "lume/plugins/og_images.ts";
import metas from "lume/plugins/metas.ts";
import pagefind, { Options as PagefindOptions } from "lume/plugins/pagefind.ts";
import googleFonts from "lume/plugins/google_fonts.ts";
import sitemap from "lume/plugins/sitemap.ts";
import feed, { Options as FeedOptions } from "lume/plugins/feed.ts";
import readingInfo from "lume/plugins/reading_info.ts";
import { merge } from "lume/core/utils/object.ts";
import toc from "https://deno.land/x/lume_markdown_plugins@v0.12.0/toc.ts";
import image from "https://deno.land/x/lume_markdown_plugins@v0.12.0/image.ts";
import footnotes from "https://deno.land/x/lume_markdown_plugins@v0.12.0/footnotes.ts";
import { alert } from "npm:@mdit/plugin-alert@0.22.0";

import "lume/types.ts";

// Load custom shiki themes
import lightTheme from "./shiki-light-theme.json" with { type: "json" };
import darkTheme from "./shiki-dark-theme.json" with { type: "json" };

export interface Options {
  shiki?: ShikiOptions;
  date?: Partial<DateOptions>;
  ogImages?: unknown;
  pagefind?: Partial<PagefindOptions>;
  feed?: Partial<FeedOptions>;
}

const geistPixel = await Deno.readFile("./src/_includes/fonts/GeistPixel-Square.ttf");

export const defaults: Options = {
  shiki: {
    themes: {
      light: "ilyes-light",
      dark: "ilyes-dark",
    },
    highlighter: {
      langs: ["javascript", "typescript", "html", "css", "bash", "json", "jsonc"],
      themes: [lightTheme, darkTheme],
    },
    useColorScheme: true,
    cssFile: "/styles/shiki.css",
  },
  feed: {
    output: ["/feed.xml", "/feed.json"],
    query: "type=post",
    info: {
      title: "=metas.site",
      description: "=metas.description",
    },
    items: {
      title: "=title",
    },
  },
  ogImages: {
    options: {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Geist Pixel",
          weight: 400,
          style: "normal",
          data: geistPixel,
        },
        {
          name: "Geist Pixel",
          weight: 700,
          style: "normal",
          data: geistPixel,
        },
      ],
    },
  },
};

/** Configure the site */
export default function (userOptions?: Options) {
  const options = merge(defaults, userOptions);

  return (site: Lume.Site) => {
    site.use(postcss())
      .use(basePath())
      .use(toc())
      .use(shiki(options.shiki))
      .use(readingInfo())
      .use(date(options.date))
      .use(image())
      .use(footnotes())
      .use(resolveUrls())
      .use(slugifyUrls())
      .use(terser())
      .use(googleFonts({
        fonts: "https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=JetBrains+Mono:wght@100..800&family=Geist+Pixel&display=swap",
        subsets: ["latin", "latin-ext"],
        cssFile: "/styles.css",
      }))
      .use(ogImages(options.ogImages as never))
      .use(metas())
      .use(pagefind(options.pagefind))
      .use(sitemap())
      .use(feed(options.feed))
      .add("fonts")
      .add([".css"])
      .add("js")
      .add("favicon.png")
      .add("uploads")
      .mergeKey("extra_head", "stringArray")
      .preprocess([".md"], (pages) => {
        for (const page of pages) {
          page.data.excerpt ??= (page.data.content as string).split(
            /<!--\s*more\s*-->/i,
          )[0];
        }
      });

    // Alert plugin
    site.hooks.addMarkdownItPlugin(alert);

    // Mastodon comment system
    site.remoteFile(
      "/js/comments.js",
      "https://cdn.jsdelivr.net/npm/@oom/mastodon-comments@0.3.2/src/comments.js",
    );
  };
}
