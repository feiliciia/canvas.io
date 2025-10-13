<script lang="ts">
  import { Player } from "../game/player.svelte";
  import { global } from "../game/global.svelte";
  import * as Icon from "lucide-svelte";

  let score = $derived.by(() => {
    const totalMass = global.localPlayer?.cells.reduce((acc, cell) => acc + cell.mass, 0) ?? 0;
    return ~~Math.pow(totalMass, 0.6);
  });

  let topPlayers: Player[] = $derived.by(() => {
    if (!global.world) {
      return [];
    }

    return global.world.players.toSorted((a, b) => {
      return a.cells.reduce((acc, cell) => acc + cell.mass, 0) - b.cells.reduce((acc, cell) => acc + cell.mass, 0);
    });
  });
</script>

<div class="absolute z-1 grid w-full h-full pointer-events-none text-white">
  {#if global.world}
    {#if global.localPlayer?.alive}
      <div class="absolute m-4 px-4 py-2 bg-black/40 self-end">
        <span class="font-bold text-2xl">Score: {score}</span>
      </div>
    {/if}
    <div class="absolute m-4 bg-black/40 justify-self-end flex flex-col p-4 gap-2">
      <span class="font-bold text-3xl px-8 self-center">Leaderboard</span>
      {#each topPlayers as topPlayer, i}
        <span class="text-xl font-semibold" class:text-red-300={topPlayer === global.localPlayer}>{i + 1}. {topPlayer.name}</span>
      {/each}
    </div>
  {/if}
  <div class="absolute m-4 bg-black/40 justify-self-end self-end flex p-4 gap-2">
    <button class="pointer-events-auto cursor-pointer" onclick={() => global.sfx.muted = !global.sfx.muted}>
      {#if global.sfx.muted}
        <Icon.VolumeX />
      {:else}
        <Icon.Volume2 />
      {/if}
    </button>
  </div>
  <div class="absolute m-4 bg-black/40 flex p-4 gap-2">
    <span class="font-bold">Zoom: {(global.renderer?.camera.zoom ?? 1).toFixed(2)}x</span>
  </div>
</div>
