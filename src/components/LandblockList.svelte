<script lang="ts">
  import fetch from "isomorphic-unfetch";

  const fetchLandblocks = (async () => {
    const response = await fetch(
      "https://landblocks.vercel.app/landblocks.json?sql=select%20distinct(landblock_id)%20from%20landblocks%20order%20by%20landblock_id"
    );

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
          <a href="/dungeons/{row[0]}"><code>0x{row[0]}</code></a>
        </li>
      {/each}
    </ul>
  {:catch error}
    <p>An error occurred!</p>
  {/await}
</div>

<style>
  div {
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
    padding: 0.25em 0.5em;
  }
</style>
