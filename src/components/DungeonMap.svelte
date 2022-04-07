<script lang="ts">
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import { DungeonMapViz } from "../lib/DungeonMapViz";
  import { TILE_URL } from "../lib/db";

  export let id: string;
  export let name: string = "";
  export let loading = true;
  export let error = null;

  let el: Element;
  let map: any;

  onMount(async () => {
    fetch(TILE_URL(id))
      .then((res) => {
        return res.text();
      })
      .then((text) => {
        const data = d3.csvParse(text, (d) => {
          return {
            landblock_id: d.landblock_id,
            cell_id: d.cell_id,
            x: Number(d.x),
            y: Number(d.y),
            z: Number(d.z),
            rotation: Number(d.rotation),
            environment_id: Number(d.environment_id),
            candidate: d.candidate,
            name: d.name,
          };
        });

        if (data.length <= 0) {
          error = `Tiles for ${id} not found.`;
          loading = false;

          return;
        }

        name = data[0].name;
        map = new DungeonMapViz(el, id, id, data);
        map.draw();

        loading = false;
      })
      .catch((e) => {
        console.log("error?");
        loading = false;
        error = `Error fetching tiles: ${e}`;
      });
  });
</script>

<svelte:head>
  {#if loading}
  <title>Map of 0x{id}</title>
  {:else}
  <title>Map of {name} (0x{id})</title>
  {/if}
</svelte:head>
{#if loading}
  <p class="loading">*portal sounds*</p>
{/if}
{#if error}
  <p class="error">{error}</p>
{/if}
{#if !loading && !error}
  <h2>{name} (<code>0x{id}</code>)</h2>
{/if}

<div bind:this={el} class="chart" />

<style>
  :global(svg) {
    border: 1px solid black;
    border-radius: 4px;
  }

  :global(.controls) {
    padding: 0.25em;
    width: 600px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
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
