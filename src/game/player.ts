import type { Drawable } from "./common.ts";
import { Blob } from "./blob.ts"; //hello
import { Renderer } from "./renderer.ts";

export class Player implements Drawable {
  blobs: Blob[];
  color: string;
  name: string;
  //leader?: boolean;

  constructor(color: string, name: string) {
    const blob = Blob.random();
    const blob2 = Blob.random();
    blob.color = color;
    blob.name = name;
    blob.radius = 20;
    //blob.leader = true;

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

  split() {
    const newBlobs = [];

    for (const blob of this.blobs) {
      const mass = Math.PI * blob.radius * blob.radius;

      if (mass > 1000) {
        blob.radius = Math.sqrt((mass / 2) / Math.PI);
        newBlobs.push(blob);
      }
    }

    for (const newBlob of newBlobs) {
      this.blobs.push(newBlob.clone());
    }
  }

  collision() {
    for (let i = 0; i < this.blobs.length; i++) {
      for (let j = i + 1; j < this.blobs.length; j++) {
        //omg wow math wooooooooooooooow
        //distance between coordinates of the center
        const distX = this.blobs[j].x - this.blobs[i].x;
        const distY = this.blobs[j].y - this.blobs[i].y;
        //dist vector
        const dist = Math.hypot(distX, distY);
        //console.log(dist);

        const minDist = this.blobs[i].radius + this.blobs[j].radius + 1;

        if (dist < minDist) {
          //this thing makes blobs shaking, weird
          //this.blobs[j].x = minDist-this.blobs[j].x
          //this.blobs[j].y = minDist-this.blobs[j].y

          //vectors using, so can see the dirrectory and not jumping - separating😀
          const nx = distX * (minDist - dist) / (dist * 2);
          const ny = distY * (minDist - dist) / (dist * 2);

          this.blobs[j].x += nx;
          this.blobs[j].y += ny;

          this.blobs[i].x -= nx;
          this.blobs[i].y -= ny;
        }
      }
    }
  }

  //TODO: do the border for the blobs, not sure if here or in the blob/player
  //do it with 2 for loops like:
  //for(){
  //  for(){
  //    const mindist = blob.radious+10?
  //      distx = blobB.x - blobA.x
  //      disty = blobB.y - blobA.y
  //      Math.hoypot(distx,disty);
  //      if(dist<=mindist){
  //        blobB.x=mindist-blobB.x
  //        blobB.y=mindist-blobB.y
  //      }
  //     }
  //  }
  //idk something like this, but can maybe use clamp for that????but how. put the function in a clamp and then use it, but where.
}
