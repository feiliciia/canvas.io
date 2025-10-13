import type { Player } from "./player.ts";

export class Camera {
  // target x, y - where should the camera move to
  tx: number;
  ty: number;

  // actual camera x, y - smoothly approaching tx, ty
  x: number;
  y: number;

  zoom: number;
  target?: Player;

  constructor() {
    this.tx = 0;
    this.ty = 0;
    this.x = 0;
    this.y = 0;
    this.zoom = 1.0;
  }

  move(dt: number) {
    if (!this.target) {
      this.x = 0;
      this.y = 0;
      return;
    }

    const parts = this.target.cells;
    this.tx = parts.reduce((acc, blob) => acc + blob.x, 0) / parts.length;
    this.ty = parts.reduce((acc, blob) => acc + blob.y, 0) / parts.length;

    const stiffness = 0.08;
    const alpha = 1 - Math.exp(-stiffness * dt);

    this.x += (this.tx - this.x) * alpha;
    this.y += (this.ty - this.y) * alpha;
  }
}
