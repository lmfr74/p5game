import p5 from "p5";
import Game from "./Game";
import Component from "./Component";

// Mine behaviour.
export default class Mine extends Component {
  private noiseOffsetX: number;
  private noiseOffsetY: number;
  private vx: number;
  private vy: number;
  private color: p5.Color;
  private damage: number = 0;
  private size: number;
  private minSize: number;

  constructor(game: Game, value: number) {
    super(game);
    this.noiseOffsetX = this.p5.random(Date.now());
    this.noiseOffsetY = this.p5.random(Date.now());
    this.vx = this.p5.map(this.p5.random(), 0, 1, -1, 1);
    this.vy = this.p5.map(this.p5.random(), 0, 1, -1, 1);
    this.value = this.energy = value;
    this.color = this.p5.color(this.p5.map(this.energy, 1, 7, 255, 128));
    this.size = this.minSize = this.game.settings.mineMinSize;
  }

  setup() {
    // Set the mine random position and velocity.
    super.setup(
      undefined,
      this.p5.createVector(
        this.p5.random(this.p5.width),
        this.p5.random(this.p5.height)
      ),
      this.p5.createVector(this.vx, this.vy)
    );
  }

  update() {
    // Update the mine position and size/velocity based on the energy level.
    this.damage = this.value - this.energy;
    this.size = this.minSize + this.energy * 3;

    // Move the mine using Perlin noise.
    this.noiseOffsetX += 0.01;
    this.noiseOffsetY += 0.01;
    const nx = this.p5.noise(this.noiseOffsetX);
    const ny = this.p5.noise(this.noiseOffsetY);

    if (this.position.x < 0 || this.position.x > this.p5.width) {
      this.vx *= -1;
    }
    if (this.position.y < 0 || this.position.y > this.p5.height) {
      this.vy *= -1;
    }

    this.velocity.x = (this.energy + 1) * this.vx * nx;
    this.velocity.y = (this.energy + 1) * this.vy * ny;

    this.position.add(this.velocity);
  }

  render() {
    // Draw the mine with a stroke that changes color based on the energy level.
    this.p5.push();
    if (this.damage) {
      this.p5.stroke("red");
      const red = this.p5.map(this.energy, this.value, 0, 0, 255);
      this.color.setRed(red);
      this.color.setGreen(0);
      this.color.setBlue(0);
    } else {
      this.p5.stroke(0, 0, 0, 160);
    }
    // The mine size is based on the energy level.
    this.p5.fill(this.color);
    this.p5.strokeWeight(this.energy - 1);
    this.p5.circle(this.position.x, this.position.y, this.size);
    this.p5.pop();
  }

  hit() {
    // Reduce the mine energy level. If the energy level is 0, the mine is dead.
    if (this.energy === 0) this.game.onDead(this);
    else {
      this.energy--;
      if (this.energy > 0) {
        // If the mine has energy, fire and choose other random mine to fire missile at player.
        this.game.fireMineMissile(this);
        this.game.fireRandomMineMissile();
      }
    }
  }

  boundingBox(): p5.Vector[] {
    // Bounding box is a square based on the mine radius.
    const r = this.size / 2;
    return [
      this.p5.createVector(this.position.x - r, this.position.y - r),
      this.p5.createVector(this.position.x + r, this.position.y + r),
    ];
  }
}
