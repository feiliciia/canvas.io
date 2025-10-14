const clients: WebSocket[] = [];
const world: { cells: number[] } = {
  cells: [0],
};

setInterval(() => {
  for (let i = 0; i < world.cells.length; i += 1) {
    world.cells[i] += 1;
  }

  for (const client of clients) {
    client.send(JSON.stringify(world));
  }
}, 1000);

const options: Deno.ServeTcpOptions = {
  port: 80,
};

Deno.serve(options, (req: Request) => {
  if (req.headers.get("upgrade") !== "websocket") {
    return new Response("you must connect on a websocket!!!!!", { status: 426 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  socket.onopen = () => {
    console.log("some person connected to our server!");
    clients.push(socket);
  };

  socket.onclose = () => {
    console.log("person disconnected.");
    const index = clients.indexOf(socket);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  };

  return response;
});
