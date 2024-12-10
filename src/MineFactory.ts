import Component from "./Component";
import Game from "./Game";
import Mine from "./Mine";

// Creates the mines.
export default class MineFactory {
  mines: Mine[] = [];

  private readonly MIN_VOLUME = 0.25;
  private readonly MAX_VOLUME = 0.75;

  private game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  preload() {}

  setup() {
    // Create the mines based on the current level with random value.
    const maxMines = this.game.settings.levelMines[this.game.level - 1];
    for (let i = 0; i < maxMines; i++) {
      const value = this.game.p5.random(this.game.settings.mineValues);
      const mine = new Mine(this.game, value);
      mine.setup();
      this.mines.push(mine);
    }
  }

  getVolume(a: Component, b: Component): number {
    // The volume is calculated based on the sum of the values of the two components.
    const value = a.value + b.value;
    const i0 = 0;
    const il = this.game.settings.mineValues.length - 1;

    const minValue = 2 * this.game.settings.mineValues[i0];
    const maxValue = 2 * this.game.settings.mineValues[il];

    return this.game.p5.map(
      value,
      minValue,
      maxValue,
      this.MIN_VOLUME,
      this.MAX_VOLUME
    );
  }
}
