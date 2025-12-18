import { Player } from "./player";

export class Camera {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  calculatePosition(player: Player) {
    const averageX = player.blobs.reduce((accumulator, blob) => accumulator + blob.x, 0) / player.blobs.length; //adding to the 0 the blob.x and so on, hi ernest
    const averageY = player.blobs.reduce((accumulator, blob) => accumulator + blob.y, 0) / player.blobs.length; //for y, same

    this.x = averageX;
    this.y = averageY;
  }
}
