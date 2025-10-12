import { colors } from "./consts.ts";
import { Renderer } from "./renderer.ts";

//interface for methods
export interface Drawable {
  draw(renderer: Renderer): void;
}

export function randomColor(): string {
  return colors[~~(Math.random() * colors.length)];
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
