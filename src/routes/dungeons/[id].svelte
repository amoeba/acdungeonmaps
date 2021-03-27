<script lang="ts">
  import { stores } from "@sapper/app";
  import DungeonMap from "../../components/DungeonMap.svelte";
  import * as d3 from "d3"; //FIXME

  const { page } = stores();
  const id: string = $page["params"]["id"];

  const url =
    "https://dungeonmapsdb.vercel.app/dungeonmaps.csv?sql=select%20*%20from%20tiles%20where%20landblock_id%20=%20%27" +
    id +
    "%27&size=max";

  async function getMapData() {
    const res = await fetch(url);
    const text = await res.text();

    return d3.csvParse(text, (d) => {
      return {
        landblock_id: d.landblock_id,
        x: Number(d.x),
        y: Number(d.y),
        z: Number(d.z),
        rotation: Number(d.rotation),
        environment_id: Number(d.environment_id),
      };
    });
  }
</script>

{#await getMapData()}
  ...waiting...
{:then data}
  <DungeonMap {id} name={id} {data} />
{:catch error}
  ERROR
{/await}
