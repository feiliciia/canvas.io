<script lang="ts">
  import { onMount } from "svelte";
  import { Game, Player, Renderer } from "../game";
  import { clamp, randomColor, textureColor } from "../util";

  // //welcome, ernest!!!😈                                                                             enjoy.
  // import { onMount } from "svelte";
  // const colors: string[] = [
  //   "#FF5733", // bright orange-red🚗🚗🚗🚗🚗
  //   "#33FF57", // neon green
  //   "#3357FF", // vivid blue
  //   "#F1C40F", // bright yellow
  //   "#9B59B6", // purple
  //   "#E67E22", // orange
  //   "#1ABC9C", // teal
  //   "#E84393", // pink
  //   "#2ECC71", // fresh green
  //   "#3498DB", // sky blue
  // ];

  // //creating😉 a🤞 constant🤓!😊
  // const MAP_SIZE = 5000;
  // const MAX_SPEED: number = 0.3;

  // //alias - alternative for a name???
  // type Context = CanvasRenderingContext2D;

  // //interface for methods
  // interface Drawable {
  //   draw(ctx: Context): void;
  // }

  // class Camera { //📷
  //   x: number; //🔢
  //   y: number; //🔢

  //   constructor(x: number, y: number) { //🚧
  //     this.x = x; //❌
  //     this.y = y; //😦
  //   }

  //   //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
  //   calculatePosition(player: Player) {
  //     const averageX = player.blobs.reduce((accumulator, blob) => accumulator + blob.x, 0) / player.blobs.length; //adding to the 0 the blob.x and so on, hi ernest
  //     const averageY = player.blobs.reduce((accumulator, blob) => accumulator + blob.y, 0) / player.blobs.length; //for y, same

  //     this.x = averageX;
  //     this.y = averageY;
  //   }
  // }

  // const camera = $state(new Camera(0, 0));

  // class Blob implements Drawable {
  //   x: number;
  //   y: number;
  //   radius: number;
  //   color: string;
  //   speed: number;
  //   //no name now because its buged womp womp, ernest be very sad
  //   name?: string; //? kinda mostly the same as | undefined

  //   constructor(x: number, y: number, radius: number, color: string, speed: number, name?: string) {
  //     this.x = x;
  //     this.y = y;
  //     this.radius = radius;
  //     this.color = color;
  //     this.speed = speed;
  //     this.name = name;
  //   }

  //   static random(): Blob {
  //     return new Blob(
  //       Math.random() * MAP_SIZE - MAP_SIZE / 2,
  //       Math.random() * MAP_SIZE - MAP_SIZE / 2,
  //       3 + Math.random() * 15,
  //       randomColor(),
  //       0.2,
  //     );
  //   }

  //   draw(ctx: Context) {
  //     const drawX = this.x - camera.x + width / 2;
  //     const drawY = this.y - camera.y + height / 2;

  //     ctx.fillStyle = this.color;
  //     ctx.beginPath();
  //     ctx.moveTo(drawX, drawY);
  //     //right half: ctx.arc(drawX, drawY, this.radius, Math.PI / 2, 1.5 * Math.PI);
  //     //left half: ctx.arc(drawX, drawY, this.radius, 1.5 * Math.PI, 0.5 * Math.PI);
  //     ctx.arc(drawX, drawY, this.radius, 0, 2 * Math.PI);
  //     ctx.fill();
  //     ctx.closePath();
  //   }
  // }

  // class Grid implements Drawable {
  //   size: number = 20;

  //   constructor(size: number) {
  //     this.size = size;
  //   }

  //   draw(ctx: Context): void {
  //     ctx.lineWidth = 0.5;
  //     ctx.strokeStyle = "#CFD7DA";
  //     ctx.beginPath();

  //     const offsetX = camera.x % this.size;
  //     for (let x = 0; x < width; x += this.size) {
  //       ctx.moveTo(-offsetX + x, 0);
  //       ctx.lineTo(-offsetX + x, height);
  //     }

  //     const offsetY = camera.y % this.size;
  //     for (let y = 0; y < height; y += this.size) {
  //       ctx.moveTo(0, -offsetY + y);
  //       ctx.lineTo(width, -offsetY + y);
  //     }

  //     ctx.stroke();
  //     ctx.closePath();
  //   }
  // }

  // //😂😂😂😂😂
  // class Player implements Drawable {
  //   blobs: Blob[];
  //   color: string;
  //   name: string;

  //   constructor(color: string, name: string) {
  //     const blob = Blob.random();
  //     const blob2 = Blob.random();
  //     blob.color = color;
  //     blob.name = name;
  //     blob.radius = 20;

  //     blob2.color = color;
  //     blob2.name = name;
  //     blob2.radius = 40;

  //     this.blobs = [blob, blob2];
  //     this.color = color;
  //     this.name = name;
  //   }

  //   draw(ctx: Context) {
  //     for (const blob of this.blobs) {
  //       blob.draw(ctx);
  //     }

  //     // ctx.fillStyle = "#ffffff";
  //     // ctx.strokeStyle = "black";
  //     // ctx.font = "30px Comic Sans MS";
  //     // ctx.textAlign = "center";
  //     // ctx.textBaseline = "middle";
  //     // ctx.fillText(this.name, width / 2, height / 2);
  //     // ctx.strokeText(this.name, width / 2, height / 2);
  //   }
  // }

  // //😂😂😂😂hi, ernest, you are welcomed again!
  // let canvas: HTMLCanvasElement | undefined = $state();
  // let context: CanvasRenderingContext2D | undefined = $state();
  // let width = $state(0);
  // let height = $state(0);
  // let x = $state(0);
  // let y = $state(0);
  // let delta = $state(0);
  // let limit = $derived(Math.min(width, height));
  // let timeLast = 0;

  // const grid: Grid = new Grid(20);
  // const player: Player = $state(new Player(randomColor(), "ernest, hi"));

  // //_ - this weird thing is default value for the thing i need no care about
  // const foods: Blob[] = Array.from({ length: 2000 }, (_, i) => {
  //   return Blob.random();
  // });

  // onMount(() => {
  //   resize();
  //   context = canvas!.getContext("2d")!;
  //   requestAnimationFrame(frame);
  // });

  // //drawing there everything!!!!!!!!!!😂😂😂😂😂😂😂😂😂😂😂
  // // logic first, then draw!!!!!!!!!!!!!!!! 🐍🐍
  // function frame(time: number) {
  //   requestAnimationFrame(frame);

  //   const ctx = context!;
  //   //delta - time spent since the last frame was rendered
  //   delta = time - timeLast;
  //   timeLast = time;

  //   //mouse staff here!!!!!!! NO 0.1 ANYMORE JUST PAIN AND TEARS| hi, ernest!😈
  //   // player.x += clamp(x / limit, -MAX_SPEED, MAX_SPEED) * delta * player.speed;
  //   // player.y += clamp(y / limit, -MAX_SPEED, MAX_SPEED) * delta * player.speed;
  //   for (const playerBlob of player.blobs) {
  //     // const relativeBlobX = playerBlob.x - camera.x + x;
  //     // const relativeBlobY = playerBlob.y - camera.y + y;
  //     const relativeBlobX = x;
  //     const relativeBlobY = y;

  //     const distanceMax = 0.25 * limit;
  //     const distanceFromCenter = Math.hypot(relativeBlobX, relativeBlobY);
  //     const distanceToMaxRatio = distanceMax / Math.max(distanceFromCenter, 0.00001);
  //     const distance = clamp(distanceFromCenter, 0, distanceMax);

  //     const normX = relativeBlobX * distanceToMaxRatio * distance / (distanceMax * distanceMax);
  //     const normY = relativeBlobY * distanceToMaxRatio * distance / (distanceMax * distanceMax);

  //     //speed gets down when its bigger size
  //     playerBlob.speed = 20 / playerBlob.radius;
  //     console.log(playerBlob.speed);

  //     playerBlob.x += normX * delta * playerBlob.speed;
  //     playerBlob.y += normY * delta * playerBlob.speed;

  //     // map borders
  //     playerBlob.x = clamp(playerBlob.x, -MAP_SIZE / 2, MAP_SIZE / 2);
  //     playerBlob.y = clamp(playerBlob.y, -MAP_SIZE / 2, MAP_SIZE / 2);
  //   }

  //   camera.calculatePosition(player);

  //   allBiggerBlobsAreGoingAfterTheSmallerMircoBrosBlobs();

  //   ctx.clearRect(0, 0, width, height);

  //   grid.draw(ctx);

  //   for (const food of foods) {
  //     food.draw(ctx);
  //   }

  //   player.draw(ctx);
  // }

  // function resize() {
  //   width = window.innerWidth;
  //   height = window.innerHeight;
  // }

  // function onmousemove(event: MouseEvent) {
  //   x = event.x - 0.5 * width;
  //   y = event.y - 0.5 * height;
  // }

  // function clamp(value: number, min: number, max: number): number {
  //   return Math.min(Math.max(value, min), max);
  // }

  // function randomColor(): string {
  //   return colors[~~(Math.random() * colors.length)];
  // }

  // // robert was not like 😨😈👿👿😈😈👺👹👹👿👿👹👿🥺hi ernest!!!!you are being rude for not answering:_(🥺
  // function allBiggerBlobsAreGoingAfterTheSmallerMircoBrosBlobs() {
  //   // https://www.w3schools.com/typescript/typescript_tuples.php
  //   const eatenFoods: [Blob, Blob][] = []; //if readonly -- ([])[]

  //   // IGNOREFORNOW: Normally, food in agar.io is equally sized and should not be sorted at all
  //   // food should be drawn first, then draw all the sorted (small -> big) players.
  //   // We keep this for now since food size is random and we don't care about performance.
  //   foods.sort((a, b) => b.radius - a.radius);

  //   for (const playerBlob of player.blobs) {
  //     for (const food of foods) {
  //       // check if the center of a smaller blob is under the bigger blob
  //       const insidePlayerBlob = isPointInCircle(food.x, food.y, playerBlob.x, playerBlob.y, playerBlob.radius);

  //       // check if it's small enough to be eaten
  //       const smallEnough = playerBlob.radius >= food.radius * 1.1;

  //       // we'll remove or replace it later, after we're done iterating through all blobs
  //       if (insidePlayerBlob && smallEnough) {
  //         eatenFoods.push([food, playerBlob]);
  //       }
  //     }
  //   }

  //   // should handle both food and non-food blobs; leave as is for now
  //   for (const [food, playerBlob] of eatenFoods) {
  //     //adding the food to the player
  //     const playerV = Math.pow(playerBlob.radius, 2);
  //     const foodV = Math.pow(food.radius, 2);

  //     playerBlob.radius = Math.sqrt(playerV + foodV);

  //     //new food!
  //     Object.assign(food, Blob.random());
  //   }
  // }

  // function isPointInCircle(px: number, py: number, cx: number, cy: number, r: number): boolean {
  //   const dx = px - cx;
  //   const dy = py - cy;
  //   const distanceSquared = dx * dx + dy * dy;
  //   return distanceSquared <= r * r;
  // }

  let canvas: HTMLCanvasElement | undefined = $state();
  let game: Game | undefined = undefined;

  let width = $state(0);
  let height = $state(0);
  let limit = $derived(Math.min(width, height));

  function onmousemove(event: MouseEvent) {
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

  let last = 0;

  function frame(time: number) {
    requestAnimationFrame(frame);

    const delta = time - last;
    last = time;

    game!.process(delta);
    game!.world.draw(game!.renderer);
  }

  onMount(() => {
    // initialize the renderer
    const context = canvas!.getContext("2d")!;
    const renderer = new Renderer(context, width, height);

    // resize the renderer whenever canvas resizes
    canvas!.onresize = () => {
      renderer!.width = canvas!.width;
      renderer!.height = canvas!.height;
    };

    // TODO: in the future, load the game from server
    const localPlayer = new Player(0, 0, 2000, textureColor(randomColor()), "Peter");
    game = new Game(renderer, localPlayer);

    requestAnimationFrame(frame);
  });
</script>

<svelte:window {onmousemove}></svelte:window>

<svelte:head>
  <title>lisa.io</title>
</svelte:head>

<div class="absolute z-1 p-2 flex flex-col"></div>

<canvas
  bind:this={canvas}
  bind:clientWidth={width}
  bind:clientHeight={height}
  {width}
  {height}
  class="absolute w-screen h-screen bg-[#F2FBFF]"
></canvas>
