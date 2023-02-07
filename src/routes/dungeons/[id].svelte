<script context="module" lang="ts">
  import { LANDBLOCK_NAME_URL } from "../../lib/db"

  /** @type {import('./$types').PageLoad} */
  export async function load({ fetch, params }) {
    const res = await fetch(LANDBLOCK_NAME_URL(params.id));
    const data = await res.json();

    return {
      props: {
        id: params.id,
        name: data["rows"][0][0]
      },
    };
  }
</script>

<script lang="ts">
  import TabbedMap from "../../components/TabbedMap.svelte";

  export let id;
  export let name;
</script>

<svelte:head>
  <title>{name} (0x{id})</title>
</svelte:head>

<h2>Viewing: <a href={id}>{name} (0x{id})</a></h2>
<TabbedMap id={id} />

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
