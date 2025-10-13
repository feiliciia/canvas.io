import { Renderer } from "./renderer.ts";

export type Hsl = [number, number, number];
export type Color = { kind: "color"; hslFill: Hsl; hslOutline: Hsl; fill: string; outline: string };
export type Image = { kind: "image"; src: string };

// blobs can have a solid color or an image
export type Texture = Color | Image;

export interface Drawable {
  draw(renderer: Renderer): void;
}

const colors: Hsl[] = [
  [10.588, 1.000, 0.600], // #FF5733
  [229.412, 1.000, 0.600], // #3357FF
  [48.053, 0.889, 0.502], // #F1C40F
  [282.581, 0.389, 0.532], // #9B59B6
  [28.163, 0.797, 0.518], // #E67E22
  [168.148, 0.757, 0.419], // #1ABC9C
  [330.909, 0.782, 0.586], // #E84393
  [145.443, 0.633, 0.490], // #2ECC71
  [204.072, 0.699, 0.531], // #3498DB
];

export function textureColor([h, s, l]: Hsl): Color {
  const lOutline = Math.max(l - 0.1, 0);
  return {
    kind: "color",
    hslFill: [h, s, l],
    hslOutline: [h, s, lOutline],
    fill: `hsl(${h}deg, ${s * 100}%, ${l * 100}%)`,
    outline: `hsl(${h}deg, ${s * 100}%, ${lOutline * 100}%)`,
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

export function randomColor(): Hsl {
  return colors[~~(Math.random() * colors.length)];
}
