const { ccclass, property } = cc._decorator;

@ccclass
export default class AddCollider extends cc.Component {

  onLoad() {
    const tl = this.getComponent(cc.TiledLayer);
    const size = tl.getLayerSize();
    for (let x = 0; x < size.width; x++) {
      for (let y = 0; y < size.height; y++) {
        const tile = tl.getTileAt(x, y);
        if (tile != null) {
          const bc = this.addComponent(cc.BoxCollider);
          bc.offset = new cc.Vec2(-1024 / 2 + 16 + tile._position.x, -576 / 2 + 16 + tile._position.y);
          bc.size = new cc.Size(32, 32);
        }
      }
    }
  }

}
