import type { Renderer } from "./view/renderer.ts";
import type { WorldConfig } from "./world/world.ts";
import { World } from "./world/world.ts";
import { Audio } from "./io/audio.ts";
import { Input } from "./io/input.ts";
import { Camera } from "./view/camera.ts";
import { Food } from "./world/food.ts";
import { Virus } from "./world/virus.ts";
import { Player } from "./world/player.ts";
import { EventManager, randomColor, randomName, textureColor } from "./utilities.ts";

export const enum GameEvent {
  Join,
  Kill,
}

export type GameEventMap = {
  [GameEvent.Join]: [[player: Player], void];
  [GameEvent.Kill]: [[killer: Player, killed: Player], void];
};

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

  public events: EventManager<GameEvent, GameEventMap>;

  public renderer?: Renderer;
  public world?: World;

  public constructor() {
    this.settings = Settings.load();
    this.audio = new Audio();
    this.input = new Input();
    this.camera = new Camera();
    this.events = new EventManager();
  }

  // simulate loading the world from a server
  // deno-lint-ignore require-await
  public async loadWorld() {
    const config: WorldConfig = {
      id: "fart",
      size: 2000,
      mergeCooldown: 10,
      maxCellsPerPlayer: 16,
    };

    const world = new World(config);
    world.foods = Array.from({ length: 256 }, () => Food.random(world));
    world.viruses = Array.from({ length: 8 }, () => Virus.random(world));
    world.players = [];

    this.world = world;
  }

  // deno-lint-ignore require-await
  public async spawnPlayer(): Promise<Player | undefined> {
    if (!this.world) {
      return;
    }

    const size = this.world.config.size;
    const x = -size / 2 + Math.random() * size;
    const y = -size / 2 + Math.random() * size;
    const mass = 1000 + Math.random() * 10000;

    const player = new Player(this.world, x, y, mass, textureColor(randomColor()), randomName());

    this.world.players.push(player);
    this.events.emit(GameEvent.Join, player);

    return player;
  }
}

export const game: Game = new Game();
