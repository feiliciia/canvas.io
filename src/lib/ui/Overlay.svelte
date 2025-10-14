<script lang="ts">
  import * as Icon from "lucide-svelte";
  import type { Player } from "$lib/world/player";
  import type { World } from "$lib/world/world";
  import { game, GameEvent } from "../game.svelte.ts";
  import { fade, fly } from "svelte/transition";
  import { derived, writable } from "svelte/store";

  type Event =
    & { id: number }
    & (
      | { type: GameEvent.Join; player: Player }
      | { type: GameEvent.Kill; killer: Player; killed: Player }
    );

  let world = writable<World | undefined>();
  let events: Event[] = $state([]);

  function pushEvent(event: Event) {
    events.push(event);

    setTimeout(() => {
      const index = events.indexOf(event);
      if (index !== -1) {
        events.splice(index, 1);
      }
    }, 5000);
  }

  game.events.on(GameEvent.Join, (player: Player) => {
    const event: Event = $state({
      id: Math.random(),
      type: GameEvent.Join,
      player,
    });

    pushEvent(event);
  });

  game.events.on(GameEvent.Kill, (killer: Player, killed: Player) => {
    const event: Event = $state({
      id: Math.random(),
      type: GameEvent.Kill,
      killer,
      killed,
    });

    pushEvent(event);
  });

  const score = derived(world, (world) => {
    const totalMass = world?.localPlayer?.cells.reduce((acc, cell) => acc + cell.mass, 0) ?? 0;
    return ~~Math.pow(totalMass, 0.6);
  });

  const players = derived(world, (world) => {
    return world?.players
      .filter((player) => player.alive)
      .toSorted((a, b) => {
        return b.cells.reduce((acc, cell) => acc + cell.mass, 0) - a.cells.reduce((acc, cell) => acc + cell.mass, 0);
      }).slice(0, 10) ?? [];
  });

  export function update(updated: World) {
    world.set(updated);
  }
</script>

{#snippet eventJoin(player: Player)}
  <span class:text-red-300={player === $world?.localPlayer}>{player.name}</span>
  <span class="font-normal">joined</span>
{/snippet}

{#snippet eventKill(killer: Player, killed: Player)}
  <span class:text-red-300={killer === $world?.localPlayer}>{killer.name}</span>
  <span class="font-normal">killed</span>
  <span class:text-red-300={killed === $world?.localPlayer}>{killed.name}</span>
{/snippet}

<div class="font-semibold text-lg absolute z-1 grid w-full h-full overflow-hidden pointer-events-none text-white">
  {#if $world}
    {#if $world?.localPlayer}
      <div class="absolute m-4 px-4 py-2 bg-black/40 self-end">
        <span class="text-2xl">Score: {$score}</span>
      </div>
    {/if}
    <div class="absolute m-4 bg-black/40 justify-self-end flex flex-col p-4 gap-2">
      <span class="font-bold text-3xl px-8 self-center">Leaderboard</span>
      <div class="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-xl font-semibold">
        {#each $players as player, i}
          {@const local = player === $world?.localPlayer}
          <span class="w-5 text-right" class:text-red-300={local}>{i + 1}.</span>
          <span class:text-red-300={local}>{player.name}</span>
        {/each}
      </div>
    </div>
    <div class="absolute m-4 justify-self-end self-end flex gap-2">
      <button class="p-4 bg-black/40 pointer-events-auto cursor-pointer" onclick={() => game.settings.muted = !game.settings.muted}>
        {#if game.settings.muted}
          <Icon.VolumeX />
        {:else}
          <Icon.Volume2 />
        {/if}
      </button>
    </div>
  {/if}
  <div class="absolute m-4 flex flex-col-reverse gap-2">
    {#each events.slice(-8) as event (event.id)}
      <span
        in:fly={{ x: -80, duration: 200 }}
        out:fade={{ duration: 1000 }}
        class="bg-black/40 p-1 px-2 w-fit text-base"
      >
        {#if event.type === GameEvent.Join}
          {@render eventJoin(event.player)}
        {:else if event.type === GameEvent.Kill}
          {@render eventKill(event.killer, event.killed)}
        {/if}
      </span>
    {/each}
  </div>
</div>
