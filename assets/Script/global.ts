import Player from "./player";
import Canvas from "./canvas";

export class TileMapCalc {

  public tileSize: cc.Size;
  public layerSize: cc.Size;

  constructor(tileSize: cc.Size, layerSize: cc.Size) {
    this.tileSize = tileSize;
    this.layerSize = layerSize;
  }

  tileToPositionAR(tile: cc.Vec2): cc.Vec2 {
    return new cc.Vec2(this.tileSize.width * (tile.x + 0.5 - this.layerSize.width / 2), (this.layerSize.height / 2 - tile.y - 0.5) * this.tileSize.height)
  }

  positionToTile(worldPos: cc.Vec2): cc.Vec2 {
    return new cc.Vec2(Math.floor(worldPos.x / this.tileSize.width), this.layerSize.height - 1 - Math.floor(worldPos.y / this.tileSize.height));
  }

  isEdge(pos: cc.Vec2): boolean {
    const tile = this.positionToTile(pos);
    return tile.x == 0 || tile.x == this.tileSize.width - 1 || tile.y == 0 || tile.y == this.tileSize.height - 1;
  }

}

interface IGlobal {
  PlayerNode: cc.Node;
  PlayerScript: Player;
  CanvasScript: Canvas;
  Pause: boolean;
  TM: TileMapCalc;
  Socket: SocketIOClient.Socket;
}

const Global: IGlobal = {
  PlayerNode: null,
  PlayerScript: null,
  CanvasScript: null,
  Pause: false,
  TM: new TileMapCalc(new cc.Size(32, 32), new cc.Size(18, 32)),
  Socket: null
};

export { Global };