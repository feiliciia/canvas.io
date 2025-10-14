import { game } from "../game.svelte.ts";

export const enum Sound {
  Split,
  Eat,
  Merge,
}

const sounds: Map<Sound, string[]> = new Map([
  [Sound.Split, [
    "/sounds/split1.ogg",
    "/sounds/split2.ogg",
    "/sounds/split3.ogg",
    "/sounds/split4.ogg",
  ]],
  [Sound.Eat, [
    "/sounds/eat1.ogg",
    "/sounds/eat2.ogg",
    "/sounds/eat3.ogg",
    "/sounds/eat4.ogg",
    "/sounds/eat5.ogg",
  ]],
  [Sound.Merge, [
    "/sounds/merge1.ogg",
    "/sounds/merge2.ogg",
    "/sounds/merge3.ogg",
    "/sounds/merge4.ogg",
  ]],
]);

function randomSound(sound: Sound): string {
  const urls = sounds.get(sound)!;
  return urls[~~(Math.random() * urls.length)];
}

export class Audio {
  private context: AudioContext;
  private buffers: Map<string, AudioBuffer>;

  public constructor() {
    this.context = new AudioContext();
    this.buffers = new Map();
    this.context.resume();
  }

  public async load() {
    for (const url of sounds.values().flatMap((urls) => urls)) {
      const response = await fetch(url);
      const array = await response.arrayBuffer();
      const buffer = await this.context.decodeAudioData(array);
      this.buffers.set(url, buffer);
    }
  }

  public play(sound: Sound, volume: number = 1.0) {
    if (game.settings.muted) {
      return;
    }

    const buffer = this.buffers.get(randomSound(sound));

    if (!buffer) {
      return;
    }

    const src = this.context.createBufferSource();
    src.buffer = buffer;

    const gain = this.context.createGain();
    gain.gain.value = volume;

    src.connect(gain).connect(this.context.destination);
    src.start();
  }
}
