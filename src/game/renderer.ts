import { Camera } from "./camera";

export class Renderer {
  canvas?: HTMLCanvasElement;
  context?: CanvasRenderingContext2D;
  camera: Camera;
  width: number;
  height: number;

  constructor() {
    this.camera = new Camera(0, 0);
    this.width = 0;
    this.height = 0;
  }
}
