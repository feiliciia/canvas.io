import { Renderer } from "./renderer.ts";
import type { Drawable } from "./common.ts";
import { MAP_SIZE } from "./consts.ts";
import { clamp, randomColor } from "./common.ts";

export class Blob implements Drawable {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  speed: number;
  name?: string; //? kinda mostly the same as | undefined

  constructor(x: number, y: number, radius: number, color: string, speed: number, name?: string) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = radius;
    this.color = color;
    this.speed = speed;
    this.name = name;
  }

  static random(): Blob {
    return new Blob(
      Math.random() * MAP_SIZE - MAP_SIZE / 2,
      Math.random() * MAP_SIZE - MAP_SIZE / 2,
      3 + Math.random() * 15,
      randomColor(),
      0.2,
    );
  }

  draw(renderer: Renderer) {
    const drawX = this.x - renderer.camera.x + renderer.width / 2;
    const drawY = this.y - renderer.camera.y + renderer.height / 2;

    const ctx = renderer.context!;

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(drawX, drawY);
    ctx.arc(drawX, drawY, this.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
  }

  calculateVelocity(renderer: Renderer, x: number, y: number) {
    const relativeBlobX = renderer.camera.x - this.x + x;
    const relativeBlobY = renderer.camera.y - this.y + y;

    const distanceMax = 0.25 * Math.min(renderer.width, renderer.height);
    const distanceFromCenter = Math.hypot(relativeBlobX, relativeBlobY);
    const distanceToMaxRatio = distanceMax / Math.max(distanceFromCenter, 0.00001);
    const distance = clamp(distanceFromCenter, 0, distanceMax);

    this.vx = relativeBlobX * distanceToMaxRatio * distance / (distanceMax * distanceMax);
    this.vy = relativeBlobY * distanceToMaxRatio * distance / (distanceMax * distanceMax);
  }

  containsPoint(px: number, py: number): boolean {
    const dx = px - this.x;
    const dy = py - this.y;
    const distanceSquared = dx * dx + dy * dy;
    return distanceSquared <= this.radius * this.radius;
  }
}
