/// <reference lib="dom" />

import { Camera } from "./camera.ts";

export class Renderer {
  // where is our camera?
  camera: Camera;

  // the canvas and its 2d context
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  delta: number;

  get width(): number {
    return this.canvas.width;
  }

  get height(): number {
    return this.canvas.height;
  }

  constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    this.camera = new Camera();
    this.canvas = canvas;
    this.context = context;
    this.delta = 0;
  }
}
