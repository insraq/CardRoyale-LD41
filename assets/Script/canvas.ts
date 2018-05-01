import { Global } from "./global";
import Player from "./player";

const { ccclass, property } = cc._decorator;

declare global {
  interface Window { // tslint:disable-line
    io: SocketIOClientStatic;
  }
}

@ccclass
export default class Canvas extends cc.Component {

  @property(cc.Node)
  private overlay: cc.Node = null;

  @property(cc.Node)
  private mainUI: cc.Node = null;

  @property(cc.Node)
  private mainUILoading: cc.Node = null;

  @property(cc.Node)
  private mainUIButtons: cc.Node = null;

  @property(cc.Label)
  private overlayTitle: cc.Label = null;

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

  public onLoad() {
    cc.view.enableAntiAlias(false);
    cc.director.getCollisionManager().enabled = true;

    Global.CanvasScript = this;
    // cc.director.getCollisionManager().enabledDebugDraw = true;

    this.overlay.zIndex = 1;
    this.mainUI.zIndex = 1;

    const socket = window.io("http://insraq.dy.fi:4000");
    Global.Socket = socket;

    socket.on("spawn player", (data) => {
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

      this.mainUI.active = false;

      socket.on("player move sync", (data) => {
        enemy.getComponent(Player).command(data.cardId);
      });

      socket.on("enemy left", () => {
        this.showOverlay("You Won!\n(Enemy Left)");
      });
    });

  }

  public multiplayer() {
    this.mainUILoading.active = true;
    this.mainUIButtons.active = false;
    Global.Socket.emit("new player");
  }

  public update(dt) {
    if (!Global.PlayerNode) { return; }
    this.elixirProgressBar.progress = Global.PlayerScript.elixir / Player.MAX_ELIXIR;
    this.elixirValue.string = Math.floor(Global.PlayerScript.elixir).toString();
    this.healthValue.string = Global.PlayerScript.health.toString();
    this.bulletValue.string = Global.PlayerScript.bullet.toString();
  }

  public showOverlay(title: string): void {
    Global.Pause = true;
    this.overlay.active = true;
    this.overlayTitle.string = title;
  }

  public hideOverlay(): void {
    Global.Pause = false;
    this.overlay.active = false;
  }

  public restart() {
    Global.Pause = false;
    cc.director.loadScene(cc.director.getScene().name);
  }

}
