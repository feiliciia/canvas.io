<script lang="ts">
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

    //mouse staff here!!!!!!! NO 0.1 ANYMORE JUST PAIN AND TEARS
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

    /*for (let i = 0; i < foods.length; i++) {
      const food = foods[i];

      // food is inside player. yay.
      if (isHalfCircleInside(food.x, food.y, food.radius, player.x, player.y, player.radius)) {
        player.radius += Math.sqrt(food.radius) / Math.PI;
        foods[i] = Blob.random();
      }
    }*/
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

  function allBiggerBlobsAreGoingAfterTheSmallerMircoBrosBlobs() {
    const allBlobs: Blob[] = [player, ...foods];

    for (let i = 0; i < allBlobs.length; i++) {
      const blob1 = allBlobs[i];

      for (let j = 0; j < allBlobs.length; j++) {
        const blob2 = allBlobs[j];

        if (blob1 !== blob2) {
          if (isHalfCircleInside(blob1.x, blob1.y, blob1.radius, blob2.x, blob2.y, blob2.radius)) {
            blob1.radius += Math.sqrt(blob2.radius) / Math.PI;
            //creating a new blob
            foods[j] = Blob.random();
          }
        }
      }
      // food is inside player. yay.
    }
  }

  // chatgpt
  function circleIntersectionArea(
    x1: number,
    y1: number,
    r1: number,
    x2: number,
    y2: number,
    r2: number,
  ): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const d = Math.sqrt(dx * dx + dy * dy);

    if (d >= r1 + r2) return 0;

    if (d <= Math.abs(r1 - r2)) {
      return Math.PI * Math.min(r1, r2) ** 2;
    }

    const alpha = Math.acos((d * d + r1 * r1 - r2 * r2) / (2 * d * r1));
    const beta = Math.acos((d * d + r2 * r2 - r1 * r1) / (2 * d * r2));

    const part1 = r1 * r1 * alpha;
    const part2 = r2 * r2 * beta;
    const part3 = 0.5 * Math.sqrt(
      (-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2),
    );

    return part1 + part2 - part3;
  }

  // chatgpt
  function isHalfCircleInside(
    x1: number,
    y1: number,
    r1: number,
    x2: number,
    y2: number,
    r2: number,
  ): boolean {
    const intersection = circleIntersectionArea(x1, y1, r1, x2, y2, r2);
    const halfArea = 0.5 * Math.PI * r1 * r1;
    return intersection >= halfArea;
  }
</script>

<svelte:window onresize={() => resize()} {onmousemove}></svelte:window>

<div class="absolute z-1">
  {x},
  {y},
  {delta}
</div>

<canvas bind:this={canvas} {width} {height} class="absolute w-screen h-screen bg-[#F2FBFF]"></canvas>
