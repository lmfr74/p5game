import Game from "./Game";
import Missile from "./Missile";

// Mine missile behaviour.
export default class MineMissile extends Missile {
  constructor(game: Game) {
    const color = game.p5.color("yellow");
    super(
      game,
      color,
      Math.min(game.level + 2, game.settings.mineMissileMaxSpeed),
      game.settings.mineMissileMaxAge
    );
  }
}
