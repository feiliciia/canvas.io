<script lang="ts">
  import * as Icon from "lucide-svelte";
  import type { Player } from "$lib/world/player";
  import { game } from "../game.svelte.ts";

  let score = $derived.by(() => {
    const totalMass = game.world?.localPlayer?.cells.reduce((acc, cell) => acc + cell.mass, 0) ?? 0;
    return ~~Math.pow(totalMass, 0.6);
  });

  let topPlayers: Player[] = $derived.by(() => {
    if (!game.world) {
      return [];
    }

    return game.world.players.toSorted((a, b) => {
      return a.cells.reduce((acc, cell) => acc + cell.mass, 0) - b.cells.reduce((acc, cell) => acc + cell.mass, 0);
    });
  });
</script>

<div class="absolute z-1 grid w-full h-full pointer-events-none text-white">
  {#if game.world}
    {#if game.world.localPlayer}
      <div class="absolute m-4 px-4 py-2 bg-black/40 self-end">
        <span class="font-bold text-2xl">Score: {score}</span>
      </div>
    {/if}
    <div class="absolute m-4 bg-black/40 justify-self-end flex flex-col p-4 gap-2">
      <span class="font-bold text-3xl px-8 self-center">Leaderboard</span>
      {#each topPlayers as topPlayer, i}
        <span class="text-xl font-semibold" class:text-red-300={topPlayer === game.world.localPlayer}>{i + 1}. {topPlayer.name}</span>
      {/each}
    </div>
  {/if}
  <div class="absolute m-4 justify-self-end self-end flex gap-2">
    <button class="p-4 bg-black/40 pointer-events-auto cursor-pointer" onclick={() => game.settings.muted = !game.settings.muted}>
      {#if game.settings.muted}
        <Icon.VolumeX />
      {:else}
        <Icon.Volume2 />
      {/if}
    </button>
  </div>
</div>
