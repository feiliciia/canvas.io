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

export class Sfx {
  muted: boolean;
  context: AudioContext;
  buffers: Map<string, AudioBuffer>;

  constructor() {
    this.muted = $state(false);
    this.context = new AudioContext();
    this.buffers = new Map();

    this.context.resume();
  }

  async initialize() {
    for (const [_, urls] of sounds) {
      for (const url of urls) {
        const response = await fetch(url);
        const array = await response.arrayBuffer();
        const buffer = await this.context.decodeAudioData(array);
        this.buffers.set(url, buffer);
      }
    }
  }

  play(sound: Sound, volume: number = 1.0) {
    if (this.muted) {
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
