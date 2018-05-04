import { GLOBAL } from "./global";
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

    GLOBAL.CardTypes = {};
    GLOBAL.CanvasScript = this;
    // cc.director.getCollisionManager().enabledDebugDraw = true;

    this.overlay.zIndex = 1;
    this.mainUI.zIndex = 1;

  }

  public multiplayer(): void {
    this.mainUILoading.active = true;
    this.mainUIButtons.active = false;
    const socket = window.io("http://insraq.dy.fi:4000");
    GLOBAL.Socket = socket;

    socket.on("spawn player", (data) => {
      this.spawnPlayer(new cc.Vec2(data.playerX, data.playerY));

      const enemy = cc.instantiate(this.playerPrefab);
      enemy.position = GLOBAL.TM.tileToPositionAR(new cc.Vec2(data.enemyX, data.enemyY));
      enemy.parent = this.node;

      enemy.getComponent(Player).enemy = GLOBAL.PlayerNode;
      GLOBAL.PlayerScript.enemy = enemy;

      this.mainUI.active = false;

      socket.on("player move sync", (d) => {
        enemy.getComponent(Player).command(d.cardId);
      });

      socket.on("enemy left", () => {
        this.showOverlay("You Won!\n(Enemy Left)");
      });
    });
    GLOBAL.Socket.emit("new player");
  }

  public singleplayer(): void {
    this.spawnPlayer(new cc.Vec2(8, 23));

    const enemy = cc.instantiate(this.playerPrefab);
    const enemyScript = enemy.getComponent(Player);
    enemy.position = GLOBAL.TM.tileToPositionAR(new cc.Vec2(8, 3));
    enemy.parent = this.node;

    enemy.getComponent(Player).enemy = GLOBAL.PlayerNode;
    GLOBAL.PlayerScript.enemy = enemy;

    this.mainUI.active = false;

    this.schedule(() => {
      if (GLOBAL.Pause) { return; }
      const rand = Math.random();
      if (rand < 0.2) {
        enemyScript.move("up");
      } else if (rand < 0.4) {
        enemyScript.move("left");
      } else if (rand < 0.6) {
        enemyScript.move("right");
      } else if (rand < 0.8) {
        enemyScript.move("down");
      } else if (rand < 0.9) {
        if (enemyScript.health < Player.MAX_HEALTH) {
          enemyScript.health += 1;
        } else {
          enemyScript.shoot();
        }
      } else {
        enemyScript.shoot();
      }
    }, 1, cc.macro.REPEAT_FOREVER);
  }

  public update(dt) {
    if (!GLOBAL.PlayerNode) { return; }
    this.elixirProgressBar.progress = GLOBAL.PlayerScript.elixir / Player.MAX_ELIXIR;
    this.elixirValue.string = Math.floor(GLOBAL.PlayerScript.elixir).toString();
    this.healthValue.string = GLOBAL.PlayerScript.health.toString();
    this.bulletValue.string = GLOBAL.PlayerScript.bullet.toString();
  }

  public showOverlay(title: string): void {
    GLOBAL.Pause = true;
    this.overlay.active = true;
    this.overlayTitle.string = title;
  }

  public hideOverlay(): void {
    GLOBAL.Pause = false;
    this.overlay.active = false;
  }

  public restart() {
    GLOBAL.Pause = false;
    cc.director.loadScene(cc.director.getScene().name);
  }

  private spawnPlayer(pos: cc.Vec2) {
    GLOBAL.PlayerNode = cc.instantiate(this.playerPrefab);
    GLOBAL.PlayerScript = GLOBAL.PlayerNode.getComponent(Player);
    GLOBAL.PlayerNode.position = GLOBAL.TM.tileToPositionAR(pos);
    GLOBAL.PlayerScript.isPlayer = true;
    GLOBAL.PlayerNode.parent = this.node;
  }

}
