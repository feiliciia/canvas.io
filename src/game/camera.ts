import { clamp } from "./common.ts";
import { Player } from "./player.svelte.ts";
import { Renderer } from "./renderer.ts";

export class Camera {
  static MAX_ZOOM: number = 4.0;

  // target x, y - where should the camera move to
  targetX: number;
  targetY: number;

  // current camera x, y - smoothly approaching tx, ty
  x: number;
  y: number;

  targetZoom: number;
  zoom: number;
  inverseZoom: number;

  // how much the user wants to zoom in, clamped
  userZoom: number;

  target?: Player;

  constructor() {
    this.targetX = 0;
    this.targetY = 0;
    this.targetZoom = 1.0;
    this.x = 0;
    this.y = 0;
    this.zoom = 1.0;
    this.inverseZoom = 1.0;
    this.userZoom = 1.0;
  }

  move(renderer: Renderer) {
    if (this.target) {
      const parts = this.target.cells;

      this.targetX = parts.reduce((acc, blob) => acc + blob.x, 0) / parts.length;
      this.targetY = parts.reduce((acc, blob) => acc + blob.y, 0) / parts.length;

      const targetMinX = parts.reduce((x, blob) => Math.min(x, blob.x - blob.radius), Infinity);
      const targetMinY = parts.reduce((y, blob) => Math.min(y, blob.y - blob.radius), Infinity);
      const targetMaxX = parts.reduce((x, blob) => Math.max(x, blob.x + blob.radius), -Infinity);
      const targetMaxY = parts.reduce((y, blob) => Math.max(y, blob.y + blob.radius), -Infinity);

      const targetDistanceX = targetMaxX - targetMinX;
      const targetDistanceY = targetMaxY - targetMinY;

      const ratioX = renderer.width / targetDistanceX;
      const ratioY = renderer.height / targetDistanceY;
      const ratio = Math.min(ratioX, ratioY) / 4;

      this.targetZoom = this.userZoom * ratio;
    } else {
      this.targetX = 0;
      this.targetY = 0;
      this.targetZoom = 1.0;
    }

    const halfW = renderer.width / 2;
    const halfH = renderer.height / 2;

    const stiffness = 0.08;
    const alpha = 1 - Math.exp(-stiffness * (1 / renderer.delta));

    this.x += (this.targetX - this.x) * alpha;
    this.y += (this.targetY - this.y) * alpha;
    this.zoom += (this.targetZoom - this.zoom) * alpha;
    this.inverseZoom = 1 / this.zoom;

    renderer.context.translate(halfW, halfH);
    renderer.context.scale(this.zoom, this.zoom);
    renderer.context.translate(-halfW, -halfH);
  }

  onWheel(delta: number) {
    this.userZoom = clamp(this.userZoom - delta / 4, 1 / 2, 2);
  }
}
