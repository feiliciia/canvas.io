import type { Drawable, Texture } from "./common.ts";
import { clamp, massToRadius } from "./common.ts";
import type { Player } from "./player.ts";
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

    this.mass = mass;
    this.texture = texture;
    this.name = name;
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
    return distanceSquared <= this.radius * this.radius && this.mass >= other.mass * 1.1;
  }

  draw(renderer: Renderer): void {
    const ctx = renderer.context;

    // x / y offsets
    // object at 0, 0 and camera at 0, 0 should show the object in the center
    const ox = renderer.width / 2 - renderer.camera.x;
    const oy = renderer.height / 2 - renderer.camera.y;

    ctx.beginPath();
    switch (this.texture.kind) {
      case "color":
        ctx.fillStyle = this.texture.hex;
        break;
      case "image":
        // TODO: draw circle with an image
        break;
    }
    ctx.arc(ox + this.x, oy + this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
}
