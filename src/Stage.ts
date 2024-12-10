import p5 from "p5";
import Game from "./Game";
import Component from "./Component";

// Backgrounds from https://pixabay.com/

// Game action stage.
export default class Stage extends Component {
  private readonly SCREEN_MARGIN = 100;

  private backgrounds: p5.Image[] = [];
  private gameImage!: p5.Image;
  private levelImage!: p5.Image;
  private dx: number = 0;
  private dy: number = 0;

  constructor(game: Game) {
    super(game);
  }

  preload() {
    // Load game and level background images defined in settings
    this.game.settings.backgrounds.forEach((file, i) => {
      if (i === 0) this.gameImage = this.p5.loadImage(file);
      else this.backgrounds.push(this.p5.loadImage(file));
    });
  }

  setup() {
    // Set game status
    let titleElement = document.getElementById("game-title");
    if (titleElement) {
      titleElement.innerText = this.game.settings.name;
      titleElement.title = this.game.settings.description;
    }

    let descriptionElement = document.getElementById("game-description");
    if (descriptionElement) {
      descriptionElement.innerText = this.game.settings.description;
    }

    let levelElements = document.getElementsByClassName("game-level");
    if (levelElements) {
      for (let element of levelElements) {
        element.innerHTML = this.game.level.toString();
      }
    }

    // Create a full screen canvas
    this.p5.createCanvas(this.p5.windowWidth, this.p5.windowHeight);
    this.p5.pixelDensity(1);
    this.p5.mouseX = this.p5.width / 2;
    this.p5.mouseY = this.p5.height / 2;

    // Set game image as background image.
    this.p5.image(
      this.gameImage,
      0,
      0,
      this.p5.width,
      this.p5.height,
      0,
      0,
      this.gameImage.width,
      this.gameImage.height,
      this.p5.COVER
    );

    // Set level background image.
    const index = (this.game.level - 1) % this.backgrounds.length;
    this.levelImage = this.backgrounds[index];
  }

  update() {
    // Calculate simple paralax offset based on the player position
    this.dx = this.p5.map(
      this.game.player.position.x,
      0,
      this.p5.windowWidth,
      0,
      -this.SCREEN_MARGIN
    );

    this.dy = this.p5.map(
      this.game.player.position.y,
      0,
      this.p5.windowHeight,
      0,
      -this.SCREEN_MARGIN
    );
  }

  render() {
    // Draw the level image with the paralax offset
    this.p5.image(
      this.levelImage,
      this.dx,
      this.dy,
      this.p5.width + this.SCREEN_MARGIN * 2,
      this.p5.height + this.SCREEN_MARGIN * 2,
      0,
      0,
      this.levelImage.width,
      this.levelImage.height,
      this.p5.COVER
    );
  }

  drawReady() {
    let startElement = document.getElementById("game-start");
    if (startElement) {
      startElement.style.display = "none";
    }
  }

  drawStatus() {
    let pausedElement = document.getElementById("game-paused");
    if (pausedElement) {
      if (this.game.paused) pausedElement.innerText = "❚❚";
      else pausedElement.innerText = "▶";
    }

    let scoreElements = document.getElementsByClassName("game-score");
    if (scoreElements) {
      for (let element of scoreElements) {
        element.innerHTML = this.game.score.toString();
      }
    }

    let healthElement = document.getElementById("game-health");
    if (healthElement) {
      healthElement.innerText = `${this.game.player.energy}/${this.game.player.value}`;
      if (this.game.player.energy === this.game.player.value)
        healthElement.innerText += " 💚";
      else if (this.game.player.energy <= 1) healthElement.innerText += " 💀";
      else if (this.game.player.energy < this.game.player.value)
        healthElement.innerText += " 💔";
    }
  }

  drawAchievement() {
    let achievementElement = document.getElementById("game-achievement");
    if (achievementElement) {
      achievementElement.style.display = "block";
    }
  }

  drawGameOver() {
    let gameOverElement = document.getElementById("game-over");
    if (gameOverElement) {
      gameOverElement.style.display = "block";
    }
  }
}
