import { Renderer } from "./renderer.ts";

export type Color = { kind: "color"; hex: string };
export type Image = { kind: "image"; src: string };

// blobs can have a solid color or an image
export type Texture = Color | Image;

export interface Drawable {
  draw(renderer: Renderer): void;
}

const colors: string[] = [
  "#FF5733", // bright orange-red🚗🚗🚗🚗🚗
  "#33FF57", // neon green
  "#3357FF", // vivid blue
  "#F1C40F", // bright yellow
  "#9B59B6", // purple
  "#E67E22", // orange
  "#1ABC9C", // teal
  "#E84393", // pink
  "#2ECC71", // fresh green
  "#3498DB", // sky blue
];

export function textureColor(hex: string): Color {
  return {
    kind: "color",
    hex,
  };
}

export function textureImage(src: string): Image {
  return {
    kind: "image",
    src,
  };
}

export function massToRadius(mass: number): number {
  return Math.sqrt(mass / Math.PI);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function randomColor(): string {
  return colors[~~(Math.random() * colors.length)];
}
