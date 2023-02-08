<script>
  import Header from "../components/Header.svelte";
  import Footer from "../components/Footer.svelte";

  /** @type {import('./$types').LayoutServerData} */
  export let VERCEL_GIT_COMMIT_SHA;
</script>

<Header />
<main>
  <slot />
</main>
<Footer />

`{VERCEL_GIT_COMMIT_SHA}`
