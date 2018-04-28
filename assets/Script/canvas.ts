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
  private title: cc.Label = null;

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
    socket.on('spawn player', (data) => {
      Global.PlayerNode = cc.instantiate(this.playerPrefab);
      Global.PlayerScript = Global.PlayerNode.getComponent(Player);
      Global.PlayerNode.position = Global.TM.tileToPositionAR(new cc.Vec2(data.player.x, data.player.y));
      Global.PlayerScript.isPlayer = true;
      Global.PlayerNode.parent = this.node;

      const enemy = cc.instantiate(this.playerPrefab);
      enemy.position = Global.TM.tileToPositionAR(new cc.Vec2(data.enemy.x, data.enemy.y));
      enemy.parent = this.node;

      enemy.getComponent(Player).enemy = Global.PlayerNode;
      Global.PlayerScript.enemy = enemy;

      socket.on('player move sync', (data) => {
        enemy.getComponent(Player).command(data.cardId);
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
