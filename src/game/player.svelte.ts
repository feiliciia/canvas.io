import type { Texture } from "./common.ts";
import type { Global } from "./global.svelte.ts";
import { Cell } from "./cell.svelte.ts";
import { Sound } from "./sfx.svelte.ts";
import { World } from "./world.svelte.ts";

export class Player {
  world: World;
  maxCells: number;
  cells: Cell[];
  name: string;
  alive: boolean;

  constructor(world: World, x: number, y: number, mass: number, texture: Texture, name: string, maxCells: number) {
    const cell = new Cell(x, y, mass, texture, name);
    cell.owner = this;

    this.world = world;
    this.maxCells = maxCells;
    this.cells = [cell];
    this.name = name;
    this.alive = false;
  }

  split(global: Global) {
    const newCells = [];

    for (const cell of this.cells) {
      if (this.cells.length + newCells.length === this.maxCells) {
        break;
      }

      if (cell.mass > 2000) {
        cell.mass /= 2;
        newCells.push(cell.clone());
      }
    }

    if (newCells.length === 0) {
      return;
    }

    global.sfx.play(Sound.Split);

    newCells.forEach((cell) => {
      cell.vx = cell.mx * Math.log(cell.mass) * 0.7;
      cell.vy = cell.my * Math.log(cell.mass) * 0.7;
      cell.mergeTimer = this.world.mergeCooldown;
      this.cells.push(cell);
    });
  }

  // thx lisa 😊
  collision() {
    for (const cellA of this.cells) {
      for (const cellB of this.cells.slice(1)) {
        const MIN_V = 0.5;

        const canMerge = cellA.canMerge() && cellB.canMerge();
        const launched = Math.abs(cellA.vx) > MIN_V || Math.abs(cellA.vy) > MIN_V || Math.abs(cellB.vx) > MIN_V || Math.abs(cellB.vy) > MIN_V;

        // we don't want to apply collision if cells can merge or if they're being launched out
        if (canMerge || launched) {
          continue;
        }

        const distX = cellB.x - cellA.x;
        const distY = cellB.y - cellA.y;
        const dist = Math.max(Math.hypot(distX, distY), 0.0001);

        const minDist = cellA.radius + cellB.radius + 1;

        if (dist < minDist) {
          const nx = distX * (minDist - dist) / (dist * 2);
          const ny = distY * (minDist - dist) / (dist * 2);

          cellB.x += nx;
          cellB.y += ny;

          cellA.x -= nx;
          cellA.y -= ny;
        }
      }
    }
  }

  removeCell(cell: Cell) {
    const index = this.cells.indexOf(cell);
    if (index !== -1) {
      this.cells.splice(index, 1);
    }
  }
}
