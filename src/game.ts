import { clamp, massToRadius, randomColor, textureColor } from "./util.ts";

export type Color = { kind: "color"; hex: string };
export type Image = { kind: "image"; src: string };

// blobs can have a solid color or an image
export type Texture = Color | Image;

export class Renderer {
  // how big is our view?
  width: number;
  height: number;

  // where is our camera?
  camera: Camera;

  // the canvas context
  readonly context: CanvasRenderingContext2D;

  constructor(context: CanvasRenderingContext2D, width: number, height: number) {
    this.width = width;
    this.height = height;
    this.camera = new Camera();
    this.context = context;
  }
}

export interface Drawable {
  draw(renderer: Renderer): void;
}

export class Blob implements Drawable {
  // `vx` / `vy` are velocities - how strongly is the blob moving on each axis
  vx: number;
  vy: number;

  // `x` / `y` are currently drawn positions
  x: number;
  y: number;

  mass: number;
  readonly texture: Texture;
  readonly name?: string;

  // re-calculate radius when mass changes
  radius: number;

  constructor(x: number, y: number, mass: number, texture: Texture, name?: string) {
    this.vx = 0.0;
    this.vy = 0.0;

    this.x = x;
    this.y = y;

    this.mass = mass;
    this.texture = texture;
    this.name = name;

    this.radius = massToRadius(this.mass);
  }

  addMass(mass: number): void {
    this.mass += mass;
    this.radius = massToRadius(this.mass);
  }

  removeMass(mass: number): void {
    this.mass -= mass;
    this.radius = massToRadius(this.mass);
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

export class Food extends Blob {
  constructor(x: number, y: number, mass: number, texture: Texture) {
    super(x, y, mass, texture);
  }
}

export class Player {
  parts: Blob[];
  readonly name: string;

  constructor(x: number, y: number, mass: number, texture: Texture, name: string) {
    this.parts = [new Blob(x, y, mass, texture, name)];
    this.name = name;
  }
}

export class Camera {
  // where is the camera relative to the world?
  x: number;
  y: number;
  zoom: number;

  constructor() {
    this.x = 0;
    this.y = 0;
    this.zoom = 1.0;
  }
}

export class World implements Drawable {
  // world square size in units
  size: number;
  foods: Food[];
  players: Player[];

  constructor(size: number) {
    this.size = size;
    this.foods = [];
    this.players = [];
  }

  draw(renderer: Renderer): void {
    renderer.context.clearRect(0, 0, renderer.width, renderer.height);

    for (const food of this.foods) {
      food.draw(renderer);
    }

    // FIXME: draw in correct z-order
    // smaller blobs (parts) should be drawn first
    for (const player of this.players) {
      for (const part of player.parts) {
        part.draw(renderer);
      }
    }
  }
}

export class Game {
  renderer: Renderer;
  world: World;
  id: string;
  tickrate: number;
  localPlayer: Player;

  constructor(renderer: Renderer, localPlayer: Player) {
    this.renderer = renderer;
    this.world = new World(10000);
    this.id = "abc";
    this.tickrate = 60;
    this.localPlayer = localPlayer;

    this.world.players.push(localPlayer);

    // this would be populated from the server
    for (let i = 0; i < 4096; i += 1) {
      const x = -(this.world.size / 2) + Math.random() * this.world.size;
      const y = -(this.world.size / 2) + Math.random() * this.world.size;
      const mass = 100 + Math.random() * 100;
      this.world.foods.push(new Food(x, y, mass, textureColor(randomColor())));
    }
  }

  process(delta: number) {
    for (const player of this.world.players) {
      for (const part of player.parts) {
        part.x = clamp(part.x + part.vx * delta, -(this.world.size / 2), this.world.size / 2);
        part.y = clamp(part.y + part.vy * delta, -(this.world.size / 2), this.world.size / 2);
      }
    }

    const parts = this.localPlayer.parts;
    this.renderer.camera.x = parts.reduce((acc, blob) => acc + blob.x, 0) / parts.length;
    this.renderer.camera.y = parts.reduce((acc, blob) => acc + blob.y, 0) / parts.length;
  }
}
