/// <reference lib="dom" />

import { game } from "../game.svelte.ts";
import type { World } from "../world/world.ts";
import type { Camera } from "./camera.ts";

export interface IDrawable {
  draw(renderer: Renderer, camera: Camera): void;
  visible(camera: Camera): boolean;
}

export class Renderer {
  private last: number;
  public delta: number;
  public dt: number;
  public canvas: HTMLCanvasElement;
  public context: CanvasRenderingContext2D;

  public constructor(canvas: HTMLCanvasElement) {
    this.last = 0;
    this.delta = 0;
    this.dt = 0;
    this.canvas = canvas;
    this.context = canvas.getContext("2d")!;
  }

  public frame(time: number) {
    requestAnimationFrame(this.frame.bind(this));

    this.delta = time - this.last;
    this.dt = 1 / this.delta;
    this.last = time;

    this.render(game.world!, game.camera);
  }

  // FIXME: renderer is not responsible for updating the world!
  // they should be handled completely seperately
  public render(world: World, camera: Camera) {
    this.context.save();
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    world.draw(this, camera);
    this.context.restore();
  }
}
