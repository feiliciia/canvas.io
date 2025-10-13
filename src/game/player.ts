import { Cell } from "./cell.ts";
import type { Texture } from "./common.ts";

export class Player {
  cells: Cell[];
  name: string;
  alive: boolean;

  constructor(x: number, y: number, mass: number, texture: Texture, name: string) {
    const cell = new Cell(x, y, mass, texture, name);
    cell.owner = this;

    this.cells = [cell];
    this.name = name;
    this.alive = false;
  }

  split() {
    const newCells = [];
    for (const cell of this.cells) {
      if (cell.mass > 2000) {
        cell.mass /= 2;
        newCells.push(cell.clone());
      }
    }
    newCells.forEach((cell) => {
      cell.vx = cell.mx * Math.log(cell.mass) * 0.7;
      cell.vy = cell.my * Math.log(cell.mass) * 0.7;
      this.cells.push(cell);
    });
  }

  removeCell(cell: Cell) {
    const index = this.cells.indexOf(cell);
    if (index !== -1) {
      this.cells.splice(index, 1);
    }
  }
}
