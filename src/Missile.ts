import Game from "./Game";
import Component from "./Component";
import p5 from "p5";

// Base missile behaviour.
export default class Missile extends Component {
  private readonly MAX_ENERGY: number = 1;

  private color: p5.Color;
  private speed: number;
  private maxAge: number;

  private age: number = 0;

  constructor(game: Game, color: p5.Color, speed: number, maxAge: number) {
    super(game);
    this.color = color;
    this.speed = speed;
    this.maxAge = maxAge;
  }

  setup(sprite?: p5.Image, position?: p5.Vector, velocity?: p5.Vector) {
    super.setup(sprite, position, velocity);
    if (this.velocity.mag() < this.speed) {
      this.velocity.setMag(this.speed);
    }
    this.value = this.energy = this.MAX_ENERGY;
  }

  update() {
    // Update the missile position and age. If the missile expired, remove it.
    this.position.add(this.velocity);
    this.age++;
    if (this.age > this.maxAge) this.game.onDead(this);
  }

  render() {
    this.p5.push();
    this.p5.fill(this.color);
    this.p5.circle(this.position.x, this.position.y, 6);
    this.p5.pop();
  }

  hit() {
    // The missile is destroyed when it hits something.
    this.game.onDead(this);
  }
}
