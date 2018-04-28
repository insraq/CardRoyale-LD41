import { Global } from "./global";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AddCollider extends cc.Component {

  tl: cc.TiledLayer

  onLoad() {
    this.tl = this.getComponent(cc.TiledLayer);
    const size = this.tl.getLayerSize();
    const tileSize = this.tl.getMapTileSize();
    for (let x = 0; x < size.width; x++) {
      for (let y = 0; y < size.height; y++) {
        if (this.tl.getTileGIDAt(x, y) !== 0) {
          const bc = this.addComponent(cc.BoxCollider);
          bc.offset = Global.TM.tileToPositionAR(new cc.Vec2(x, y));
          bc.size = new cc.Size(tileSize.width, tileSize.height);
        }
      }
    }
  }

  removeTileAtPosition(pos: cc.Vec2): void {
    this.tl.removeTileAt(Global.TM.positionToTile(this.node.parent.convertToWorldSpaceAR(pos)));
  }

}