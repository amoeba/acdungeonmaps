<script lang="ts">
  import ExplodedMap from "./ExplodedMap.svelte";
  import LayeredMap from "./LayeredMap.svelte";
  import ThreeDeeMap from "./ThreeDeeMap.svelte";
  import B from "./B.svelte";

  export let id;

  let contentEl

  const tabs = {
    "exploded": {
      label: "Exploded",
      component: ExplodedMap
    },
    "layered": {
      label: "Layered",
      component: LayeredMap
    },
    "3d": {
      label: "3D",
      component: ThreeDeeMap
    }
  }

  let activeTab = tabs["exploded"];
  let currentComponent = activeTab.component;

  const onTabClick = (e) => {
    const id = e.target.dataset.tab;

    switchTab(id);
  }

  const switchTab = (id: string) => {
    currentComponent = tabs[id].component;
  }
</script>

<div class="tabs">
  <div class="tab-bar">
    {#each Object.keys(tabs) as tab}
    <div
      class="tab"
      on:click={onTabClick}
      data-tab={tab}>
      { tabs[tab].label }
    </div>
    {/each}
  </div>
  <div class="tab-content" bind:this={contentEl}>
    <svelte:component this={currentComponent} id={id} />
  </div>

</div>

<style>
  .tab {
    cursor: pointer;
    background-color: black;
    border-top: 1px solid black;
    border-right: 1px solid black;
    border-left: 1px solid black;
    border-radius: 5px 5px 0 0;
    color: rgb(240, 240, 240);
    padding: 0.25em 0.5em;
  }

  .tab-bar {
    display: flex;
    justify-content: center;
    gap: 1em;
  }

  .tab-content {
    border-radius: 5px;
    border: 1px solid black;
    padding: 1em;
  }
</style>
