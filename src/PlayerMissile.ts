import Game from "./Game";
import Missile from "./Missile";

// Player missile behaviour.
export default class PlayerMissile extends Missile {
  constructor(game: Game) {
    const color = game.p5.color("red");
    super(
      game,
      color,
      game.settings.playerMissileMinSpeed,
      game.settings.playerMissileMaxAge
    );
  }
}
