export type Hsl = [number, number, number];
export type Color = { kind: "color"; hslFill: Hsl; hslOutline: Hsl; fill: string; outline: string };
export type Image = { kind: "image"; src: string };

// blobs can have a solid color or an image
export type Texture = Color | Image;

const colors: Hsl[] = [
  [10.588, 1.000, 0.600],
  [229.412, 1.000, 0.600],
  [48.053, 0.889, 0.502],
  [282.581, 0.389, 0.532],
  [28.163, 0.797, 0.518],
  [168.148, 0.757, 0.419],
  [330.909, 0.782, 0.586],
  [145.443, 0.633, 0.490],
  [204.072, 0.699, 0.531],
];

const names: string[] = [
  "Aiko",
  "Mateo",
  "Zainab",
  "Luca",
  "Nikhil",
  "Sofia",
  "Yara",
  "Dmitri",
  "Mei",
  "Omar",
  "Hana",
  "Thiago",
  "Priya",
  "Leif",
  "Amara",
  "Sergei",
  "Fatima",
  "Andrej",
  "Imani",
  "Jae",
  "Eitan",
  "Noa",
  "Bea",
  "Kofi",
  "Mirela",
  "Selim",
  "Astrid",
  "Rui",
  "Sanaa",
  "Akira",
  "Carmen",
  "Diego",
  "Lale",
  "Nura",
  "Yasmin",
  "Arun",
  "Igor",
  "Lúcia",
  "Pavel",
  "Sora",
  "Tariq",
  "Zofia",
  "Keita",
  "Maja",
  "Nabila",
  "Enzo",
  "Amina",
  "Farid",
  "Greta",
  "Haru",
  "Ines",
  "Jakub",
  "Kasia",
  "Leila",
  "Milo",
  "Niko",
  "Óscar",
  "Paola",
  "Qi",
  "Rania",
  "Santi",
  "Tarek",
  "Uma",
  "Valeria",
  "Wen",
  "Xiang",
  "Youssef",
  "Zahra",
  "Bo",
  "Chen",
  "Daria",
  "Elif",
  "Farah",
  "Giorgi",
  "Hyejin",
  "Ivana",
  "Jiro",
  "Kamila",
  "Lior",
  "Miloš",
  "Nandini",
  "Oksana",
  "Petar",
  "Qamar",
  "Riko",
  "Sana",
  "Timur",
  "Ugo",
  "Vanya",
  "Wiktor",
  "Xia",
  "Yuna",
  "Zoran",
  "Aditya",
  "Bruna",
  "Ciro",
  "Dimas",
  "Ewa",
  "Femi",
  "Gita",
];

export function textureColor([h, s, l]: Hsl): Color {
  const lOutline = Math.max(l - 0.1, 0);
  return {
    kind: "color",
    hslFill: [h, s, l],
    hslOutline: [h, s, lOutline],
    fill: `hsl(${h}deg, ${s * 100}%, ${l * 100}%)`,
    outline: `hsl(${h}deg, ${s * 100}%, ${lOutline * 100}%)`,
  };
}

export function textureImage(src: string): Image {
  return {
    kind: "image",
    src,
  };
}

// too laggy...
// const emojies = [..."😊😂🤣❤️😍😒👌😘💕😁👍🙌😟😤😢😭😦😧😨😩🤯😬😮‍💨😰"];
export function randomName(): string {
  // ${emojies[~~(Math.random() * emojies.length)]}
  return `${names[~~(Math.random() * names.length)]}`;
}

export function massToRadius(mass: number): number {
  return Math.sqrt(mass / Math.PI);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function randomColor(): Hsl {
  return colors[~~(Math.random() * colors.length)];
}

export class Animated<T> {
  #current: T;

  public get current() {
    return this.#current;
  }

  private target: T;
  private onTick: (current: T, target: T) => T;

  public constructor(init: T, onTick: (current: T, target: T) => T) {
    this.#current = init;
    this.target = init;
    this.onTick = onTick;
  }

  public get(): T {
    return this.current;
  }

  public set(target: T): this {
    this.target = target;
    return this;
  }

  public tick(): T {
    this.#current = this.onTick(this.#current, this.target);
    return this.#current;
  }
}

type Key = string | number | symbol;

export class TypedMap<K0 extends Key, M extends Record<K0, unknown>> extends Map<K0, M[K0]> {
  public override get<K1 extends K0>(key: K1): M[K1] | undefined {
    return super.get(key) as M[K1] | undefined;
  }

  public override set<K1 extends K0>(key: K1, value: M[K1]): this {
    return super.set(key, value);
  }
}

type Event = Key;
type ArgsMap<E extends Event> = Record<E, [unknown[], unknown]>;

export type Args<E extends Event, M extends ArgsMap<E>> = [[...M[E][0]], M[E][1]];
export type Callback<E extends Event, M extends ArgsMap<E>> = (...args: Args<E, M>[0]) => Args<E, M>[1];

export class EventManager<E extends Event, M extends ArgsMap<E>> extends Map<E, Callback<E, M>> {
  public on<EV extends E>(event: EV, callback: Callback<EV, M>): this {
    return this.set(event, callback);
  }

  public emit<EV extends E>(event: EV, ...args: Args<EV, M>[0]): Args<EV, M>[1] | undefined {
    return this.get(event)?.(...args);
  }
}
