import type { Texture } from "../utilities.ts";
import type { ITarget } from "../view/camera.ts";
import type { IDrawable } from "../view/renderer.ts";
import type { World } from "./world.ts";
import { Sound } from "../io/audio.ts";
import { Cell } from "./cell.ts";
import { game } from "../game.svelte.ts";

export const enum PlayerAction {
  // Target a point in world
  Target,
  // Split each eligible cell in two halves
  Split,
  // Eject some mass
  Eject,
  // Quit the game
  //  note: a player is not responsible for spawning itself - it's the server's responsibility
  Quit,
}

type ActionArguments = {
  [PlayerAction.Target]: {
    x: number;
    y: number;
  };
  [PlayerAction.Split]: undefined;
  [PlayerAction.Eject]: undefined;
  [PlayerAction.Quit]: undefined;
};

type Arguments<A extends PlayerAction> = ActionArguments[A];

// FIXME: rework ts
export class Player implements IDrawable, ITarget {
  private world: World;
  public cells: Cell[];
  public name: string;

  public get alive(): boolean {
    return this.cells.length > 0;
  }

  public constructor(world: World, x: number, y: number, mass: number, texture: Texture, name: string) {
    const cell = new Cell(x, y, mass, texture, name);
    cell.parent = this;

    this.world = world;
    this.cells = [cell];
    this.name = name;
  }

  public draw(): void {
    // FIXME: currently z-ordering is only possible if we have access to all cells from all players
    // think of a different approach to be able to override `draw()` here
  }

  public visible(): boolean {
    return false;
  }

  public center(): [number, number] {
    if (this.cells.length === 0) {
      return [0, 0];
    }

    const centerX = this.cells.reduce((x, cell) => x + cell.x, 0) / this.cells.length;
    const centerY = this.cells.reduce((y, cell) => y + cell.y, 0) / this.cells.length;

    return [centerX, centerY];
  }

  public size(): [number, number] {
    if (this.cells.length === 0) {
      return [256, 256];
    }

    const minX = this.cells.reduce((x, cell) => Math.min(x, cell.x - cell.radius), Infinity);
    const minY = this.cells.reduce((y, cell) => Math.min(y, cell.y - cell.radius), Infinity);
    const maxX = this.cells.reduce((x, cell) => Math.max(x, cell.x + cell.radius), -Infinity);
    const maxY = this.cells.reduce((y, cell) => Math.max(y, cell.y + cell.radius), -Infinity);

    const sizeX = maxX - minX;
    const sizeY = maxY - minY;

    return [sizeX, sizeY];
  }

  public split(): boolean {
    const babies = [];

    for (const cell of this.cells) {
      if (this.cells.length + babies.length === this.world.config.maxCellsPerPlayer) {
        break;
      }

      if (cell.mass > 2000) {
        cell.mass /= 2;
        babies.push(cell.clone());
      }
    }

    if (babies.length === 0) {
      return false;
    }

    babies.forEach((cell) => {
      cell.velocityX = cell.directionX * Math.log(cell.mass) * 0.7;
      cell.velocityY = cell.directionY * Math.log(cell.mass) * 0.7;
      cell.mergeTimeout = this.world.config.mergeCooldown;
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
        const launching = Math.abs(cellA.velocityX) > MIN_V || Math.abs(cellA.velocityY) > MIN_V || Math.abs(cellB.velocityX) > MIN_V ||
          Math.abs(cellB.velocityY) > MIN_V;

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

  public action<A extends PlayerAction>(action: A, args: Arguments<A>) {
    switch (action) {
      case PlayerAction.Target:
        {
          const { x, y } = args as Arguments<PlayerAction.Target>;
          for (const cell of this.cells) {
            cell.targetX = x;
            cell.targetY = y;
          }
        }
        break;
      case PlayerAction.Split:
        {
          const success = this.split();
          if (success && game.camera.target === this) {
            game.audio.play(Sound.Split, 0.6);
          }
        }
        break;
      case PlayerAction.Eject:
        break;
      case PlayerAction.Quit:
        break;
      default:
        break;
    }
  }
}
