<script lang="ts">
  import type { Game } from "../game";

  type Props = {
    game: Game;
  };

  let { game }: Props = $props();
</script>

<div class="absolute z-1 p-2 flex flex-col">
  <span>{game.id}</span>
  <span>{game.tickrate} TPS</span>
</div>
