import type { Renderer } from "./renderer.ts";
import { Animated } from "../utilities.ts";
import { clamp } from "../utilities.ts";
import { game } from "../game.svelte.ts";

export interface ITarget {
  get name(): string | undefined;
  get center(): [number, number];
  get size(): [number, number];
}

export class Center implements ITarget {
  public get name(): string | undefined {
    return undefined;
  }

  public get center(): [number, number] {
    return [0, 0];
  }

  public get size(): [number, number] {
    return [256, 256];
  }
}

export class Camera {
  #zoomInverse: number;
  public get zoomInverse(): number {
    return this.#zoomInverse;
  }

  #width: number;
  public get width(): number {
    return this.#width;
  }
  public set width(width: number) {
    this.#width = width;
    this.#halfWidth = width / 2;
  }

  #halfWidth: number;
  public get halfWidth(): number {
    return this.#halfWidth;
  }

  #height: number;
  public get height(): number {
    return this.#height;
  }
  public set height(height: number) {
    this.#height = height;
    this.#halfHeight = height / 2;
  }

  #halfHeight: number;
  public get halfHeight(): number {
    return this.#halfHeight;
  }

  private alpha: number;
  private userZoom: number;

  public x: Animated<number>;
  public y: Animated<number>;
  public zoom: Animated<number>;
  public target: ITarget;

  public constructor() {
    this.#zoomInverse = 1.0;
    this.#width = 0;
    this.#halfWidth = 0;
    this.#height = 0;
    this.#halfHeight = 0;

    this.alpha = 0.0;
    this.userZoom = 1.0;

    const tick = function (this: Camera, current: number, target: number): number {
      return current + (target - current) * this.alpha;
    }.bind(this);

    this.x = new Animated(0.0, tick);
    this.y = new Animated(0.0, tick);
    this.zoom = new Animated(1.0, tick);
    this.target = new Center();
  }

  // FIXME: fix the algo! it's either too big or too small!
  public update(renderer: Renderer) {
    this.alpha = 1 - Math.exp(-0.08 * game.renderer!.dt);

    const [centerX, centerY] = this.target.center;
    this.x.set(centerX).tick();
    this.y.set(centerY).tick();

    const [sizeX, sizeY] = this.target.size;
    const min = Math.min(this.width, this.height);
    const max = Math.max(sizeX, sizeY);
    const ratio = Math.min(min / max, 2);

    this.zoom.set(this.userZoom * ratio).tick();

    this.#zoomInverse = 1 / this.zoom.get();

    renderer.context.translate(this.halfWidth, this.halfHeight);
    renderer.context.scale(this.zoom.get(), this.zoom.get());
    renderer.context.translate(-this.halfWidth, -this.halfHeight);
  }

  public updateZoom(delta: number) {
    this.userZoom = clamp(this.userZoom - clamp(delta, -1, 1) / 4, 1 / 2, 2);
  }
}
