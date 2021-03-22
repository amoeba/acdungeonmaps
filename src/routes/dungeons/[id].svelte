<script lang="ts">
  import { stores } from "@sapper/app";
  import DungeonMap from "../../components/DungeonMap.svelte";

  const { page } = stores();
  const id: string = $page["params"]["id"];
</script>

<h2><code>0x{id}</code></h2>

<DungeonMap {id} />
