<script lang="ts">
  import fetch from "isomorphic-unfetch";
  import { stores } from "@sapper/app";
  import { onMount } from "svelte";
  import { draw } from "../../lib/tile_chart";
  import * as d3 from "d3";

  const { page } = stores();
  const id = $page["params"]["id"];

  const url =
    "https://landblocks.vercel.app/landblocks.csv?sql=select%20*%20from%20landblocks%20where%20landblock_id%20=%20%27" +
    id +
    "%27&_size=max";

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

    console.log(JSON.stringify(data));
    draw(el, data, { mode: "image" });
  });
</script>

<h2><code>0x{id}</code></h2>

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
