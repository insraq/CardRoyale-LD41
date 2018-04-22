import Bullet from './bullet';
import { Global } from './global';
const { ccclass, property } = cc._decorator;

@ccclass
export default class Player extends cc.Component {

  @property(cc.Node)
  private enemy: cc.Node = null;

  @property(cc.Prefab)
  private bulletPrefab: cc.Prefab = null;

  @property(cc.ProgressBar)
  private progressBar: cc.ProgressBar = null;

  @property(cc.Label)
  private elixirValue: cc.Label = null;

  @property(cc.Label)
  private bulletValue: cc.Label = null;

  @property(cc.Label)
  private healthValue: cc.Label = null;

  private _bullet: number;
  public get bullet(): number { return this._bullet; }
  public set bullet(v: number) {
    this._bullet = v;
    this.bulletValue.string = v.toString();
  }

  private _health: number;
  public get health(): number { return this._health; }
  public set health(v: number) {
    if (v == this._health - 1) {
      this.node.runAction(cc.blink(1, 5));
      this.playSound("hurt");
    }
    if (v > this._health) {
      this.node.runAction(cc.sequence(
        cc.scaleTo(0.25, 1.5, 1.5),
        cc.scaleTo(0.25, 1, 1),
      ))
    }
    if (v <= 0) {
      Global.CanvasScript.gameOver("You Lost!");
      return;
    }
    this._health = v;
    this.healthValue.string = v.toString();
  }

  private _elixir: number = 5;
  public get elixir(): number { return this._elixir; }
  public set elixir(v: number) {
    this._elixir = v;
    this.elixirValue.string = Math.floor(v).toString();
    this.progressBar.progress = v / this.MAX_ELIXIR;
  }

  private size: number;
  private readonly MAX_ELIXIR = 10;
  private _overlap = {};
  private _moveQueue: string[] = [];
  private _moving = false;

  onLoad() {
    this.size = this.node.getContentSize().width;
    Global.PlayerNode = this.node;
    Global.PlayerScript = this;
    this.bullet = 5;
    this.health = 5;
  }

  playSound(name: string) {
    const as = this.getComponents(cc.AudioSource);
    for (const a of as) {
      if (String(a.clip).indexOf(name) !== -1) {
        a.play();
        return;
      };
    }
  }

  move(direction: ("up" | "down" | "right" | "left")) {
    this._moveQueue.push(direction);
  }

  update(dt) {

    if (Global.Pause) return;

    if (this.elixir <= this.MAX_ELIXIR) {
      this.elixir += dt;
    }

    if (!this._moving && this._moveQueue.length > 0) {
      this._processMove();
    }

  }

  private _processMove() {
    this._moving = true;

    const pos = this.node.position;
    const direction = this._moveQueue.shift();
    let target;
    switch (direction) {
      case "up":
        target = new cc.Vec2(pos.x, pos.y + this.size);
        break;
      case "down":
        target = new cc.Vec2(pos.x, pos.y - this.size);
        break;
      case "right":
        target = new cc.Vec2(pos.x + this.size, pos.y);
        break;
      case "left":
        target = new cc.Vec2(pos.x - this.size, pos.y);
        break;
    }
    if (target && !this._overlap[target.toString()]) {
      this.node.runAction(cc.sequence(
        cc.moveTo(0.25, target),
        cc.callFunc(() => {
          this._moving = false;
        })
      ));
    } else {
      this._moving = false;
    }
  }

  shoot() {
    if (this.bullet <= 0) return;
    const bullet = cc.instantiate(this.bulletPrefab);
    bullet.getComponent(Bullet).target = this.enemy.position;
    bullet.getComponent(Bullet).from = this.node;
    bullet.position = this.node.position;
    bullet.parent = this.node.parent;
    this.playSound("shoot");
  }

  onCollisionEnter(other, self) {
    const aabb = other.world.aabb;
    const pos = this.node.parent.convertToNodeSpaceAR(
      new cc.Vec2(aabb.x + aabb.width / 2, aabb.y + aabb.width / 2)
    );
    this._overlap[pos.toString()] = true;
  }

}
