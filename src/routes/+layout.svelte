<script lang="ts">
  import "../app.css";

  let { children } = $props();
</script>

<svelte:head>
  <title>lisa.io</title>
</svelte:head>

{@render children?.()}
