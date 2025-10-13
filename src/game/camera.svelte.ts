import { clamp } from "./common.ts";
import { Player } from "./player.svelte.ts";
import { Renderer } from "./renderer.ts";

export class Camera {
  static MAX_ZOOM: number = 4.0;

  // target x, y - where should the camera move to
  tx: number;
  ty: number;

  // target zoom
  tzoom: number;

  // current camera x, y - smoothly approaching tx, ty
  x: number;
  y: number;

  // current zoom - smoothly approaching tzoom
  zoom: number;

  // how much the user wants to zoom in, clamped
  userZoom: number;

  target?: Player;

  constructor() {
    this.tx = 0;
    this.ty = 0;
    this.tzoom = 1.0;
    this.x = 0;
    this.y = 0;
    this.zoom = $state(1.0);
    this.userZoom = 1.0;
  }

  move(renderer: Renderer) {
    if (!this.target) {
      this.x = 0;
      this.y = 0;
      return;
    }

    const parts = this.target.cells;

    const [tMinX, tMinY] = parts.reduce(([x, y], blob) => [Math.min(x, blob.x - blob.radius), Math.min(y, blob.y - blob.radius)], [Infinity, Infinity]);
    const [tMaxX, tMaxY] = parts.reduce(([x, y], blob) => [Math.max(x, blob.x + blob.radius), Math.max(y, blob.y + blob.radius)], [-Infinity, -Infinity]);

    const tDistX = tMaxX - tMinX;
    const tDistY = tMaxY - tMinY;

    const ratioX = renderer.width / tDistX;
    const ratioY = renderer.height / tDistY;

    this.tx = parts.reduce((acc, blob) => acc + blob.x, 0) / parts.length;
    this.ty = parts.reduce((acc, blob) => acc + blob.y, 0) / parts.length;
    this.tzoom = this.userZoom * Math.min(Math.min(ratioX, ratioY), Camera.MAX_ZOOM);

    const stiffness = 0.08;
    const alpha = 1 - Math.exp(-stiffness * (1 / renderer.delta));

    this.x += (this.tx - this.x) * alpha;
    this.y += (this.ty - this.y) * alpha;
    this.zoom += (this.tzoom - this.zoom) * alpha;

    renderer.context.translate(renderer.width / 2, renderer.height / 2);
    renderer.context.scale(this.zoom / 2, this.zoom / 2);
    renderer.context.translate(-renderer.width / 2, -renderer.height / 2);
  }

  onWheel(delta: number) {
    this.userZoom = clamp(this.userZoom - delta / 4, 1 / 2, 4);
    console.log(this.userZoom);
  }
}
