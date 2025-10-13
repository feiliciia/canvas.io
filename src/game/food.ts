import { Cell } from "./cell.svelte.ts";
import { randomColor, type Texture, textureColor } from "./common.ts";

export class Food extends Cell {
  constructor(x: number, y: number, mass: number, texture: Texture) {
    super(x, y, mass, texture);
  }

  static random(size: number): Food {
    const x = -(size / 2) + Math.random() * size;
    const y = -(size / 2) + Math.random() * size;
    const mass = 50 + Math.random() * 25;

    return new Food(x, y, mass, textureColor(randomColor()));
  }
}
