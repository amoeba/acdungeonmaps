<script lang="ts">
  import { DungeonMap } from "../lib/DungeonMap";
  import type { TileData } from "../types/types";
  import { onMount } from "svelte";

  let el: Element;
  export let id: number;
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
  }

  :global(.controls) {
    padding: 0.25em;
    background-color: #aae;
    border-radius: 0.25em 0.25em 0 0;
    border-top: 1px solid black;
    border-right: 1px solid black;
    border-left: 1px solid black;
    width: 592px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  :global(.controls button) {
    background-color: #cc6;
    color: black;
    border-radius: 0.25em;
    border: 1px solid #888;
    font-size: 75%;
    cursor: pointer;
    padding: 0.25em 0.5em;
  }

  :global(.controls .info) {
    font-size: 75%;
  }

  :global(.label) {
    font-size: 300%;
    font-weight: bold;
  }
</style>
