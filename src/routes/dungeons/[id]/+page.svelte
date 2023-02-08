<script>
import TabbedMap from "../../../components/TabbedMap.svelte";

/** @type {import('./$types').PageData} */
export let data;
</script>

<svelte:head>
  {#if data.name}
  <title>{data.name} (0x{data.id})</title>
  {/if}
</svelte:head>

<h2>Viewing: <a href={data.id}>{data.name} (0x{data.id})</a></h2>
<TabbedMap id={data.id} />

<style>
  h2 {
    font-size: 115%;
    margin: 0;
  }
  h2 a {
    text-decoration: none;
  }

  h2 a:hover {
    text-decoration: underline;
  }
</style>
