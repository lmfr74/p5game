import p5 from "p5";
import Game from "./Game";
import Component from "./Component";

// Game sprites from https://opengameart.org/content/set-faction5-spaceships

// Represents the player object (principal game actor).
export default class Player extends Component {
  missileAt!: p5.Vector;

  private readonly MOVE_SPEED = 0.01;
  private readonly TURN_SPEED = this.MOVE_SPEED * 5;
  private readonly MAX_ENERGY: number = 5;
  private readonly ALERT_FREQ: number = 0.01;

  private dx!: number;
  private dy!: number;
  private angle: number = 0;
  private alert: number = 0;
  private damage: number = 0;
  private maxShield: number = 0;

  constructor(game: Game) {
    super(game);
  }

  preload() {
    // Load a random sprite
    const i = Math.floor(this.p5.random(this.game.settings.sprites.length));
    this.sprite = this.p5.loadImage(this.game.settings.sprites[i]);
  }

  setup() {
    // Set the player position to the center of the screen
    this.position = this.p5.createVector(this.p5.width / 2, this.p5.height / 2);
    this.value = this.energy = this.MAX_ENERGY;
    this.shield = this.maxShield = this.game.settings.playerShieldMaxAge;
    if (this.sprite) {
      this.sprite.resize(64, 0);
      this.dx = this.sprite.width / 2;
      this.dy = this.sprite.height / 2;
    }
  }

  update() {
    // Move and turn into the mouse position (target)
    const target = this.p5.createVector(this.p5.mouseX, this.p5.mouseY);
    // Calculate the next position using lerp
    const nextPosition = this.position.copy().lerp(target, this.MOVE_SPEED);
    // Calculate the velocity vector from the current position to the next position
    this.velocity = p5.Vector.sub(nextPosition, this.position);
    // Update the position
    this.position.add(this.velocity);
    // Lerp to the target angle
    this.angle = this.p5.angleLerp(
      this.angle,
      this.velocity.heading(),
      this.TURN_SPEED
    );

    // Calculate missileAt position relative to the center and rotate it
    this.missileAt = this.position
      .copy()
      .add(this.dx, 0)
      .sub(this.position)
      .rotate(this.angle)
      .add(this.position);

    // Calculate damage based on energy level
    this.damage = this.value - this.energy;
    if (this.damage) {
      // Alert frequency is based on damage
      let af = this.ALERT_FREQ * this.damage;
      // If energy is 1 (min), alert frequency is the fastest
      if (this.energy === 1) af *= 3;

      this.alert += af;
      if (this.alert >= 1) this.alert = 0;
    } else {
      // Reset alert
      this.alert = 0;
    }

    // Update shield
    if (this.shield > 0) this.shield--;
  }

  render() {
    // Render the player sprite considering the position, angle, and alert level
    if (this.sprite) {
      this.p5.push();
      this.p5.translate(this.position.x, this.position.y);
      this.p5.rotate(this.angle + this.p5.HALF_PI);
      // Draw engine
      const engineAlpha = this.p5.random(20, 200) + this.velocity.mag();
      const ex = 15 + this.p5.random(-2, 2);
      const ey = 30 + this.p5.random(-5, 5) + this.velocity.mag() * 5;
      this.p5.noStroke();
      this.p5.fill(255, 64, 0, engineAlpha);
      this.p5.ellipse(0, this.dy, ex, ey);
      // Draw alert
      if (this.damage) {
        const alpha = (255 - (255 * this.energy) / this.value) * this.alert;
        const r = 1.3 * this.sprite.height * this.alert;
        this.p5.stroke(255, 0, 0, 200);
        this.p5.strokeWeight(this.energy - 1);
        this.p5.fill(255, 0, 0, alpha);
        this.p5.arc(0, 0, r, r, 0, this.p5.TWO_PI);
      }
      // Draw shield
      if (this.shield) {
        const alpha = this.p5.map(this.shield, this.maxShield, 0, 160, 32);
        const r = 1.3 * this.sprite.height + this.alert;
        this.p5.fill(0, 0, 255, alpha);
        this.p5.arc(0, 0, r, r, 0, this.p5.TWO_PI);
      }
      // Draw player sprite
      this.p5.image(this.sprite, -this.dx, -this.dy);
      // Draw shield text (topmost)
      if (this.shield) {
        const seconds = Math.floor(this.shield / this.p5.frameRate()) + 1;
        this.p5.textAlign(this.p5.CENTER, this.p5.CENTER);
        this.p5.fill("white");
        this.p5.text(seconds, 0, 0);
      }
      this.p5.pop();
    }
  }

  hit() {
    // Reduce energy level, check alert, and game over
    this.energy--;
    if (this.energy === 1) this.game.onAlert();
    else if (this.energy === 0) this.game.onDead(this);
  }

  boundingBox(): p5.Vector[] {
    // Calculate the bounding box of the player sprite (rectangle does not consider rotation)
    return [
      this.p5.createVector(
        this.position.x - this.dx,
        this.position.y - this.dy
      ),
      this.p5.createVector(
        this.position.x + this.dx,
        this.position.y + this.dy
      ),
    ];
  }
}
