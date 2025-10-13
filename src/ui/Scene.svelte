<script module lang="ts">
  export type Global = {
    width: number;
    height: number;
    canvas?: HTMLCanvasElement;
    renderer?: Renderer;
    world?: World;
    localPlayer?: Player;
  };
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import { World } from "../game/world.svelte";
  import { Renderer } from "../game/renderer";
  import { Player } from "../game/player";

  let global: Global = $state({
    width: 0,
    height: 0,
  });

  export { global };

  function onmousemove(event: MouseEvent) {
    if (!global.renderer || !global.world || !global.localPlayer) {
      return;
    }

    let { width, height, canvas, localPlayer } = global;

    for (const cell of localPlayer.cells) {
      cell.tx = canvas!.clientLeft + event.x - 0.5 * width;
      cell.ty = canvas!.clientTop + event.y - 0.5 * height;
    }
  }

  function onkeydown(event: KeyboardEvent) {
    if (!global.renderer || !global.world || !global.localPlayer) {
      return;
    }

    switch (event.code) {
      case "Space":
        global.localPlayer.split();
        break;
    }
  }

  onMount(async () => {
    const context = global.canvas!.getContext("2d")!;

    global.renderer = new Renderer(global.canvas!, context);
    global.world = await World.loadFromServer();

    let { renderer, world } = global;
    let last = 0;

    global.localPlayer = await world.spawnPlayer();
    renderer.camera.target = global.localPlayer;

    function frame(time: number) {
      requestAnimationFrame(frame);

      const delta = time - last;
      last = time;

      world.process(renderer, delta);
      world.draw(renderer);
    }

    requestAnimationFrame(frame);
  });
</script>

<svelte:window {onkeydown}></svelte:window>

<canvas
  bind:this={global.canvas}
  bind:clientWidth={global.width}
  bind:clientHeight={global.height}
  width={global.width}
  height={global.height}
  {onmousemove}
  class="absolute w-screen h-screen bg-[#F2FBFF] cursor-crosshair"
>
</canvas>
