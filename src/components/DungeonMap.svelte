<script lang="ts">
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import { DungeonMapViz } from "../lib/DungeonMapViz"
  import {TILE_URL }from "../lib/db"

  export let id : string;
  export let loading = true;

  let el : Element;
  let map : any;

  onMount(async() => {
    const res = await fetch(TILE_URL(id));
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

    map = new DungeonMapViz(el, id, id, data);
    map.draw();

    loading = false;
  })
</script>

<h2>0x{id}</h2>

{#if loading}
<p class="loading">*portal sounds*</p>
{/if}
<div bind:this={el} class="chart" />

<style>
  :global(svg) {
    border: 1px solid black;
    border-radius: 0 0 0.25em 0.25em;
    width: 100%;
  }

  :global(.controls) {
    padding: 0.25em;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 0.25em 0.25em 0 0;
    border-top: 1px solid black;
    border-right: 1px solid black;
    border-left: 1px solid black;
    width: 292px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  :global(.controls button) {
    background-color: #ccc;
    color: black;
    border-radius: 0.25em;
    border: 1px solid black;
    font-size: 75%;
    cursor: pointer;
    padding: 0.25em 0.5em;
  }

  :global(.controls .info) {
    font-size: 75%;
    font-family: monospace;
  }

  :global(.label) {
    font-size: 200%;
    font-weight: bold;
  }
</style>
