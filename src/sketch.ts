import p5 from "p5";
import Game from "./Game";

// Add the angleLerp method to p5.prototype
(p5.prototype as any).angleLerp = function (
  start: number,
  end: number,
  amt: number
): number {
  let difference = end - start;
  while (difference < -Math.PI) difference += Math.PI * 2;
  while (difference > Math.PI) difference -= Math.PI * 2;
  return start + difference * amt;
};

new p5((engine: p5) => {
  const game = new Game(engine);
});
