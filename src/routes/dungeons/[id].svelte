<script context="module" lang="ts">
  /**
   * @type {import('@sveltejs/kit').Load}
   */
  export async function load({ page, fetch, session, stuff }) {
    return {
      props: {
        id: page.params.id,
      },
    };
  }
</script>

<script lang="ts">
  import DungeonMap from "../../components/DungeonMap.svelte";

  export let id;
</script>

<svelte:head>
  <title>{id}</title>
</svelte:head>

<DungeonMap {id} />
