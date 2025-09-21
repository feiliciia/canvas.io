<script lang="ts">
  import { onMount } from "svelte";

  type Player = { x: number; y: number; size: number };
  type Food = { x: number; y: number; radius: number };

  let canvas: HTMLCanvasElement | undefined = $state();
  let context: CanvasRenderingContext2D | undefined = $state();
  let width = $state(0);
  let height = $state(0);
  let x = $state(0);
  let y = $state(0);
  let cx = $derived(width * 0.5);
  let cy = $derived(height * 0.5);

  const player: Player = $state({ x: 0, y: 0, size: 60 });
  const foods: Food[] = Array.from({ length: 500 }, (_, i) => {
    return {
      x: Math.random() * 5000,
      y: Math.random() * 5000,
      radius: 10 + Math.random() * 15,
    };
  });

  onMount(() => {
    resize();
    context = canvas!.getContext("2d")!;
    requestAnimationFrame(frame);
  });

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
  }

  //drawing there everything!!!!!!!!!!
  function frame(time: number) {
    requestAnimationFrame(frame);

    const ctx = context!;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "#00FF00";

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, player.size, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();

    //mouse staff here!!!!!!! NO 0.1 ANYMORE JUST PAIN AND TEARS
    player.x -= x / 100;
    player.y -= y / 100;

    for (const food of foods) {
      const displayedX = food.x + player.x;
      const displayedY = food.y + player.y;

      ctx.fillStyle = "#00FF00";
      ctx.beginPath();
      ctx.moveTo(displayedX, displayedY);
      ctx.arc(displayedX, displayedY, food.radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();
    }
  }

  function onmousemove(event: MouseEvent) {
    x = event.x - 0.5 * width;
    y = event.y - 0.5 * height;
  }
</script>
<svelte:window onresize={() => resize()} {onmousemove}></svelte:window>
<div class="absolute z-1">
  {x},
  {y}
</div>
<canvas bind:this={canvas} {width} {height} class="absolute w-screen h-screen"></canvas>
