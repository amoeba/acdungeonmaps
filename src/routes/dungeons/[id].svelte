<script context="module" lang="ts">
  /**
   * @type {import('@sveltejs/kit').Load}
   */
  export async function load({ params, fetch, session, stuff }) {
    return {
      props: {
        id: params.id,
      },
    };
  }
</script>

<script lang="ts">
  import TabbedMap from "../../components/TabbedMap.svelte";

  export let id;
</script>

<svelte:head>
  <title>{id}</title>
</svelte:head>

<TabbedMap id={id} />
