<script>
  import { page } from "$app/stores";
</script>

<h2>{$page.status}</h2>
<p>{$page.error.message}</p>

<style>
  h2,
  p {
    margin: 0;
    padding: 0;
  }
</style>
