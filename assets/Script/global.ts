import Player from "./player";
import Canvas from "./canvas";

const Global: { PlayerNode: cc.Node, PlayerScript: Player, CanvasScript: Canvas, Pause: boolean } = {
  PlayerNode: null,
  PlayerScript: null,
  CanvasScript: null,
  Pause: false,
};

export { Global };