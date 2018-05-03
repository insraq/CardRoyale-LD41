import Canvas from "./canvas";
import Card from "./card";
import Player from "./player";

export class TileMapCalc {

  public tileSize: cc.Size;
  public layerSize: cc.Size;

  constructor(tileSize: cc.Size, layerSize: cc.Size) {
    this.tileSize = tileSize;
    this.layerSize = layerSize;
  }

  public tileToPositionAR(tile: cc.Vec2): cc.Vec2 {
    return new cc.Vec2(
      this.tileSize.width * (tile.x + 0.5 - this.layerSize.width / 2),
      (this.layerSize.height / 2 - tile.y - 0.5) * this.tileSize.height,
    );
  }

  public positionToTile(worldPos: cc.Vec2): cc.Vec2 {
    return new cc.Vec2(
      Math.floor(worldPos.x / this.tileSize.width),
      this.layerSize.height - 1 - Math.floor(worldPos.y / this.tileSize.height),
    );
  }

}

interface IGlobal {
  PlayerNode: cc.Node;
  PlayerScript: Player;
  CanvasScript: Canvas;
  Pause: boolean;
  TM: TileMapCalc;
  Socket: SocketIOClient.Socket;
  CardTypes: {};
}

const GLOBAL: IGlobal = {
  PlayerNode: null,
  PlayerScript: null,
  CanvasScript: null,
  Pause: false,
  TM: new TileMapCalc(new cc.Size(32, 32), new cc.Size(18, 32)),
  Socket: null,
  CardTypes: {},
};

export { GLOBAL };
