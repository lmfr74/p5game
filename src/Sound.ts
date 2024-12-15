import p5 from "p5";
import Game from "./Game";

// Sounds from https://pixabay.com/

// Manage game sounds.
export default class Sound {
  private game: Game;
  private sounds: p5.MediaElement[] = [];

  private ambientSound!: p5.MediaElement;
  private gameOverSound!: p5.MediaElement;
  private playerFireSound!: p5.MediaElement;
  private mineFireSound!: p5.MediaElement;
  private hitSound!: p5.MediaElement;
  private explodeSound!: p5.MediaElement;
  private achievementSound!: p5.MediaElement;
  private alertSound!: p5.MediaElement;
  private shieldSound!: p5.MediaElement;

  constructor(game: Game) {
    this.game = game;
  }

  preload() {
    this.game.settings.sounds.forEach((f) => {
      this.sounds.push(this.game.p5.createAudio(f));
    });
  }

  setup() {
    this.ambientSound = this.sounds[0];
    this.gameOverSound = this.sounds[1];
    this.playerFireSound = this.sounds[2];
    this.mineFireSound = this.sounds[3];
    this.hitSound = this.sounds[4];
    this.explodeSound = this.sounds[5];
    this.achievementSound = this.sounds[6];
    this.alertSound = this.sounds[7];
    this.shieldSound = this.sounds[8];
  }

  stopAll() {
    this.sounds.forEach((s) => s.stop());
  }

  playAmbient(paused: boolean) {
    if (paused) this.ambientSound.pause();
    else this.ambientSound.play().loop();
  }

  playAchievement() {
    this.stopAll();
    this.achievementSound.play();
  }

  playPlayerFireMissile() {
    this.playerFireSound.stop().play();
  }

  playMineFireMissile() {
    this.mineFireSound.stop().play();
  }

  playHit(volume: number) {
    this.playerFireSound.stop();
    this.hitSound.stop().play().volume(volume);
  }

  playExplode(volume: number) {
    this.explodeSound.stop().play().volume(volume);
  }

  playAlert() {
    this.alertSound.play().loop();
  }

  playShield() {
    this.shieldSound.play();
  }

  playGameOver() {
    this.stopAll();
    this.explodeSound.play();
    this.gameOverSound.play();
  }
}
