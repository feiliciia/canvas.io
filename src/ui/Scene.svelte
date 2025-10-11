<script lang="ts">
  import { onMount } from "svelte";
  import { Game, Player, Renderer } from "../game";
  import { clamp, randomColor, textureColor } from "../util";

  let canvas: HTMLCanvasElement | undefined = $state();
  let game: Game | undefined = $state();

  let width = $state(0);
  let height = $state(0);
  let limit = $derived(Math.min(width, height));

  export { game, height, width };

  export function onmousemove(event: MouseEvent) {
    if (!game) {
      return;
    }

    const x = event.x - 0.5 * width;
    const y = event.y - 0.5 * height;

    const relativeBlobX = x;
    const relativeBlobY = y;

    const distanceMax = 0.25 * limit;
    const distanceFromCenter = Math.hypot(relativeBlobX, relativeBlobY);
    const distanceToMaxRatio = distanceMax / Math.max(distanceFromCenter, 0.00001);
    const distance = clamp(distanceFromCenter, 0, distanceMax);

    const vx = relativeBlobX * distanceToMaxRatio * distance / (distanceMax * distanceMax);
    const vy = relativeBlobY * distanceToMaxRatio * distance / (distanceMax * distanceMax);

    for (const part of game!.localPlayer.parts) {
      part.vx = vx;
      part.vy = vy;
    }
  }

  onMount(() => {
    // initialize the renderer
    const context = canvas!.getContext("2d")!;
    const renderer = new Renderer(context, width, height);

    // TODO: in the future, load the game from server
    const localPlayer = new Player(0, 0, 2000, textureColor(randomColor()), "Peter");
    game = new Game(renderer, localPlayer);

    let last = 0;

    function frame(time: number) {
      requestAnimationFrame(frame);

      const delta = time - last;
      last = time;

      game!.process(delta);
      game!.world.draw(game!.renderer);
    }

    $effect(() => {
      game!.renderer.width = width;
      game!.renderer.height = height;
    });

    requestAnimationFrame(frame);
  });
</script>

<canvas bind:this={canvas} bind:clientWidth={width} bind:clientHeight={height} {width} {height} class="absolute w-screen h-screen bg-[#F2FBFF]"></canvas>
