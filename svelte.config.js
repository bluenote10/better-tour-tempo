import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter({
      // We're not setting a `fallback` here, and instead try to use `prerender = true` to avoid
      // SPA mode, and rather use prerendering. The reason for that is that the `relative: true`
      // path handling does not work in the fallback HTML -- it will always contain absolute paths
      // which would fail to work on GitHub. References:
      // - https://svelte.dev/docs/kit/single-page-apps#Usage (see note at the bottom)
      // - https://github.com/sveltejs/kit/issues/9569#issuecomment-3662896582
      // Also note that Claude suggested to use `fallback: "index.html"` even though the docs there
      // state "we recommend avoiding `index.html` if possible".
    }),
    paths: {
      relative: true, // Use relative paths - works at any URL without hardcoding
    },
  },
};

export default config;
