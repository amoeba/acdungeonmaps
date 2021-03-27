<script lang="ts">
  import { DungeonMap } from "../lib/DungeonMap";
  import type { TileData } from "../types/types";
  import { onMount } from "svelte";

  let el: Element;
  export let id: string;
  export let name: string;
  export let data: TileData[];

  let map;

  onMount(async () => {
    map = new DungeonMap(el, id, name, data);
    map.draw();
  });
</script>

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
