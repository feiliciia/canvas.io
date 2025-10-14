import { clamp } from "../utilities.ts";

export type KeyboardCallback = (event: KeyboardEvent) => void;
export type InputCallback = () => void;

export type KeyCode = string;

export const enum InputEvent {
  Zoom,
  Move,
  Eject,
  Split,
}

type InputEventMap = {
  [InputEvent.Zoom]: (delta: number) => void;
  [InputEvent.Move]: (x: number, y: number) => void;
  [InputEvent.Eject]: () => void;
  [InputEvent.Split]: () => void;
};

type Callback<E extends InputEvent> = InputEventMap[E];

// deno-lint-ignore no-unused-vars
class CallbackMap extends Map<InputEvent, InputEventMap[InputEvent]> {
  override get<E extends InputEvent>(event: E): InputEventMap[E] | undefined {
    return super.get(event) as InputEventMap[E] | undefined;
  }

  override set<E extends InputEvent>(event: E, callback: InputEventMap[E]): this {
    return super.set(event, callback);
  }
}

export class Input {
  private callbacks: CallbackMap;
  private keystates: Map<KeyCode, boolean>;
  private keybinds: Map<KeyCode, InputEvent>;

  private mouseX: number;
  private mouseY: number;

  public constructor() {
    this.callbacks = new Map();
    this.keystates = new Map();
    this.keybinds = new Map([
      ["Space", InputEvent.Split],
      ["KeyW", InputEvent.Eject],
    ]);

    this.mouseX = 0;
    this.mouseY = 0;
  }

  public onmousemove(e: MouseEvent) {
    this.callbacks.get(InputEvent.Move)?.(e.x, e.y);
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

  public on<E extends InputEvent>(event: E, callback: Callback<E>) {
    this.callbacks.set(event, callback);
  }
}
