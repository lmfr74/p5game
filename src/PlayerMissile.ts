import Game from "./Game";
import Missile from "./Missile";

// Player missile behaviour.
export default class PlayerMissile extends Missile {
  constructor(game: Game) {
    const color = game.p5.color("red");
    super(
      game,
      color,
      game.settings.playerMissileSpeed[game.level - 1],
      game.settings.playerMissileMaxAge[game.level - 1]
    );
  }
}
