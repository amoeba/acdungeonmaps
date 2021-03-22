<script lang="ts">
  import fetch from "isomorphic-unfetch";

  const fetchLandblocks = (async () => {
    const url =
      "https://dungeonmaps.vercel.app/dungeonmaps.json?sql=select%20*%20from%20dungeons%20limit%201000;";

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
          <a href="/dungeons/{row[0]}"><code>{row[1]}</code></a>
        </li>
      {/each}
    </ul>
  {:catch error}
    <div class="error"><strong>Error:</strong> {error}</div>
  {/await}
</div>

<style>
  ul {
    min-height: 300px;
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    list-style-type: none;
    margin: 0;
    padding: 0;
  }

  li {
    display: inline-block;
    padding: 0 0.5em 0.5em 0;
  }
</style>
