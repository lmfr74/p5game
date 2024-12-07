import p5 from "p5";

declare module "p5" {
  interface p5InstanceExtensions {
    angleLerp(start: number, end: number, amt: number): number;
  }
}
