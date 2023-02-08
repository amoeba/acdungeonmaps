<script>
  import Header from "../components/Header.svelte";
  import Footer from "../components/Footer.svelte";

  /** @type {import('./$types').LayoutServerData} */
  export let VERCEL_COMMIT_REF;
  const deploymentURL = `https://github.com/amoeba/acdungeonmaps/commit/${VERCEL_COMMIT_REF}`;
</script>

<Header />
<main>
  <slot />
</main>
<Footer />
{#if VERCEL_COMMIT_REF}
  <code><a href={deploymentURL}>{VERCEL_COMMIT_REF}.</a></code>
{/if}
