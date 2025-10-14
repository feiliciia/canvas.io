import type { Texture } from "../utilities.ts";
import type { Player } from "./player.ts";
import type { Renderer } from "../view/renderer.ts";
import type { Camera } from "../view/camera.ts";
import type { IDrawable } from "./world.ts";
import { clamp, massToRadius } from "../utilities.ts";

// FIXME: rework this entire class pls! :D
export class Cell implements IDrawable {
  #mass: number;
  public get mass(): number {
    return this.#mass;
  }
  public set mass(mass: number) {
    this.#mass = mass;
    this.#radius = massToRadius(mass);
  }

  #radius: number;
  public get radius(): number {
    return this.#radius;
  }

  // target x / y relative to cell on canvas
  public tx: number;
  public ty: number;

  // mouse movement -1 ~ 1 - x / y
  // the vector direction where a cell is "facing"
  public mx: number;
  public my: number;

  // `vx` / `vy` are velocities - how strongly is the blob moving on each axis
  // velocity decays over time due to friction
  public vx: number;
  public vy: number;

  // `x` / `y` are currently drawn positions
  public x: number;
  public y: number;

  public texture: Texture;
  public name?: string;
  public parent?: Player;
  public mergeTimeout: number;

  public get canMerge(): boolean {
    return this.mergeTimeout === 0;
  }

  public constructor(x: number, y: number, mass: number, texture: Texture, name?: string) {
    this.#mass = mass;
    this.#radius = massToRadius(mass);
    this.tx = 0;
    this.ty = 0;
    this.mx = 0.0;
    this.my = 0.0;
    this.vx = 0.0;
    this.vy = 0.0;
    this.x = x;
    this.y = y;
    this.texture = texture;
    this.name = name;
    this.mergeTimeout = 0;
  }

  public clone(): Cell {
    const cell = new Cell(this.x, this.y, this.mass, this.texture, this.name);
    cell.parent = this.parent;
    cell.tx = this.tx;
    cell.ty = this.ty;
    cell.mx = this.mx;
    cell.my = this.my;
    cell.vx = this.vx;
    cell.vy = this.vy;
    return cell;
  }

  public move(camera: Camera) {
    const width = camera.width;
    const height = camera.height;

    const relativeBlobX = camera.x.get() - this.x + this.tx;
    const relativeBlobY = camera.y.get() - this.y + this.ty;

    const distanceMax = 0.25 * Math.min(width, height);
    const distanceFromCenter = Math.hypot(relativeBlobX, relativeBlobY);
    const distanceToMaxRatio = distanceMax / Math.max(distanceFromCenter, 0.00001);
    const distance = clamp(distanceFromCenter, 0, distanceMax);

    this.mx = relativeBlobX * distanceToMaxRatio * distance / (distanceMax * distanceMax);
    this.my = relativeBlobY * distanceToMaxRatio * distance / (distanceMax * distanceMax);
  }

  public canEat(other: Cell): boolean {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    const distanceSquared = dx * dx + dy * dy;

    if (this.parent === other.parent) {
      return distanceSquared <= this.radius * this.radius && this.mass >= other.mass;
    } else {
      return distanceSquared <= this.radius * this.radius && this.mass >= other.mass * 1.1;
    }
  }

  public draw(renderer: Renderer, camera: Camera): void {
    const context = renderer.context;

    const ox = camera.width / 2 - camera.x.get();
    const oy = camera.height / 2 - camera.y.get();

    switch (this.texture.kind) {
      case "color":
        {
          context.fillStyle = this.texture.fill;
          context.strokeStyle = this.texture.outline;
        }
        break;
      case "image":
        context.strokeStyle = "#000000";
        // TODO: draw circle with an image
        break;
    }

    const segments = clamp(this.radius, 16, 48);
    context.lineWidth = 4.0;

    context.beginPath();
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

      if (i === 0) {
        context.moveTo(px, py);
      } else {
        context.lineTo(px, py);
      }
    }
    context.closePath();

    context.stroke();
    context.fill();
  }

  // FIXME: make it even faster; this is called for all cells every frame
  public visible(camera: Camera): boolean {
    const relativeX = camera.x.get() - this.x;
    const relativeY = camera.y.get() - this.y;

    if (Math.abs(relativeX) > this.radius + camera.halfWidth * camera.zoomInverse) {
      return false;
    }

    if (Math.abs(relativeY) > this.radius + camera.halfHeight * camera.zoomInverse) {
      return false;
    }

    return true;
  }
}
