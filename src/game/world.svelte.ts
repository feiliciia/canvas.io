import { clamp, type Drawable, randomColor, textureColor } from "./common.ts";
import { Player } from "./player.ts";
import { Food } from "./food.ts";
import { Renderer } from "./renderer.ts";

export class World implements Drawable {
  size: number;
  id: string;

  foods: Food[];
  players: Player[];

  constructor(size: number, id: string, foods: Food[], players: Player[]) {
    this.size = size;
    this.id = id;
    this.foods = foods;
    this.players = $state(players);
  }

  process(renderer: Renderer, delta: number) {
    for (const cell of this.players.flatMap((player) => player.cells)) {
      for (let i = 0; i < this.foods.length; i += 1) {
        const food = this.foods[i];
        if (cell.canEat(food)) {
          cell.mass += food.mass;
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

        if (cellA.canEat(cellB)) {
          cellA.mass += cellB.mass;
          cellB.owner?.removeCell(cellB);
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

    renderer.camera.move(1 / delta);
  }

  draw(renderer: Renderer): void {
    const { width, height, context, camera } = renderer;

    context.clearRect(0, 0, renderer.width, renderer.height);

    context.lineWidth = 0.5;
    context.strokeStyle = "#CFD7DA";
    context.beginPath();

    const offsetX = camera.x % 32;
    for (let x = 0; x < width; x += 32) {
      context.moveTo(-offsetX + x, 0);
      context.lineTo(-offsetX + x, height);
    }

    const offsetY = camera.y % 32;
    for (let y = 0; y < height; y += 32) {
      context.moveTo(0, -offsetY + y);
      context.lineTo(width, -offsetY + y);
    }

    context.stroke();
    context.closePath();

    for (const food of this.foods) {
      food.draw(renderer);
    }

    // FIXME: draw in correct z-order
    // smaller blobs (parts) should be drawn first
    for (const player of this.players) {
      for (const part of player.cells) {
        part.draw(renderer);
      }
    }
  }

  // simulate loading the world from a server
  // deno-lint-ignore require-await
  static async loadFromServer(): Promise<World> {
    const size = 10000;
    const foods: Food[] = Array.from({ length: 4096 }, () => Food.random(size));
    const players: Player[] = [];

    return new World(size, "fart", foods, players);
  }

  // deno-lint-ignore require-await
  async spawnPlayer(): Promise<Player> {
    const player = new Player(0, 0, 80000, textureColor(randomColor()), "Peter");
    player.alive = true;
    this.players.push(player);
    return player;
  }
}
