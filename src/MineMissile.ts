import Game from "./Game";
import Missile from "./Missile";

// Mine missile behaviour.
export default class MineMissile extends Missile {
  constructor(game: Game) {
    const color = game.p5.color("yellow");
    super(
      game,
      color,
      game.settings.mineMissileSpeed[game.level - 1],
      game.settings.mineMissileMaxAge[game.level - 1]
    );
  }
}
