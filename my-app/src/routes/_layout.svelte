<script lang="ts">
  import Nav from "../components/Nav.svelte";

  export let segment: string;
</script>

<header>
  <h1><a href="/">Dungeon Maps</a></h1>
  <Nav {segment} />
</header>

<main>
  <slot />
</main>

<footer>
  Code used to generated this site is based on code from <a
    href="https://github.com/amoeba/dereth-cartography">David Simpson</a
  >, <a href="https://github.com/paradoxlost">parad0x</a>, the
  <a href="https://acemulator.github.io/">ACE team</a>,
  <a href="https://github.com/OptimShi/MapAC">OptimShi</a>
  and
  <a href="https://github.com/Rawaho/Pegasus/">Rawaho</a>.
</footer>

<style>
  header h1 {
    margin: 0;
    padding: 0;
  }

  header h1 a {
    color: black;
  }

  header a {
    text-decoration: none;
  }
</style>
