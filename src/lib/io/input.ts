import { game } from "../game.svelte.ts";
import { clamp, TypedMap } from "../utilities.ts";

export type KeyboardCallback = (event: KeyboardEvent) => void;
export type InputCallback = () => void;

export type KeyCode = string;

export const enum InputEvent {
  Zoom,
  Target,
  Eject,
  Split,
}

type InputCallbacks = {
  [InputEvent.Zoom]: (delta: number) => void;
  [InputEvent.Target]: (x: number, y: number) => void;
  [InputEvent.Eject]: () => void;
  [InputEvent.Split]: () => void;
};

export class Input {
  private callbacks: TypedMap<InputEvent, InputCallbacks>;
  private keystates: Map<KeyCode, boolean>;
  private keybinds: Map<KeyCode, InputEvent>;

  public constructor() {
    this.callbacks = new Map();
    this.keystates = new Map();
    this.keybinds = new Map([
      ["Space", InputEvent.Split],
      ["KeyW", InputEvent.Eject],
    ]);
  }

  public onmousemove(e: MouseEvent) {
    if (!game.renderer) {
      return;
    }

    const canvas = game.renderer.canvas;
    const camera = game.camera;

    // mouse position
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // canvas rect calculations
    const rect = canvas.getBoundingClientRect();
    const x = (mouseX - rect.left) * (canvas.width / rect.width);
    const y = (mouseY - rect.top) * (canvas.height / rect.height);

    // canvas center
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // offset from center
    const offsetX = x - centerX;
    const offsetY = y - centerY;

    // world based coordinates
    const worldX = camera.x.get() + offsetX / camera.zoom.get();
    const worldY = camera.y.get() + offsetY / camera.zoom.get();

    this.callbacks.get(InputEvent.Target)?.(worldX, worldY);
  }

  public onwheel(e: WheelEvent) {
    this.callbacks.get(InputEvent.Zoom)?.(clamp(e.deltaY, -1, 1));
  }

  public onkeydown(e: KeyboardEvent) {
    if (!this.keystates.get(e.code)) {
      const event = this.keybinds.get(e.code)!;
      switch (event) {
        case InputEvent.Eject:
          this.callbacks.get(event)?.();
          break;
        case InputEvent.Split: {
          this.callbacks.get(event)?.();
          break;
        }
        default:
          break;
      }
    }
    this.keystates.set(e.code, true);
  }

  public onkeyup(e: KeyboardEvent) {
    this.keystates.set(e.code, false);
  }

  public on<E extends InputEvent>(event: E, callback: InputCallbacks[E]) {
    this.callbacks.set(event, callback);
  }
}
