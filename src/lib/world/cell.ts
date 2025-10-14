import type { Texture } from "../utilities.ts";
import type { Player } from "./player.ts";
import type { IDrawable, Renderer } from "../view/renderer.ts";
import type { Camera } from "../view/camera.ts";
import { massToRadius } from "../utilities.ts";

// FIXME: rework this entire class pls! :D
export class Cell implements IDrawable {
  #mass: number;
  public get mass(): number {
    return this.#mass;
  }
  public set mass(mass: number) {
    this.#mass = Math.min(mass, 100000);
    this.#radius = massToRadius(this.#mass);
  }

  #radius: number;
  public get radius(): number {
    return this.#radius;
  }

  // current position
  public x: number;
  public y: number;

  // target position relative to the world
  public targetX: number;
  public targetY: number;

  // precomputed direction on each axis
  // calculated from x / y and targetX / targetY
  public directionX: number;
  public directionY: number;

  // velocity from splitting / exploding, decays over time
  public velocityX: number;
  public velocityY: number;

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
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.directionX = 0.0;
    this.directionY = 0.0;
    this.velocityX = 0.0;
    this.velocityY = 0.0;
    this.texture = texture;
    this.name = name;
    this.mergeTimeout = 0;
  }

  public clone(): Cell {
    const cell = new Cell(this.x, this.y, this.mass, this.texture, this.name);
    cell.parent = this.parent;
    cell.targetX = this.targetX;
    cell.targetY = this.targetY;
    cell.directionX = this.directionX;
    cell.directionY = this.directionY;
    cell.velocityX = this.velocityX;
    cell.velocityY = this.velocityY;
    return cell;
  }

  // public updateDirection(camera: Camera) {
  //   const width = camera.width;
  //   const height = camera.height;

  //   const relativeBlobX = camera.x.get() - this.x + this.targetX;
  //   const relativeBlobY = camera.y.get() - this.y + this.targetY;

  //   const distanceMax = 0.25 * Math.min(width, height);
  //   const distanceFromCenter = Math.hypot(relativeBlobX, relativeBlobY);
  //   const distanceToMaxRatio = distanceMax / Math.max(distanceFromCenter, 0.00001);
  //   const distance = clamp(distanceFromCenter, 0, distanceMax);

  //   this.directionX = relativeBlobX * distanceToMaxRatio * distance / (distanceMax * distanceMax);
  //   this.directionY = relativeBlobY * distanceToMaxRatio * distance / (distanceMax * distanceMax);
  // }

  public updateDirection() {
    // how far are we from the target point?
    const deltaX = this.targetX - this.x;
    const deltaY = this.targetY - this.y;

    // max movement radius
    const maxDistance = 2 * this.radius;

    const distance = Math.hypot(deltaX, deltaY);
    if (distance < 0.0001) {
      this.directionX = 0;
      this.directionY = 0;
      return;
    }

    const scale = Math.min(1, maxDistance / distance);
    const circleX = deltaX * scale;
    const circleY = deltaY * scale;

    this.directionX = circleX / maxDistance;
    this.directionY = circleY / maxDistance;
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

    context.lineWidth = 4.0;

    context.beginPath();
    context.arc(ox + this.x, oy + this.y, this.radius, 0, Math.PI * 2);

    // const segments = clamp(this.radius, 16, 48);
    // for (let i = 0; i < segments; i++) {
    //   const amp = 0.01;
    //   const freq1 = 8;
    //   const freq2 = 5;
    //   const speed = 0;
    //   const phase = 0;

    //   const a = (i / segments) * Math.PI * 2;

    //   const n = Math.sin(freq1 * a + phase + renderer.delta * speed) * 0.6 +
    //     Math.sin(freq2 * a - phase * 0.7 + renderer.delta * speed * 1.7) * 0.4;

    //   const rw = Math.max(0.4, 1 + amp * n) * this.radius;

    //   const px = ox + this.x + Math.cos(a) * rw;
    //   const py = oy + this.y + Math.sin(a) * rw;

    //   if (i === 0) {
    //     context.moveTo(px, py);
    //   } else {
    //     context.lineTo(px, py);
    //   }
    // }
    context.closePath();

    context.stroke();
    context.fill();

    if (this.name) {
      context.lineWidth = Math.max(~~(this.radius * 0.01), 0.7);
      context.fillStyle = "#FFFFFF";
      context.strokeStyle = "black";
      context.font = `bolder ${~~(this.radius * 0.6)}px Calibri`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(this.name, ox + this.x, oy + this.y);
      context.strokeText(this.name, ox + this.x, oy + this.y);
    }
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
