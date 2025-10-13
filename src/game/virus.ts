import type { Color } from "./common.ts";
import { Cell } from "./cell.svelte.ts";
import { Renderer } from "./renderer.ts";

export class Virus extends Cell {
  constructor(x: number, y: number, mass: number) {
    super(x, y, mass, {
      kind: "color",
      hslFill: [120.0, 1.0, 0.6],
      hslOutline: [120.0, 0.78, 0.54],
      fill: `hsl(${120.0}deg, ${1.0 * 100}%, ${0.6 * 100}%)`,
      outline: `hsl(${120.0}deg, ${0.78 * 100}%, ${0.54 * 100}%)`,
    });
  }

  static random(size: number): Virus {
    const x = -(size / 2) + Math.random() * size;
    const y = -(size / 2) + Math.random() * size;
    return new Virus(x, y, 8192);
  }

  override draw(renderer: Renderer): void {
    const { width, height, camera, context } = renderer;

    const ox = width / 2 - camera.x;
    const oy = height / 2 - camera.y;

    const segments = 64;

    const color = this.texture as Color;

    context.fillStyle = color.fill;
    context.strokeStyle = color.outline;
    context.lineWidth = 4.0;

    context.beginPath();
    for (let i = 0; i < segments; i += 1) {
      const a = (i / segments) * Math.PI * 2;
      const r = i % 2 === 0 ? this.radius : this.radius + 4.0;

      const px = ox + this.x + Math.cos(a) * r;
      const py = oy + this.y + Math.sin(a) * r;

      if (i === 0) {
        context.moveTo(px, py);
      } else {
        context.lineTo(px, py);
      }
    }
    context.closePath();

    context.fill();
    context.stroke();
  }
}
