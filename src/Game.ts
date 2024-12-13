import p5 from "p5";
import Component from "./Component";
import Player from "./Player";
import Stage from "./Stage";
import MineFactory from "./MineFactory";
import Mine from "./Mine";
import PlayerMissile from "./PlayerMissile";
import MineMissile from "./MineMissile";
import Sound from "./Sound";
import Explosion from "./Explosion";

interface ISettings {
  name: string;
  description: string;
  version: string;
  levelMines: number[];
  mineValues: number[];
  mineMinSize: number;
  mineMissileMaxSpeed: number;
  mineMissileMaxAge: number;
  maxPlayerMissiles: number;
  playerMissileMinSpeed: number;
  playerMissileMaxAge: number;
  playerShieldMaxAge: number;
  pauseKey: string;
  debug: boolean;
  sprites: string[];
  backgrounds: string[];
  sounds: string[];
}

interface IParams {
  level: number;
}

// Manages the game state.
export default class Game {
  p5: p5;
  settings!: ISettings;
  player!: Player;
  paused: boolean = true;
  level: number = 1;
  score: number = 0;

  private components: Component[] = [];
  private missileCount: number = 0;
  private minesCount: number = 0;
  private started: boolean = false;
  private stage!: Stage;
  private sound!: Sound;
  private MineFactory!: MineFactory;

  constructor(p5: p5) {
    this.p5 = p5;

    p5.preload = () => {
      // all async operations should be done here
      this.p5.loadJSON(
        "game.json",
        (settings: ISettings) => {
          this.settings = settings;

          const maxLevel = this.settings.levelMines.length;
          const params: IParams = this.p5.getURLParams() as IParams;
          this.level = Math.min(+params.level || 1, maxLevel);

          this.stage = new Stage(this);
          this.stage.preload();

          this.sound = new Sound(this);
          this.sound.preload();

          this.player = new Player(this);
          this.player.preload();

          this.MineFactory = new MineFactory(this);
          this.MineFactory.preload();

          console.info("Starting Game", this.settings.name, "powered by p5.js");
        },
        (error) => {
          console.error("Failed to load game settings", error);
        }
      );
    };

    p5.setup = () => {
      this.stage.setup();
      this.sound.setup();

      this.player.setup();
      this.components.push(this.player);

      this.MineFactory.setup();
      this.components.push(...this.MineFactory.mines);

      // Set the initial mines count. It will be updated when the player hits a mine.
      this.minesCount = this.MineFactory.mines.length;
    };

    p5.draw = () => {
      if (this.paused) return;
      this.update();
      this.render();
      if (this.settings.debug) this.renderDebug();
    };

    p5.windowResized = () => {
      this.stage.setup();
    };

    p5.mouseClicked = () => {
      if (!this.started) this.startGame();
      else if (this.paused) return;
      else this.firePlayerMissile();
    };

    p5.keyPressed = () => {
      if (this.p5.key === this.settings.pauseKey) {
        this.pauseGame();
        this.stage.drawStatus();
        this.sound.playAmbient(this.paused);
      }
    };
  }

  onAlert() {
    this.sound.playAlert();
  }

  onDead(component: Component) {
    // Remove the component from the list
    const p = this.components.indexOf(component);
    if (p >= 0) this.components.splice(p, 1);

    // If the component is explosion, just return
    if (component instanceof Explosion) return;

    // If the component is a mine missile, just return
    if (component instanceof MineMissile) return;

    // If the component is a missile, just decrease the count
    if (component instanceof PlayerMissile) {
      this.missileCount--;
      return;
    }

    // If the component is a mine, decrease the count and increase the score
    if (component instanceof Mine) {
      this.minesCount--;
      this.score += component.value;
      this.stage.drawStatus();

      // If there are no more mines, level up
      if (this.minesCount === 0) {
        this.gameAchievement();
        return;
      }
    }

    // If the component is the player, game over!
    if (component instanceof Player) {
      this.gameOver();
      return;
    }

    // else, explode the component
    this.explode(component);
  }

  private onCollision() {
    this.components.forEach((a) => {
      this.components.forEach((b) => {
        const ignoreCollision =
          (a instanceof PlayerMissile && b instanceof Player) ||
          (a instanceof Player && b instanceof PlayerMissile) ||
          (a instanceof MineMissile && b instanceof Mine) ||
          (a instanceof Mine && b instanceof MineMissile) ||
          a instanceof Explosion ||
          b instanceof Explosion;

        if (a === b || ignoreCollision) return;

        if (a.intercepts(b)) this.onHit(a, b);
      });
    });
  }

  private onHit(a: Component, b: Component) {
    const isMineMineCollision = a instanceof Mine && b instanceof Mine;
    const volume = isMineMineCollision ? this.MineFactory.getVolume(a, b) : 1;
    this.sound.playHit(volume);
    if (!a.shield) a.hit();
    if (!b.shield) b.hit();
    this.stage.drawStatus();
  }

  private update() {
    this.onCollision();
    this.stage.update();
    this.components.forEach((c) => c.update());
  }

  private render() {
    this.p5.clear();
    this.stage.render();
    this.components.forEach((c) => c.render());
  }

  private renderDebug() {
    this.p5.push();
    this.p5.fill(255);
    this.p5.text("FPS: " + this.p5.frameRate().toFixed(2), 8, 24);
    this.p5.noFill();
    this.components.forEach((c) => {
      const box = c.boundingBox();
      const [tl, br] = box;
      this.p5.stroke(0, 0, 255, 128);
      this.p5.rect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
    });
    this.p5.pop();
  }

  private explode(component: Component) {
    const volume =
      this.missileCount > 0
        ? 1
        : this.MineFactory.getVolume(component, component);
    this.sound.playExplode(volume);
    const explosion = new Explosion(this, component.position, component.value);
    explosion.setup();
    this.components.push(explosion);
  }

  startGame() {
    this.started = true;
    this.paused = false;
    this.stage.drawReady();
    this.stage.drawStatus();
    this.sound.playAmbient(false);
  }

  private pauseGame() {
    this.paused = !this.paused;
    this.sound.stopAll();
  }

  private gameAchievement() {
    this.sound.playAchievement();
    this.stage.drawAchievement();
  }

  private gameOver() {
    this.paused = true;
    this.sound.playGameOver();
    this.stage.drawGameOver();
  }

  private firePlayerMissile() {
    // limit the number of missiles
    if (this.missileCount >= this.settings.maxPlayerMissiles) return;

    this.sound.playPlayerFireMissile();
    this.missileCount++;
    const missile = new PlayerMissile(this);
    missile.setup(undefined, this.player.missileAt, this.player.velocity);
    this.components.push(missile);
  }

  fireMineMissile(mine: Mine) {
    this.sound.playMineFireMissile();
    const missile = new MineMissile(this);
    const direction = p5.Vector.sub(mine.position, this.player.position)
      .normalize()
      .mult(-1);
    missile.setup(undefined, mine.position, direction);
    this.components.push(missile);
  }

  fireRandomMineMissile() {
    const index = this.p5.floor(this.p5.random(this.components.length));
    const mine = this.components[index];
    // make sure its a mine
    if (mine instanceof Mine) this.fireMineMissile(mine);
  }
}
