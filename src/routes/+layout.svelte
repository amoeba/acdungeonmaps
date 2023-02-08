<script>
  import Header from "../components/Header.svelte";
  import Footer from "../components/Footer.svelte";

  /** @type {import('./$types').LayoutServerData} */
  export let data;
</script>

<Header />
<main>
  <slot />
</main>
<Footer />
{#if data}
  <p>This staging environment was deployed from {data.deploymentGitBranch}.</p>
{/if}
