<script lang="ts">
  import { DungeonMap } from "../lib/DungeonMap";
  import type { TileData } from "../types/types";
  import { onMount } from "svelte";

  let el: Element;
  export let data: TileData[];

  console.log("data is");

  onMount(async () => {
    let map = new DungeonMap(el, data);
    map.draw();
  });
</script>

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
