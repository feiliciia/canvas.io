<script lang="ts">
  import Overlay from "./Overlay.svelte";
  import { onMount } from "svelte";
  import { World } from "../game/world.svelte";
  import { Renderer } from "../game/renderer";
  import { Sound } from "../game/sfx.svelte";
  import { global } from "../game/global.svelte";
  import { clamp } from "../game/common";

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

    if (global.keys.get(event.code) === true) {
      return;
    }

    switch (event.code) {
      case "Space":
        event.preventDefault();
        global.localPlayer.split(global);
        break;
    }

    global.keys.set(event.code, true);
  }

  function onwheel(event: WheelEvent) {
    global.renderer?.camera.onWheel(clamp(event.deltaY, -1, 1));
  }

  function onkeyup(event: KeyboardEvent) {
    global.keys.set(event.code, false);
  }

  onMount(async () => {
    await global.sfx.initialize();

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

      renderer.delta = delta;
      renderer.context.save();
      world.process(global, delta);
      world.draw(renderer);
      renderer.context.restore();
    }

    requestAnimationFrame(frame);
  });

  export { global };
</script>

<svelte:window {onkeydown} {onkeyup} {onwheel}></svelte:window>

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

<Overlay></Overlay>
