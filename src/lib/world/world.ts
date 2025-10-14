import type { Renderer } from "../view/renderer.ts";
import type { Camera } from "../view/camera.ts";
import { Player } from "./player.ts";
import { Food } from "./food.ts";
import { Virus } from "./virus.ts";
import { Sound } from "../io/audio.ts";
import { game } from "../game.svelte.ts";
import { clamp } from "../utilities.ts";

export type WorldConfig = {
  id: string;
  size: number;
  mergeCooldown: number;
  maxCellsPerPlayer: number;
};

export interface IDrawable {
  draw(renderer: Renderer, camera: Camera): void;
  visible(camera: Camera): boolean;
}

export class Grid implements IDrawable {
  public readonly size: number;

  public constructor(size: number = 32) {
    this.size = size;
  }

  public draw(renderer: Renderer, camera: Camera): void {
    const context = renderer.context;

    const halfW = camera.width / 2;
    const halfH = camera.height / 2;

    const sx = camera.zoom.get() > 1.0 ? 0 : -halfW * (camera.zoomInverse - 1);
    const sy = camera.zoom.get() > 1.0 ? 0 : -halfH * (camera.zoomInverse - 1);
    const ex = camera.zoom.get() > 1.0 ? camera.width : camera.width * camera.zoomInverse;
    const ey = camera.zoom.get() > 1.0 ? camera.height : camera.height * camera.zoomInverse;

    context.lineWidth = 0.5;
    context.strokeStyle = "#CFD7DA";
    context.beginPath();

    const offsetX = (sx + camera.x.get()) % this.size;
    for (let x = sx; x < ex; x += this.size) {
      context.moveTo(-offsetX + x, sy);
      context.lineTo(-offsetX + x, ey);
    }

    const offsetY = (sy + camera.y.get()) % this.size;
    for (let y = sy; y < ey; y += this.size) {
      context.moveTo(sx, -offsetY + y);
      context.lineTo(ex, -offsetY + y);
    }

    context.stroke();
    context.closePath();
  }

  public visible(_: Camera): boolean {
    return true;
  }
}

export class World implements IDrawable {
  private grid: Grid;
  public config: WorldConfig;
  public foods: Food[];
  public viruses: Virus[];
  public players: Player[];
  public localPlayer?: Player;

  public constructor(config: WorldConfig) {
    this.grid = new Grid();
    this.config = config;
    this.foods = [];
    this.viruses = [];
    this.players = [];
  }

  public update(delta: number) {
    const renderer = game.renderer!;

    // move
    for (const player of this.players) {
      for (const cell of player.cells) {
        cell.updateDirection();

        const speed = Math.exp(-0.3 * Math.log(cell.mass / 50));
        const size = this.config.size;
        const halfSize = size / 2;
        const min = -halfSize;
        const max = halfSize;

        cell.x = clamp(cell.x + (cell.directionX + cell.velocityX) * delta * speed, min, max);
        cell.y = clamp(cell.y + (cell.directionY + cell.velocityY) * delta * speed, min, max);

        // constantly decay the extra velocity to 0
        const factor = Math.exp(-3 * (delta / 1000));
        cell.velocityX *= factor;
        cell.velocityY *= factor;
      }
    }

    // collide
    for (const player of this.players) {
      player.collision();
    }

    // merge
    for (const cell of this.players.flatMap((player) => player.cells)) {
      cell.mergeTimeout = Math.max(cell.mergeTimeout - delta / 1000, 0);

      for (let i = 0; i < this.foods.length; i += 1) {
        const food = this.foods[i];
        if (cell.canEat(food)) {
          cell.mass += food.mass;
          if (cell.parent === game.camera.target) {
            game.audio.play(Sound.Eat, 0.2);
          }
          this.foods[i] = Food.random(this);
        }
      }
    }

    const cells = this.players.flatMap((player) => player.cells).toSorted((a, b) => a.mass - b.mass);

    // eat
    for (const cellA of cells) {
      for (const cellB of cells) {
        if (cellA === cellB) {
          continue;
        }

        if (cellA.parent === cellB.parent) {
          if (cellA.canMerge && cellB.canMerge) {
            if (cellA.canEat(cellB)) {
              cellA.mass += cellB.mass;
              cellB.parent!.removeCell(cellB);
              if (cellA.parent === game.camera.target) {
                game.audio.play(Sound.Merge, 0.6);
              }
            }
          }
        } else {
          if (cellA.canEat(cellB)) {
            cellA.mass += cellB.mass;
            cellB.parent!.removeCell(cellB);
          }
        }
      }
    }

    game.camera.update(renderer);
  }

  public draw(renderer: Renderer, camera: Camera) {
    this.grid.draw(renderer, camera);

    this.foods
      .filter((food) => food.visible(camera))
      .forEach((food) => {
        food.draw(renderer, camera);
      });

    this.players.flatMap((player) => player.cells)
      .concat(this.viruses)
      .filter((cell) => cell.visible(camera))
      .toSorted((a, b) => a.mass - b.mass)
      .forEach((cell) => {
        cell.draw(renderer, camera);
      });
  }

  public visible(_: Camera): boolean {
    return true;
  }
}
