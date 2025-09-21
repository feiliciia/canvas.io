<script lang="ts">
  import { onMount } from "svelte";
  const colors: string[] = [
    "#FF5733", // bright orange-red
    "#33FF57", // neon green
    "#3357FF", // vivid blue
    "#F1C40F", // bright yellow
    "#9B59B6", // purple
    "#E67E22", // orange
    "#1ABC9C", // teal
    "#E84393", // pink
    "#2ECC71", // fresh green
    "#3498DB", // sky blue
  ];

  const MAP_SIZE = 5000;

  //alias - alternative for a name???
  type Context = CanvasRenderingContext2D;

  //type Player = { x: number; y: number; size: number; speed: number };
  //interface for methods
  interface Drawable {
    draw(ctx: Context): void;
  }

  class Camera {
    x: number;
    y: number;

    constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
    }
  }

  const camera = $state(new Camera(0, 0));

  class Blob implements Drawable {
    x: number;
    y: number;
    radius: number;
    color: string;

    constructor(x: number, y: number, radius: number, color: string) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.color = color;
    }

    draw(ctx: Context) {
      const drawX = this.x - camera.x + width / 2;
      const drawY = this.y - camera.y + height / 2;

      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(drawX, drawY);
      ctx.arc(drawX, drawY, this.radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();
    }
  }

  class Grid implements Drawable {
    size: number = 20;

    constructor(size: number) {
      this.size = size;
    }

    draw(ctx: Context): void {
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#CFD7DA";
      ctx.beginPath();

      const offsetX = camera.x % this.size;
      for (let x = 0; x < width; x += this.size) {
        //ctx.moveTo(x, 0);
        ctx.moveTo(-offsetX + x, 0);
        ctx.lineTo(-offsetX + x, height);
        ctx.stroke();
      }

      const offsetY = camera.y % this.size;
      for (let y = 0; y < height; y += this.size) {
        ctx.moveTo(0, -offsetY + y);
        ctx.lineTo(width, -offsetY + y);
        ctx.stroke();
      }

      ctx.closePath();
    }
  }

  class Player extends Blob {
    speed: number;
    name: string;

    constructor(x: number, y: number, radius: number, color: string, speed: number, name: string) {
      super(x, y, radius, color);
      this.speed = speed;
      this.name = name;
    }

    draw(ctx: Context) {
      super.draw(ctx);
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "black";
      ctx.font = "60px Comic Sans MS";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.name, width / 2, height / 2);
      ctx.strokeText(this.name, width / 2, height / 2);
    }
  }

  let canvas: HTMLCanvasElement | undefined = $state();
  let context: CanvasRenderingContext2D | undefined = $state();
  let width = $state(0);
  let height = $state(0);
  let x = $state(0);
  let y = $state(0);
  let limit = $derived(Math.min(width, height));
  let delta = $state(0);
  const MAX_SPEED: number = 0.3;
  let timeLast = 0;

  const grid: Grid = new Grid(20);
  const player: Player = $state(new Player(0, 0, 60, randomColor(), 1, "😂😂😂hhahahahahahah!!!!!!!!!!!!!!!😂😂😂"));
  //_ - this weird thing is default value for the thing i need no care about
  const foods: Blob[] = Array.from({ length: 500 }, (_, i) => {
    return new Blob(
      Math.random() * MAP_SIZE - MAP_SIZE / 2,
      Math.random() * MAP_SIZE - MAP_SIZE / 2,
      3 + Math.random() * 3,
      randomColor(),
    );
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

    //delta - time spent since the last frame was rendered
    delta = time - timeLast;
    timeLast = time;

    const ctx = context!;
    ctx.clearRect(0, 0, width, height);

    //mouse staff here!!!!!!! NO 0.1 ANYMORE JUST PAIN AND TEARS
    player.x += clamp(x / limit, -MAX_SPEED, MAX_SPEED) * delta * player.speed;
    player.y += clamp(y / limit, -MAX_SPEED, MAX_SPEED) * delta * player.speed;

    player.x = clamp(player.x, -MAP_SIZE / 2, MAP_SIZE / 2);
    player.y = clamp(player.y, -MAP_SIZE / 2, MAP_SIZE / 2);

    camera.x = player.x;
    camera.y = player.y;

    grid.draw(ctx);

    for (const food of foods) {
      food.draw(ctx);
    }

    player.draw(ctx);
  }

  function onmousemove(event: MouseEvent) {
    x = event.x - 0.5 * width;
    y = event.y - 0.5 * height;
  }

  function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  function randomColor(): string {
    return colors[~~(Math.random() * colors.length)];
  }
</script>
<svelte:window onresize={() => resize()} {onmousemove}></svelte:window>
<div class="absolute z-1">
  {x},
  {y},
  {delta}
</div>

<canvas bind:this={canvas} {width} {height} class="absolute w-screen h-screen"></canvas>
