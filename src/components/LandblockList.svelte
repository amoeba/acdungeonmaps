<script lang="ts">
  import { LANDBLOCKS_URL } from "../lib/db";

  const fetchLandblocks = (async () => {
    const response = await fetch(LANDBLOCKS_URL);

    return await response.json();
  })();
</script>

<div>
  {#await fetchLandblocks}
    <p class="loading">*portal sounds*</p>
  {:then data}
    <ul>
      {#each data.rows as row}
        <li>
          <a href="/dungeons/{row[0]}">{row[1]} (0x{row[0]})</a>
        </li>
      {/each}
    </ul>
  {:catch error}
    <div class="error"><strong>Error:</strong> {error}</div>
  {/await}
</div>

<style>
  div {
    margin-bottom: 1em;
  }

  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }

  li {
    margin: 0;
    padding: 0;
    line-height: 1.5em;
  }
</style>
