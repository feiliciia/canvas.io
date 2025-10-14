<script lang="ts">
  import Overlay from "../lib/ui/Overlay.svelte";
  import { InputEvent } from "../lib/io/input";
  import { onMount } from "svelte";
  import { game } from "../lib/game.svelte";
  import { World } from "../lib/world/world";
  import { Renderer } from "../lib/view/renderer";
  import { Sound } from "$lib/io/audio";
  import { Center } from "$lib/view/camera";

  let canvas: HTMLCanvasElement | undefined = $state();
  let width = $state(0);
  let height = $state(0);

  function onbeforeunload() {
    game.settings.save();
  }

  $effect(() => {
    game.camera.width = width;
    game.camera.height = height;
  });

  onMount(async () => {
    await game.audio.load();

    game.renderer = new Renderer(canvas!);
    game.world = await World.loadFromServer();
    game.world.localPlayer = await game.world.spawnPlayer();
    game.camera.target = game.world.localPlayer;

    // lisa: uncomment this !!! :D Lol
    // let i = 0;
    // setInterval(() => {
    //   game.camera.target = i % 2 === 0 ? game.world!.localPlayer! : new Center();
    //   i += 1;
    // }, 2000);

    // FIXME: rebrand tx/ty!
    game.input.on(InputEvent.Move, (x: number, y: number) => {
      const renderer = game.renderer!;
      const localPlayer = game.world!.localPlayer!;

      for (const cell of localPlayer.cells) {
        cell.tx = (renderer.canvas.clientLeft + x - 0.5 * renderer.canvas.width) * game.camera.zoomInverse;
        cell.ty = (renderer.canvas.clientTop + y - 0.5 * renderer.canvas.height) * game.camera.zoomInverse;
      }
    });

    game.input.on(InputEvent.Zoom, (delta: number) => {
      game.camera.zoomUser(delta);
    });

    game.input.on(InputEvent.Split, () => {
      const success = game.world?.localPlayer?.split(game.world);
      if (success) {
        game.audio.play(Sound.Split, 0.6);
      }
    });

    game.input.on(InputEvent.Eject, () => {
      // TODO: eject a small piece out of all eligible cells!
    });

    /* was testing independent updates... it went wrong... :(
    setInterval(() => {
      game.world!.update(1000 / 60);
    }, 1000 / 60);
    */

    requestAnimationFrame(game.renderer.frame.bind(game.renderer));
  });
</script>

<svelte:window
  onwheel={game.input.onwheel.bind(game.input)}
  onkeydown={game.input.onkeydown.bind(game.input)}
  onkeyup={game.input.onkeyup.bind(game.input)}
  {onbeforeunload}
></svelte:window>

<Overlay></Overlay>

<canvas
  bind:this={canvas}
  bind:clientWidth={width}
  bind:clientHeight={height}
  onmousemove={game.input.onmousemove.bind(game.input)}
  {width}
  {height}
  class="absolute w-screen h-screen bg-[#F2FBFF] cursor-crosshair"
  oncontextmenu={(event: MouseEvent) => event.preventDefault()}
>
</canvas>
