<script lang="ts">
  //welcome, ernest!!!😈                                                                             enjoy.
  import { onMount } from "svelte";
  const colors: string[] = [
    "#FF5733", // bright orange-red🚗🚗🚗🚗🚗
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

  //creating😉 a🤞 constant🤓!😊
  const MAP_SIZE = 5000;
  const MAX_SPEED: number = 0.3;

  //alias - alternative for a name???
  type Context = CanvasRenderingContext2D;

  //interface for methods
  interface Drawable {
    draw(ctx: Context): void;
  }

  class Camera { //📷
    x: number; //🔢
    y: number; //🔢

    constructor(x: number, y: number) { //🚧
      this.x = x; //❌
      this.y = y; //😦
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

    static random(): Blob {
      return new Blob(
        Math.random() * MAP_SIZE - MAP_SIZE / 2,
        Math.random() * MAP_SIZE - MAP_SIZE / 2,
        3 + Math.random() * 30,
        randomColor(),
      );
    }

    draw(ctx: Context) {
      const drawX = this.x - camera.x + width / 2;
      const drawY = this.y - camera.y + height / 2;

      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(drawX, drawY);
      //right half: ctx.arc(drawX, drawY, this.radius, Math.PI / 2, 1.5 * Math.PI);
      //left half: ctx.arc(drawX, drawY, this.radius, 1.5 * Math.PI, 0.5 * Math.PI);
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
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = "#CFD7DA";
      ctx.beginPath();

      const offsetX = camera.x % this.size;
      for (let x = 0; x < width; x += this.size) {
        ctx.moveTo(-offsetX + x, 0);
        ctx.lineTo(-offsetX + x, height);
      }

      const offsetY = camera.y % this.size;
      for (let y = 0; y < height; y += this.size) {
        ctx.moveTo(0, -offsetY + y);
        ctx.lineTo(width, -offsetY + y);
      }

      ctx.stroke();
      ctx.closePath();
    }
  }

  //😂😂😂😂😂
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
      ctx.font = "30px Comic Sans MS";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.name, width / 2, height / 2);
      ctx.strokeText(this.name, width / 2, height / 2);
    }
  }

  //😂😂😂😂
  let canvas: HTMLCanvasElement | undefined = $state();
  let context: CanvasRenderingContext2D | undefined = $state();
  let width = $state(0);
  let height = $state(0);
  let x = $state(0);
  let y = $state(0);
  let delta = $state(0);
  let limit = $derived(Math.min(width, height));
  let timeLast = 0;

  const grid: Grid = new Grid(20);
  const player: Player = $state(new Player(0, 0, 16, randomColor(), 0.2, "Hello"));

  //_ - this weird thing is default value for the thing i need no care about
  const foods: Blob[] = Array.from({ length: 2000 }, (_, i) => {
    return Blob.random();
  });

  onMount(() => {
    resize();
    context = canvas!.getContext("2d")!;
    requestAnimationFrame(frame);
  });

  //drawing there everything!!!!!!!!!!😂😂😂😂😂😂😂😂😂😂😂
  // logic first, then draw!!!!!!!!!!!!!!!! 🐍🐍
  function frame(time: number) {
    requestAnimationFrame(frame);

    const ctx = context!;
    //delta - time spent since the last frame was rendered
    delta = time - timeLast;
    timeLast = time;

    //mouse staff here!!!!!!! NO 0.1 ANYMORE JUST PAIN AND TEARS| hi, ernest!😈
    // player.x += clamp(x / limit, -MAX_SPEED, MAX_SPEED) * delta * player.speed;
    // player.y += clamp(y / limit, -MAX_SPEED, MAX_SPEED) * delta * player.speed;

    const distanceMax = 0.25 * limit;
    const distanceFromCenter = Math.hypot(x, y);
    const distanceToMaxRatio = distanceMax / Math.max(distanceFromCenter, 0.00001);
    const distance = clamp(distanceFromCenter, 0, distanceMax);

    const normX = x * distanceToMaxRatio * distance / (distanceMax * distanceMax);
    const normY = y * distanceToMaxRatio * distance / (distanceMax * distanceMax);

    player.x += normX * delta * player.speed;
    player.y += normY * delta * player.speed;

    // map borders
    player.x = clamp(player.x, -MAP_SIZE / 2, MAP_SIZE / 2);
    player.y = clamp(player.y, -MAP_SIZE / 2, MAP_SIZE / 2);

    camera.x = player.x;
    camera.y = player.y;

    allBiggerBlobsAreGoingAfterTheSmallerMircoBrosBlobs();

    ctx.clearRect(0, 0, width, height);

    grid.draw(ctx);

    for (const food of foods) {
      food.draw(ctx);
    }

    player.draw(ctx);
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
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

  // robert was not like 😨😈👿👿😈😈👺👹👹👿👿👹👿🥺hi ernest!!!!you are being rude for not answering:_(🥺
  function allBiggerBlobsAreGoingAfterTheSmallerMircoBrosBlobs() {
    // https://www.w3schools.com/typescript/typescript_tuples.php
    const eatenFoods: [Blob, Blob][] = []; //if readonly -- ([])[]

    // IGNOREFORNOW: Normally, food in agar.io is equally sized and should not be sorted at all
    // food should be drawn first, then draw all the sorted (small -> big) players.
    // We keep this for now since food size is random and we don't care about performance.
    foods.sort((a, b) => b.radius - a.radius);

    for (let i = 0; i < foods.length; i++) {
      const food = foods[i];

      // check if the center of a smaller blob is under the bigger blob
      const insidePlayerBlob = isPointInCircle(food.x, food.y, player.x, player.y, player.radius);

      // check if it's small enough to be eaten
      const smallEnough = player.radius >= food.radius * 1.1;

      // we'll remove or replace it later, after we're done iterating through all blobs
      if (insidePlayerBlob && smallEnough) {
        eatenFoods.push([food, player]);
      }
    }

    // should handle both food and non-food blobs; leave as is for now
    for (const [food, player] of eatenFoods) {
      //adding the food to the player
      const playerV = Math.pow(player.radius, 2);
      const foodV = Math.pow(food.radius, 2);

      player.radius = Math.sqrt(playerV + foodV);

      //new food!
      Object.assign(food, Blob.random());
    }
  }

  function isPointInCircle(px: number, py: number, cx: number, cy: number, r: number): boolean {
    const dx = px - cx;
    const dy = py - cy;
    const distanceSquared = dx * dx + dy * dy;
    return distanceSquared <= r * r;
  }
</script>

<svelte:window onresize={() => resize()} {onmousemove}></svelte:window>

<div class="absolute z-1">
  {x},
  {y},
  {delta}
</div>

<canvas bind:this={canvas} {width} {height} class="absolute w-screen h-screen bg-[#F2FBFF]"></canvas>
