import type { Drawable, Texture } from "./common.ts";
import { clamp, massToRadius } from "./common.ts";
import { Player } from "./player.svelte.ts";
import { Renderer } from "./renderer.ts";

export class Cell implements Drawable {
  // target x / y relative to cell on canvas
  tx: number;
  ty: number;

  // mouse movement -1 ~ 1 - x / y
  // the vector direction where a cell is "facing"
  mx: number;
  my: number;

  // `vx` / `vy` are velocities - how strongly is the blob moving on each axis
  // velocity decays over time due to friction
  vx: number;
  vy: number;

  // `x` / `y` are currently drawn positions
  x: number;
  y: number;

  mass: number;
  texture: Texture;
  name?: string;

  owner?: Player;

  mergeTimer: number;

  // re-calculate radius when mass changes
  get radius(): number {
    return massToRadius(this.mass);
  }

  constructor(x: number, y: number, mass: number, texture: Texture, name?: string) {
    this.tx = 0;
    this.ty = 0;

    this.mx = 0.0;
    this.my = 0.0;

    this.vx = 0.0;
    this.vy = 0.0;

    this.x = x;
    this.y = y;

    this.mass = $state(mass);
    this.texture = texture;
    this.name = name;

    this.mergeTimer = 0;
  }

  clone(): Cell {
    const cell = new Cell(this.x, this.y, this.mass, this.texture, this.name);
    cell.owner = this.owner;
    cell.tx = this.tx;
    cell.ty = this.ty;
    cell.mx = this.mx;
    cell.my = this.my;
    cell.vx = this.vx;
    cell.vy = this.vy;
    return cell;
  }

  calculateMovement(renderer: Renderer) {
    const relativeBlobX = renderer.camera.x - this.x + this.tx;
    const relativeBlobY = renderer.camera.y - this.y + this.ty;

    const distanceMax = 0.25 * Math.min(renderer.width, renderer.height);
    const distanceFromCenter = Math.hypot(relativeBlobX, relativeBlobY);
    const distanceToMaxRatio = distanceMax / Math.max(distanceFromCenter, 0.00001);
    const distance = clamp(distanceFromCenter, 0, distanceMax);

    this.mx = relativeBlobX * distanceToMaxRatio * distance / (distanceMax * distanceMax);
    this.my = relativeBlobY * distanceToMaxRatio * distance / (distanceMax * distanceMax);
  }

  canEat(other: Cell): boolean {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    const distanceSquared = dx * dx + dy * dy;

    if (this.owner === other.owner) {
      return distanceSquared <= this.radius * this.radius && this.mass >= other.mass;
    } else {
      return distanceSquared <= this.radius * this.radius && this.mass >= other.mass * 1.1;
    }
  }

  canMerge(): boolean {
    return this.mergeTimer === 0;
  }

  draw(renderer: Renderer): void {
    const ctx = renderer.context;

    // x / y offsets
    // object at 0, 0 and camera at 0, 0 should show the object in the center
    const ox = renderer.width / 2 - renderer.camera.x;
    const oy = renderer.height / 2 - renderer.camera.y;

    switch (this.texture.kind) {
      case "color":
        {
          ctx.fillStyle = this.texture.fill;
          ctx.strokeStyle = this.texture.outline;
        }
        break;
      case "image":
        ctx.strokeStyle = "#000000";
        // TODO: draw circle with an image
        break;
    }

    const segments = clamp(this.radius, 16, 48);
    ctx.lineWidth = 4.0;

    ctx.beginPath();
    for (let i = 0; i < segments; i++) {
      const amp = 0.01;
      const freq1 = 8;
      const freq2 = 5;
      const speed = 0;
      const phase = 0;

      const a = (i / segments) * Math.PI * 2;

      const n = Math.sin(freq1 * a + phase + renderer.delta * speed) * 0.6 +
        Math.sin(freq2 * a - phase * 0.7 + renderer.delta * speed * 1.7) * 0.4;

      const rw = Math.max(0.4, 1 + amp * n) * this.radius;

      const px = ox + this.x + Math.cos(a) * rw;
      const py = oy + this.y + Math.sin(a) * rw;

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    // ctx.arc(ox + this.x, oy + this.y, this.radius, 0, Math.PI * 2);

    ctx.stroke();
    ctx.fill();
  }

  // FIXME: make it even faster, this is called for all cells every frame
  visible(renderer: Renderer) {
    const halfW = renderer.width / 2;
    const halfH = renderer.height / 2;

    const relativeX = renderer.camera.x - this.x;
    const relativeY = renderer.camera.y - this.y;

    if (Math.abs(relativeX) > this.radius + halfW * renderer.camera.inverseZoom) {
      return false;
    }

    if (Math.abs(relativeY) > this.radius + halfH * renderer.camera.inverseZoom) {
      return false;
    }

    return true;
  }
}
