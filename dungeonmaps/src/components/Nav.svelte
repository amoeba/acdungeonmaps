<script lang="ts">
  export let segment: string;
</script>

<nav>
  <ul>
    <li>
      <a aria-current={segment === undefined ? "page" : undefined} href="/"
        >List</a
      >
    </li>
  </ul>
</nav>

<style>
  ul {
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
  }

  li {
    display: inline-block;
    margin-right: 1em;
  }

  a {
    text-decoration: none;
  }
</style>
