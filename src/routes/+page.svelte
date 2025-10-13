<script lang="ts">
  import Scene from "../ui/Scene.svelte";
  import Overlay from "../ui/Overlay.svelte";

  let scene: Scene | undefined = $state();
</script>

<Scene bind:this={scene}></Scene>

{#if scene}
  <Overlay global={scene.global}></Overlay>
{/if}
