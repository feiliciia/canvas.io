import type { Renderer } from "./view/renderer.ts";
import type { World } from "./world/world.ts";
import { Audio } from "./io/audio.ts";
import { Input } from "./io/input.ts";
import { Camera } from "./view/camera.ts";

export class Settings {
  public muted: boolean;
  public name: string;

  private constructor() {
    this.muted = $state(false);
    this.name = $state("");
  }

  public static load(): Settings {
    const loadedSettings = localStorage.getItem("settings");

    // check if we have settings already
    if (!loadedSettings) {
      // if not, return default settings
      return new Settings();
    } else {
      // otherwise, parse and return the existing settings
      const json = JSON.parse(loadedSettings);

      // use neat little trick to populate a class object from a basic object
      return Object.assign(new Settings(), json);
    }
  }

  public save() {
    localStorage.setItem(
      "settings",
      JSON.stringify({
        muted: this.muted,
        name: this.name,
      }),
    );
  }
}

export class Game {
  public readonly settings: Settings;
  public readonly audio: Audio;
  public readonly input: Input;
  public readonly camera: Camera;
  public renderer?: Renderer;
  public world?: World;

  public constructor() {
    this.settings = Settings.load();
    this.audio = new Audio();
    this.input = new Input();
    this.camera = new Camera();
  }
}

export const game: Game = new Game();
