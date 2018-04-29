import { Global } from "./global";
import Player from "./player";
const { ccclass, property } = cc._decorator;

declare global {
  interface Window {
    io: Function;
  }
}

@ccclass
export default class Canvas extends cc.Component {

  @property(cc.Node)
  private overlay: cc.Node = null;

  @property(cc.Label)
  private overlayTitle: cc.Label = null;

  @property(cc.Node)
  private overlayButton: cc.Node = null;

  @property(cc.ProgressBar)
  private elixirProgressBar: cc.ProgressBar = null;

  @property(cc.Label)
  private elixirValue: cc.Label = null;

  @property(cc.Label)
  private bulletValue: cc.Label = null;

  @property(cc.Label)
  private healthValue: cc.Label = null;

  @property(cc.Prefab)
  private playerPrefab: cc.Prefab = null;

  onLoad() {
    cc.view.enableAntiAlias(false);
    cc.director.getCollisionManager().enabled = true;

    Global.CanvasScript = this;
    // cc.director.getCollisionManager().enabledDebugDraw = true;

    this.overlay.zIndex = 1;

    const socket = window.io('http://192.168.1.107:4000');
    Global.Socket = socket;

    socket.emit('new player');
    this.showOverlay("Finding Players", false);
    const action = this.overlayTitle.node.runAction(cc.repeatForever(cc.sequence(
      cc.fadeOut(0.5),
      cc.fadeIn(0.5),
      cc.delayTime(0.5),
    )));
    socket.on('spawn player', (data) => {
      this.hideOverlay();
      this.overlayTitle.node.stopAction(action);
      Global.PlayerNode = cc.instantiate(this.playerPrefab);
      Global.PlayerScript = Global.PlayerNode.getComponent(Player);
      Global.PlayerNode.position = Global.TM.tileToPositionAR(new cc.Vec2(data.playerX, data.playerY));
      Global.PlayerScript.isPlayer = true;
      Global.PlayerNode.parent = this.node;

      const enemy = cc.instantiate(this.playerPrefab);
      enemy.position = Global.TM.tileToPositionAR(new cc.Vec2(data.enemyX, data.enemyY));
      enemy.parent = this.node;

      enemy.getComponent(Player).enemy = Global.PlayerNode;
      Global.PlayerScript.enemy = enemy;

      socket.on('player move sync', (data) => {
        enemy.getComponent(Player).command(data.cardId);
      });

      socket.on('enemy left', () => {
        this.showOverlay("You Won!\n(Enemy Left)");
      });

    });

  }

  update(dt) {
    if (!Global.PlayerNode) return;
    this.elixirProgressBar.progress = Global.PlayerScript.elixir / Player.MAX_ELIXIR;
    this.elixirValue.string = Math.floor(Global.PlayerScript.elixir).toString();
    this.healthValue.string = Global.PlayerScript.health.toString();
    this.bulletValue.string = Global.PlayerScript.bullet.toString();
  }

  showOverlay(title: string, showRestartButton: boolean = true): void {
    Global.Pause = true;
    this.overlay.active = true;
    this.overlayTitle.string = title;
    this.overlayButton.active = showRestartButton;
  }

  hideOverlay(): void {
    Global.Pause = false;
    this.overlay.active = false;
  }

  restart() {
    Global.Pause = false;
    cc.director.loadScene(cc.director.getScene().name);
  }

}
