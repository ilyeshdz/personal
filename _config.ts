import lume from "lume/mod.ts";
import plugins from "./plugins.ts";

const site = lume({
  src: "./src",
  location: new URL("https://ilyeshdz.github.io/personal/"),
  server: {
    open: false,
  },
});

site.cache = null as never;
site.use(plugins());

export default site;
