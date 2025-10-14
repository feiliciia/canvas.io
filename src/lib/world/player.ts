import type { Texture } from "../utilities.ts";
import type { ITarget } from "../view/camera.ts";
import type { IDrawable } from "./world.ts";
import { Cell } from "./cell.ts";
import { World } from "./world.ts";

// FIXME: rework ts
export class Player implements IDrawable, ITarget {
  cells: Cell[];
  name: string;

  public constructor(x: number, y: number, mass: number, texture: Texture, name: string) {
    const cell = new Cell(x, y, mass, texture, name);
    cell.parent = this;

    this.cells = [cell];
    this.name = name;
  }

  public draw(): void {
    // FIXME: currently z-ordering is only possible if we have access to all cells from all players
    // use a different approach to be able to override `draw()` here
  }

  public visible(): boolean {
    return false;
  }

  public center(): [number, number] {
    const parts = this.cells;

    const centerX = parts.reduce((acc, blob) => acc + blob.x, 0) / parts.length;
    const centerY = parts.reduce((acc, blob) => acc + blob.y, 0) / parts.length;

    return [centerX, centerY];
  }

  public size(): [number, number] {
    const minX = this.cells.reduce((x, cell) => Math.min(x, cell.x - cell.radius), Infinity);
    const minY = this.cells.reduce((y, cell) => Math.min(y, cell.y - cell.radius), Infinity);
    const maxX = this.cells.reduce((x, cell) => Math.max(x, cell.x + cell.radius), -Infinity);
    const maxY = this.cells.reduce((y, cell) => Math.max(y, cell.y + cell.radius), -Infinity);

    const sizeX = maxX - minX;
    const sizeY = maxY - minY;

    return [sizeX, sizeY];
  }

  public split(world: World): boolean {
    const newCells = [];

    for (const cell of this.cells) {
      if (this.cells.length + newCells.length === world.config.maxCellsPerPlayer) {
        break;
      }

      if (cell.mass > 2000) {
        cell.mass /= 2;
        newCells.push(cell.clone());
      }
    }

    if (newCells.length === 0) {
      return false;
    }

    newCells.forEach((cell) => {
      cell.vx = cell.mx * Math.log(cell.mass) * 0.7;
      cell.vy = cell.my * Math.log(cell.mass) * 0.7;
      cell.mergeTimeout = world.config.mergeCooldown;
      this.cells.push(cell);
    });

    return true;
  }

  // thx lisa 😊
  public collision() {
    for (const cellA of this.cells) {
      for (const cellB of this.cells.slice(1)) {
        const MIN_V = 0.5;

        const canMerge = cellA.canMerge && cellB.canMerge;
        const launching = Math.abs(cellA.vx) > MIN_V || Math.abs(cellA.vy) > MIN_V || Math.abs(cellB.vx) > MIN_V || Math.abs(cellB.vy) > MIN_V;

        // we don't want to apply collision if cells can merge or if they're being launched out
        if (canMerge || launching) {
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

  public removeCell(cell: Cell) {
    const index = this.cells.indexOf(cell);
    if (index !== -1) {
      this.cells.splice(index, 1);
    }
  }
}
