import type { Drawable } from "./common.ts";
import { Blob } from "./blob.ts"; //hello
import { Renderer } from "./renderer.ts";

export class Player implements Drawable {
  blobs: Blob[];
  color: string;
  name: string;

  constructor(color: string, name: string) {
    const blob = Blob.random();
    const blob2 = Blob.random();
    blob.color = color;
    blob.name = name;
    blob.radius = 20;

    blob2.color = color;
    blob2.name = name;
    blob2.radius = 40;

    this.blobs = [blob, blob2];
    this.color = color;
    this.name = name;
  }

  draw(renderer: Renderer) {
    for (const blob of this.blobs) {
      blob.draw(renderer);
    }
    // ctx.fillStyle = "#ffffff";
    // ctx.strokeStyle = "black";
    // ctx.font = "30px Comic Sans MS";
    // ctx.textAlign = "center";
    // ctx.textBaseline = "middle";
    // ctx.fillText(this.name, width / 2, height / 2);
    // ctx.strokeText(this.name, width / 2, height / 2);
  }

  //TODO: read it when you are waken up. please
  //   split() {
  //     const newBlobs = [];

  //     for (const blob of this.blobs) {
  //       const mass = Math.PI * blob.radius * blob.radius;

  //       if (mass > 100) {
  //         blob.radius = Math.sqrt((mass / 2) / Math.PI);
  //         newBlobs.push(blob);
  //       }
  //     }

  //     for (const newBlob of newBlobs) {
  //       this.blobs.push(newBlob.clone());//will be created the clone() method!!!
  //     }
  //   }
}
