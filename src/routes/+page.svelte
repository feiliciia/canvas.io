<script lang="ts">
  import { onMount } from "svelte";
  import { MAP_SIZE } from "../game/consts";
  import { Player } from "../game/player";
  import { World } from "../game/world";
  import { clamp, randomColor } from "../game/common";
  import { Renderer } from "../game/renderer";

  const renderer = new Renderer();
  let width = $state(0);
  let height = $state(0);
  let x = $state(0);
  let y = $state(0);
  let delta = $state(0);
  let timeLast = 0;

  const world: World = new World(20);
  const player: Player = $state(new Player(randomColor(), "ernest, hi"));
  world.players.push(player);

  $effect(() => {
    renderer.width = width;
    renderer.height = height;
  });

  onMount(() => {
    renderer.context = renderer.canvas!.getContext("2d")!;
    requestAnimationFrame(frame);
  });

  // window.addEventListener("keydown", (e) => {
  //   if (e.code === "Space") {
  //     try {
  //       player.split();
  //     } catch (err) {
  //       console.error("Error during split:", err);
  //     }
  //   }
  // });

  function frame(time: number) {
    requestAnimationFrame(frame);

    //delta - time spent since the last frame was rendered
    delta = time - timeLast;
    timeLast = time;

    for (const blob of player.blobs) {
      const minDist = blob.radius + 10;

      blob.calculateVelocity(renderer, x, y);

      //speed gets down when its bigger size
      blob.speed = 20 / blob.radius;
      blob.x += blob.vx * delta * blob.speed;
      blob.y += blob.vy * delta * blob.speed;

      // map borders
      blob.x = clamp(blob.x, -MAP_SIZE / 2, MAP_SIZE / 2);
      blob.y = clamp(blob.y, -MAP_SIZE / 2, MAP_SIZE / 2);

      // blob.x = clamp(blob.x, -minDist, minDist);
      // blob.y = clamp(blob.y, -minDist, minDist);
      // export function clamp(value: number, min: number, max: number): number {
      //   return Math.min(Math.max(value, min), max);
      // }
    }

    world.cannibalism();

    renderer.camera.calculatePosition(player);

    world.draw(renderer);
  }

  function keyDown(e: KeyboardEvent) {
    if (e.key == " ") {
      player.split();
    }
  }

  function onmousemove(event: MouseEvent) {
    x = event.x - 0.5 * renderer.width;
    y = event.y - 0.5 * renderer.height;
  }
</script>

<svelte:window {onmousemove} onkeydown={keyDown}></svelte:window>

<div class="absolute z-1">
  {x},
  {y},
  {delta}
</div>

<canvas
  bind:this={renderer.canvas}
  bind:clientWidth={width}
  bind:clientHeight={height}
  {width}
  {height}
  class="absolute w-screen h-screen bg-[#F2FBFF]"
></canvas>
