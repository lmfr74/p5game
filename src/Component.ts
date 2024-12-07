import p5 from "p5";
import Game from "./Game";

export default class Component {
  game: Game;
  p5: p5;
  position: p5.Vector;
  velocity: p5.Vector;
  sprite?: p5.Image;
  value: number = 0;
  energy: number = 0;

  protected constructor(game: Game) {
    this.game = game;
    this.p5 = game.p5;
    this.position = this.p5.createVector(0, 0);
    this.velocity = this.p5.createVector(0, 0);
  }

  setup(sprite?: p5.Image, position?: p5.Vector, velocity?: p5.Vector) {
    // override for setting up
    if (sprite) this.sprite = sprite;
    if (position) this.position.set(position);
    if (velocity) this.velocity.set(velocity);
  }

  update() {
    // override for updating
  }

  render() {
    // override for rendering
  }

  hit() {
    // override for handling hit
  }

  boundingBox(): p5.Vector[] {
    // override the component bounding box - return an array with two vectors: [top-left, bottom-right]
    return [this.position.copy(), this.position.copy()];
  }

  intercepts(component: Component): boolean {
    // override for collision detection
    const box1 = this.boundingBox();
    const box2 = component.boundingBox();

    if (box1.length < 2 || box2.length < 2) {
      return false;
    }
    const [box1Min, box1Max] = box1;
    const [box2Min, box2Max] = box2;

    return (
      box1Min.x < box2Max.x &&
      box1Max.x > box2Min.x &&
      box1Min.y < box2Max.y &&
      box1Max.y > box2Min.y
    );
  }
}
