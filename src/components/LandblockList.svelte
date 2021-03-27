<script lang="ts">
  import fetch from "isomorphic-unfetch";

  const fetchLandblocks = (async () => {
    const url =
      "https://dungeonmapsdb.vercel.app/dungeonmaps.json?sql=select%20*%20from%20dungeons%20limit%201000;";

    const response = await fetch(url);

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
