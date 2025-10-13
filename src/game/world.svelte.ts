import { clamp, type Drawable, randomColor, textureColor } from "./common.ts";
import { Player } from "./player.svelte.ts";
import { Food } from "./food.ts";
import { Renderer } from "./renderer.ts";
import { Sound } from "./sfx.svelte.ts";
import type { Global } from "./global.svelte.ts";
import { Virus } from "./virus.ts";

export class World implements Drawable {
  size: number;
  id: string;

  foods: Food[];
  viruses: Virus[];
  players: Player[];

  mergeCooldown: number;

  constructor(size: number, id: string, foods: Food[], viruses: Virus[], players: Player[], mergeCooldown: number) {
    this.size = size;
    this.id = id;
    this.foods = foods;
    this.viruses = viruses;
    this.players = $state(players);
    this.mergeCooldown = mergeCooldown;
  }

  process(global: Global, delta: number) {
    const { sfx } = global;
    const renderer = global.renderer!;

    for (const player of this.players) {
      player.collision();
    }

    for (const cell of this.players.flatMap((player) => player.cells)) {
      cell.mergeTimer = Math.max(cell.mergeTimer - delta / 1000, 0);

      for (let i = 0; i < this.foods.length; i += 1) {
        const food = this.foods[i];
        if (cell.canEat(food)) {
          cell.mass += food.mass;
          sfx.play(Sound.Eat, 0.2);
          this.foods[i] = Food.random(this.size);
        }
      }
    }

    const cells = this.players.flatMap((player) => player.cells).toSorted((a, b) => a.mass - b.mass);

    for (const cellA of cells) {
      for (const cellB of cells) {
        if (cellA === cellB) {
          continue;
        }

        if (cellA.owner === cellB.owner) {
          if (cellA.canMerge && cellB.canMerge) {
            if (cellA.canEat(cellB)) {
              cellA.mass += cellB.mass;
              cellB.owner!.removeCell(cellB);
              global.sfx.play(Sound.Merge, 0.6);
            }
          }
        } else {
          if (cellA.canEat(cellB)) {
            cellA.mass += cellB.mass;
            cellB.owner!.removeCell(cellB);
          }
        }
      }
    }

    for (const player of this.players) {
      for (const cell of player.cells) {
        cell.calculateMovement(renderer);

        const speed = Math.exp(-0.3 * Math.log(cell.mass / 50));
        cell.x = clamp(cell.x + (cell.mx + cell.vx) * delta * speed, -(this.size / 2), this.size / 2);
        cell.y = clamp(cell.y + (cell.my + cell.vy) * delta * speed, -(this.size / 2), this.size / 2);

        // constantly decay the extra velocity to 0
        const factor = Math.exp(-3 * (delta / 1000));
        cell.vx *= factor;
        cell.vy *= factor;
      }
    }

    renderer.camera.move(renderer);
  }

  drawGrid(renderer: Renderer, sx: number, sy: number, ex: number, ey: number) {
    const { context, camera } = renderer;

    context.lineWidth = 0.5;
    context.strokeStyle = "#CFD7DA";
    context.beginPath();

    const offsetX = (sx + camera.x) % 32;
    for (let x = sx; x < ex; x += 32) {
      context.moveTo(-offsetX + x, sy);
      context.lineTo(-offsetX + x, ey);
    }

    const offsetY = (sy + camera.y) % 32;
    for (let y = sy; y < ey; y += 32) {
      context.moveTo(sx, -offsetY + y);
      context.lineTo(ex, -offsetY + y);
    }

    context.stroke();
    context.closePath();
  }

  draw(renderer: Renderer): void {
    const { context, camera } = renderer;

    const factor = Math.max(2 / camera.zoom, 1) - 1;
    const hw = renderer.width / 2;
    const hh = renderer.height / 2;

    const sx = -factor * hw;
    const sy = -factor * hh;
    const ex = renderer.width * (1 + factor);
    const ey = renderer.height * (1 + factor);

    context.clearRect(sx, sy, ex, ey);

    this.drawGrid(renderer, sx, sy, ex, ey);

    const foods = this.foods
      .filter((food) => food.isVisible(renderer));

    for (const food of foods) {
      food.draw(renderer);
    }

    const cells = this.players
      .flatMap((player) => player.cells)
      .concat(this.viruses)
      .toSorted((a, b) => a.mass - b.mass)
      .filter((cell) => cell.isVisible(renderer));

    for (const cell of cells) {
      cell.draw(renderer);
    }
  }

  // simulate loading the world from a server
  // deno-lint-ignore require-await
  static async loadFromServer(): Promise<World> {
    const size = 10000;
    const foods: Food[] = Array.from({ length: 4096 }, () => Food.random(size));
    const viruses: Virus[] = Array.from({ length: 128 }, () => Virus.random(size));
    const players: Player[] = [];

    return new World(size, "fart", foods, viruses, players, 10);
  }

  // deno-lint-ignore require-await
  async spawnPlayer(): Promise<Player> {
    const player = new Player(this, 0, 0, 2000, textureColor(randomColor()), "Peter", 16);
    player.alive = true;
    this.players.push(player);
    return player;
  }
}
