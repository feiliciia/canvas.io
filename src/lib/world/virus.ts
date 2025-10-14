import type { Color } from "../utilities.ts";
import type { World } from "./world.ts";
import type { Renderer } from "../view/renderer.ts";
import type { Camera } from "../view/camera.ts";
import { Cell } from "./cell.ts";

export class Virus extends Cell {
  private static SEGMENTS: number = 64;

  private constructor(x: number, y: number, mass: number) {
    super(x, y, mass, {
      kind: "color",
      hslFill: [120.0, 1.0, 0.6],
      hslOutline: [120.0, 0.78, 0.54],
      fill: `hsl(${120.0}deg, ${1.0 * 100}%, ${0.6 * 100}%)`,
      outline: `hsl(${120.0}deg, ${0.78 * 100}%, ${0.54 * 100}%)`,
    });
  }

  public static random(world: World): Virus {
    const size = world.config.size;
    const x = -(size / 2) + Math.random() * size;
    const y = -(size / 2) + Math.random() * size;
    return new Virus(x, y, 6000);
  }

  public override draw(renderer: Renderer, camera: Camera): void {
    const context = renderer.context;
    const width = camera.width;
    const height = camera.height;

    const ox = width / 2 - camera.x.get();
    const oy = height / 2 - camera.y.get();

    const color = this.texture as Color;

    context.fillStyle = color.fill;
    context.strokeStyle = color.outline;
    context.lineWidth = 4.0;

    context.beginPath();
    for (let i = 0; i < Virus.SEGMENTS; i += 1) {
      const a = (i / Virus.SEGMENTS) * Math.PI * 2;
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

  public override visible(camera: Camera): boolean {
    return super.visible(camera);
  }
}
