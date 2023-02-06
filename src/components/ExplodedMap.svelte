<script lang="ts">
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import { ExplodedMapViz } from "../lib/ExplodedMapViz";
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
        map = new ExplodedMapViz(el, id, id, data);
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

<div class="layers" bind:this={el} />

<style>
  .layers {
    display: flex;
    flex-wrap: wrap;
    gap: 1em;
  }

  :global(.map-container) {
    display: flex;
    border: 1px solid #666;
    border-radius: 0.25em;
    position: relative;
  }

  :global(.map-title) {
    position: absolute;
    top: 0;
    right: 0;
    padding: 0.25em;
  }
</style>
