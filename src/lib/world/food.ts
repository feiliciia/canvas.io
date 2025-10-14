import type { World } from "./world.ts";
import type { Texture } from "../utilities.ts";
import { Cell } from "./cell.ts";
import { randomColor, textureColor } from "../utilities.ts";

export class Food extends Cell {
  private constructor(x: number, y: number, mass: number, texture: Texture) {
    super(x, y, mass, texture);
  }

  public static random(world: World): Food {
    const size = world.config.size;
    const x = -(size / 2) + Math.random() * size;
    const y = -(size / 2) + Math.random() * size;
    const mass = 50 + Math.random() * 25;
    return new Food(x, y, mass, textureColor(randomColor()));
  }
}
