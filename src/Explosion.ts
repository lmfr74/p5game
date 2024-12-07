import p5 from "p5";
import Game from "./Game";
import Component from "./Component";

export default class Explosion extends Component {
  private size: number;
  private alpha: number = 255;
  private color!: p5.Color;

  constructor(game: Game, position: p5.Vector, size: number) {
    super(game);
    this.position = position;
    this.size = size;
  }

  setup() {
    super.setup(undefined, this.position);
    this.color = this.p5.color(
      this.p5.random(["red", "coral", "tomato", "yellow", "orange"])
    );
  }

  update() {
    this.size += 3;
    this.alpha -= 6;
    this.color.setAlpha(this.alpha);
    if (this.alpha <= 0) this.game.onDead(this);
  }

  render() {
    this.p5.push();
    this.p5.noStroke();
    this.p5.fill(this.color);
    this.p5.ellipse(this.position.x, this.position.y, this.size);
    this.p5.pop();
  }
}
