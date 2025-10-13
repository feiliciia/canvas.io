<script lang="ts">
  import { Player } from "../game/player";
  import type { Global } from "./Scene.svelte";

  type Props = {
    global: Global;
  };

  let { global }: Props = $props();

  let score = $derived.by(() => {
    const totalMass = global.localPlayer?.cells.reduce((acc, cell) => acc + cell.mass, 0) ?? 0;
    const radius = Math.sqrt(totalMass / Math.PI);
    return ~~radius;
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
      <div class="absolute m-4 px-2 py-1 rounded-lg bg-black/40 self-end">
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
</div>
