export type Hsl = [number, number, number];
export type Color = { kind: "color"; hslFill: Hsl; hslOutline: Hsl; fill: string; outline: string };
export type Image = { kind: "image"; src: string };

// blobs can have a solid color or an image
export type Texture = Color | Image;

const colors: Hsl[] = [
  [10.588, 1.000, 0.600],
  [229.412, 1.000, 0.600],
  [48.053, 0.889, 0.502],
  [282.581, 0.389, 0.532],
  [28.163, 0.797, 0.518],
  [168.148, 0.757, 0.419],
  [330.909, 0.782, 0.586],
  [145.443, 0.633, 0.490],
  [204.072, 0.699, 0.531],
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

export class Animated<T> {
  #current: T;

  public get current() {
    return this.#current;
  }

  private target: T;
  private onTick: (current: T, target: T) => T;

  public constructor(init: T, onTick: (current: T, target: T) => T) {
    this.#current = init;
    this.target = init;
    this.onTick = onTick;
  }

  public get(): T {
    return this.current;
  }

  public set(target: T): this {
    this.target = target;
    return this;
  }

  public tick(): T {
    this.#current = this.onTick(this.#current, this.target);
    return this.#current;
  }
}
