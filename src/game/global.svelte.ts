import { Player } from "./player.svelte.ts";
import { Renderer } from "./renderer.ts";
import { Sfx } from "./sfx.svelte.ts";
import { World } from "./world.svelte.ts";

export type Global = {
  width: number;
  height: number;
  sfx: Sfx;
  keys: Map<string, boolean>;
  canvas?: HTMLCanvasElement;
  renderer?: Renderer;
  world?: World;
  localPlayer?: Player;
};

export const global: Global = $state({
  width: 0,
  height: 0,
  sfx: new Sfx(),
  keys: new Map(),
});
