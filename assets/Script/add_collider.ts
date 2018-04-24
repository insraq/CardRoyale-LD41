const { ccclass, property } = cc._decorator;

@ccclass
export default class AddCollider extends cc.Component {

  onLoad() {
    const tl = this.getComponent(cc.TiledLayer);
    const size = tl.getLayerSize();
    const tileSize = tl.getMapTileSize();
    for (let x = 0; x < size.width; x++) {
      for (let y = 0; y < size.height; y++) {
        if (tl.getTileAt(x, y) != null) {
          const pos = tl.getPositionAt(x, y);
          const bc = this.addComponent(cc.BoxCollider);
          bc.offset = this.node.parent.convertToNodeSpaceAR(new cc.Vec2(pos.x + tileSize.width / 2, pos.y + tileSize.height / 2));
          bc.size = new cc.Size(tileSize.width, tileSize.height);
        }
      }
    }
  }

  convertToTile(pos: cc.Vec2): cc.Vec2 {
    const tl = this.getComponent(cc.TiledLayer);
    const size = tl.getLayerSize();
    const tileSize = tl.getMapTileSize();
    const worldPos = this.node.convertToWorldSpaceAR(pos);
    return new cc.Vec2(Math.floor(worldPos.x / tileSize.width), size.height - 1 - Math.floor(worldPos.y / tileSize.height));
  }

  removeTileAtPosition(pos: cc.Vec2): void {
    const tl = this.getComponent(cc.TiledLayer);
    const tile = this.convertToTile(pos);
    tl.removeTileAt(this.convertToTile(pos));
  }

  isEdge(pos: cc.Vec2): boolean {
    const tile = this.convertToTile(pos);
    const tl = this.getComponent(cc.TiledLayer);
    const tileSize = tl.getMapTileSize();
    return tile.x == 0 || tile.x == tileSize.width - 1 || tile.y == 0 || tile.y == tileSize.height - 1;
  }

}

