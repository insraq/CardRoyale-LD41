import { GLOBAL } from "./global";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AddCollider extends cc.Component {

  public tl: cc.TiledLayer;

  public onLoad() {
    this.tl = this.getComponent(cc.TiledLayer);
    const size = this.tl.getLayerSize();
    const tileSize = this.tl.getMapTileSize();
    for (let x = 0; x < size.width; x++) {
      for (let y = 0; y < size.height; y++) {
        if (this.tl.getTileGIDAt(x, y) !== 0) {
          const bc = this.addComponent(cc.BoxCollider);
          bc.offset = GLOBAL.TM.tileToPositionAR(new cc.Vec2(x, y));
          bc.size = new cc.Size(tileSize.width, tileSize.height);
          if (cc.director.getCollisionManager().enabledDebugDraw) {
            const node = new cc.Node();
            const l = node.addComponent(cc.Label);
            l.string = x + "," + y;
            l.fontSize = 10;
            node.parent = cc.find("canvas");
            node.position = bc.offset.add(new cc.Vec2(0, -16));
            node.zIndex = 1;
          }
        }
      }
    }
  }

  public removeTileAtPosition(pos: cc.Vec2): void {
    this.tl.removeTileAt(GLOBAL.TM.positionToTile(this.node.parent.convertToWorldSpaceAR(pos)));
  }

}
