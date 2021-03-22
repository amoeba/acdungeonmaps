<script lang="ts">
  import fetch from "isomorphic-unfetch";

  import { onMount } from "svelte";
  import { draw } from "../lib/tile_chart";
  import * as d3 from "d3";

  export let id: string;
  let error;

  const url =
    "https://dungeonmapsdb.vercel.app/dungeonmaps.csv?sql=select%20*%20from%20tiles%20where%20landblock_id%20=%20%27" +
    id +
    "%27&size=max";

  let el;

  onMount(async () => {
    const res = await fetch(url);
    const text = await res.text();

    const data = d3.csvParse(text, (d) => {
      return {
        landblock_id: d.landblock_id,
        x: Number(d.x),
        y: Number(d.y),
        z: Number(d.z),
        rotation: Number(d.rotation),
        environment_id: Number(d.environment_id),
      };
    });

    if (data.length === 0) {
      error = "No data found for dungeon 0x" + id;
    }

    draw(el, data, { mode: "image" });
  });
</script>

{#if error}
  <p class="error"><strong>Error:</strong> {error}</p>
{/if}

<div bind:this={el} class="chart" />

<style>
  .chart {
    display: flex;
    flex-wrap: wrap;
    min-height: 300px;
  }

  :global(svg) {
    border: 1px solid black;
    border-radius: 1px;
  }
</style>
