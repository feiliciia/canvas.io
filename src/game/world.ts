import type { Drawable } from "./common.ts";
import { Renderer } from "./renderer.ts";
import { Blob } from "./blob.ts";
import { Player } from "./player.ts";

export class World implements Drawable {
  players: Player[];
  size: number = 20;
  foods: Blob[];

  constructor(size: number) {
    this.players = [];
    this.size = size;
    //_ - this weird thing is default value for the thing i need no care about
    this.foods = Array.from({ length: 500 }, () => {
      return Blob.random();
    });
  }

  draw(renderer: Renderer): void {
    const ctx = renderer.context!;

    ctx.clearRect(0, 0, renderer.width, renderer.height);

    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "#CFD7DA";
    ctx.beginPath();

    const offsetX = renderer.camera.x % this.size;
    for (let x = 0; x < renderer.width; x += this.size) {
      ctx.moveTo(-offsetX + x, 0);
      ctx.lineTo(-offsetX + x, renderer.height);
    }

    const offsetY = renderer.camera.y % this.size;
    for (let y = 0; y < renderer.height; y += this.size) {
      ctx.moveTo(0, -offsetY + y);
      ctx.lineTo(renderer.width, -offsetY + y);
    }

    ctx.stroke();
    ctx.closePath();

    for (const food of this.foods) {
      food.draw(renderer);
    }

    for (const player of this.players) {
      player.collision();
      player.draw(renderer);
    }
  }

  cannibalism() {
    // https://www.w3schools.com/typescript/typescript_tuples.php
    const eatenFoods: [Blob, Blob][] = []; //if readonly -- ([])[]

    // IGNOREFORNOW: Normally, food in agar.io is equally sized and should not be sorted at all
    // food should be drawn first, then draw all the sorted (small -> big) players.
    // We keep this for now since food size is random and we don't care about performance.
    this.foods.sort((a, b) => b.radius - a.radius);

    const allBlobs = this.players.flatMap((player) => player.blobs);

    for (const blob of allBlobs) {
      for (const food of this.foods) {
        // check if the center of a smaller blob is under the bigger blob
        const insidePlayerBlob = blob.containsPoint(food.x, food.y);

        // check if it's small enough to be eaten
        const smallEnough = blob.radius >= food.radius * 1.1;

        // we'll remove or replace it later, after we're done iterating through all blobs
        if (insidePlayerBlob && smallEnough) {
          eatenFoods.push([food, blob]);
        }
      }
    }

    // should handle both food and non-food blobs; leave as is for now
    for (const [food, playerBlob] of eatenFoods) {
      //adding the food to the player
      const playerV = Math.pow(playerBlob.radius, 2);
      const foodV = Math.pow(food.radius, 2);

      playerBlob.radius = Math.sqrt(playerV + foodV);

      //new food!
      Object.assign(food, Blob.random());
    }
  }
}
