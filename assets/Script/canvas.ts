import { Global } from "./global";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Canvas extends cc.Component {

  @property(cc.Node)
  private overlay: cc.Node = null;

  @property(cc.Label)
  private title: cc.Label = null;

  onLoad() {
    cc.view.enableAntiAlias(false);
    cc.director.getCollisionManager().enabled = true;
    Global.CanvasScript = this;
    // cc.director.getCollisionManager().enabledDebugDraw = true;
  }

  gameOver(title: string): void {
    Global.Pause = true;
    this.overlay.active = true;
    this.title.string = title;
  }

  restart() {
    Global.Pause = false;
    cc.director.loadScene(cc.director.getScene().name);
  }

}
