<script lang="ts">
  import { onMount } from "svelte";

  import Overlay from "$lib/ui/Overlay.svelte";
  import { InputEvent } from "$lib/io/input";
  import { Renderer } from "$lib/view/renderer";
  import { PlayerAction } from "$lib/world/player";
  import { game } from "$lib/game.svelte";

  let overlay: Overlay | undefined = $state();
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
    game.renderer = new Renderer(canvas!);

    await game.audio.load();
    await game.loadWorld();

    game.world!.localPlayer = await game.spawnPlayer();
    game.camera.target = game.world!.localPlayer!;

    // lisa: uncomment this !!! :D Lol
    // let i = 0;
    // setInterval(() => {
    //   game.camera.target = i % 2 === 0 ? game.world!.localPlayer! : new Center();
    //   i += 1;
    // }, 2000);

    setInterval(async () => {
      if (game.world!.players.length >= 500 || game.world!.players.filter((player) => player.alive).length >= 50) {
        return;
      }

      const player = await game.spawnPlayer();

      setInterval(() => {
        const size = game.world?.config.size ?? 0;
        const x = -size / 2 + Math.random() * size;
        const y = -size / 2 + Math.random() * size;
        player?.action(PlayerAction.Target, { x, y });
      }, 100 + Math.random() * 1000);

      setInterval(() => {
        player?.action(PlayerAction.Split, undefined);
      }, 1000 + Math.random() * 1000);
    }, 50);

    game.input.on(InputEvent.Target, (x: number, y: number) => {
      game.world?.localPlayer?.action(PlayerAction.Target, { x, y });
    });

    game.input.on(InputEvent.Zoom, (delta: number) => {
      game.camera.updateZoom(delta);
    });

    game.input.on(InputEvent.Split, () => {
      game.world?.localPlayer?.action(PlayerAction.Split, undefined);
    });

    game.input.on(InputEvent.Eject, () => {
      // TODO: eject a small piece out of all eligible cells!
    });

    const TPS: number = 144;

    setInterval(() => {
      game.world!.update(1000 / TPS);
      overlay?.update(game.world!, game.camera);
    }, 1000 / TPS);

    requestAnimationFrame(game.renderer.frame.bind(game.renderer));
  });
</script>

<svelte:window
  onwheel={game.input.onwheel.bind(game.input)}
  onkeydown={game.input.onkeydown.bind(game.input)}
  onkeyup={game.input.onkeyup.bind(game.input)}
  {onbeforeunload}
></svelte:window>

<Overlay bind:this={overlay}></Overlay>

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
