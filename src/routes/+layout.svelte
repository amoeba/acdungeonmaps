<script>
  import Header from "../components/Header.svelte";
  import Footer from "../components/Footer.svelte";

  /** @type {import('./$types').LayoutServerData} */
  export let COMMIT_REF;
  const deploymentURL = `https://github.com/amoeba/acdungeonmaps/commit/${COMMIT_REF}`;
</script>

<Header />
<main>
  <slot />
</main>
<Footer />
{#if COMMIT_REF}
  <code><a href={deploymentURL}>{COMMIT_REF}.</a></code>
{/if}
