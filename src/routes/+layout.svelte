<script lang="ts">
  import Nav from "../components/Nav.svelte";

    /** @type {import('./$types').LayoutServerData} */
    export let data;
</script>

<header>
  <h1><a href="/">AC Dungeon Maps</a></h1>
  <Nav />
</header>

<slot />

<footer>
  <div>
  Code used to generated this site is based on code from <a
    href="https://github.com/amoeba/dereth-cartography">David Simpson</a
  >, <a href="https://github.com/paradoxlost">parad0x</a>, the
  <a href="https://acemulator.github.io/">ACE team</a>,
  <a href="https://github.com/OptimShi/MapAC">OptimShi</a>,
  <a href="https://gitlab.com/utilitybelt/utilitybelt.gitlab.io/">trevis</a>,
  and
  <a href="https://github.com/Rawaho/Pegasus/">Rawaho</a>.
  </div>
  <div>
    <p>{data.deploymentGitBranch}.</p>
  </div>
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
