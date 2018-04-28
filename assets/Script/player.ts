import Bullet from './bullet';
import { Global } from './global';
import { CardDeck, Cards } from './card';
import AddCollider from './add_collider';
const { ccclass, property } = cc._decorator;

@ccclass
export default class Player extends cc.Component {

  @property(cc.Prefab)
  private bulletPrefab: cc.Prefab = null;

  @property(cc.ProgressBar)
  private heathProgressBar: cc.ProgressBar = null;

  @property(cc.SpriteFrame)
  private enemySpriteFrame: cc.SpriteFrame = null;

  private _bullet: number;
  public get bullet(): number { return this._bullet; }
  public set bullet(v: number) {
    this._bullet = v;
  }

  static MAX_ELIXIR = 10;
  static MAX_HEALTH: number = 5;
  public enemy: cc.Node = null;
  private _health: number;
  public isPlayer = false;
  public get health(): number { return this._health; }
  public set health(v: number) {
    if (v > Player.MAX_HEALTH) {
      return;
    }
    if (v == this._health - 1) {
      this.node.runAction(cc.sequence(cc.blink(1, 5), cc.fadeIn(0.25)));
      this.playSound(this.isPlayer ? "hurt" : "hit");
    }
    if (v > this._health) {
      this.node.runAction(cc.sequence(
        cc.scaleTo(0.25, 1.5, 1.5),
        cc.scaleTo(0.25, 1, 1),
      ))
    }
    if (v <= 0) {
      Global.CanvasScript.gameOver(this.isPlayer ? "You Lost!" : "You Won!");
      return;
    }
    this.heathProgressBar.progress = v / Player.MAX_HEALTH;
    this._health = v;
  }

  private _elixir: number = 5;
  public get elixir(): number { return this._elixir; }
  public set elixir(v: number) {
    this._elixir = v;
  }

  private size: number;
  private _overlap = {};
  private _moveQueue: string[] = [];
  private _moving = false;

  onLoad() {
    this.size = this.node.getContentSize().width;
    this.health = Player.MAX_HEALTH;
    this.bullet = 5;
    this.health = 5;
    if (!this.isPlayer) {
      this.getComponent(cc.Sprite).spriteFrame = this.enemySpriteFrame;
    }
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

  command(idx: number) {
    if (this.isPlayer) {
      Global.Socket.emit('player move', { cardId: idx });
      console.log("Player", { cardId: idx });
    }
    const card = Cards[idx];
    card.action(this);
  }

  move(direction: ("up" | "down" | "right" | "left")) {
    this._moveQueue.push(direction);
  }

  update(dt) {
    if (Global.Pause) return;
    if (this.elixir <= Player.MAX_ELIXIR) {
      this.elixir += 0.5 * dt;
    }
    if (!this._moving && this._moveQueue.length > 0) {
      this._processMove();
    }
  }

  private _processMove() {
    this._moving = true;

    const pos = this.node.position;
    const direction = this._moveQueue.shift();
    const tile = Global.TM.positionToTile(this.node.parent.convertToWorldSpaceAR(this.node.position));
    let target;
    switch (direction) {
      case "up":
        target = new cc.Vec2(tile.x, tile.y - 1);
        break;
      case "down":
        target = new cc.Vec2(tile.x, tile.y + 1);
        break;
      case "right":
        target = new cc.Vec2(tile.x + 1, tile.y);
        break;
      case "left":
        target = new cc.Vec2(tile.x - 1, tile.y);
        break;
    }
    if (target && !this._overlap[target.toString()]) {
      this.node.runAction(cc.sequence(
        cc.moveTo(0.25, Global.TM.tileToPositionAR(target)),
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
    if ((<cc.Collider>other).getComponent(AddCollider)) {
      const aabb = other.world.aabb;
      const tile = Global.TM.positionToTile(new cc.Vec2(aabb.x, aabb.y));
      this._overlap[tile.toString()] = true;
    }
  }

  onCollisionExit(other, self) {
    if ((<cc.Collider>other).getComponent(AddCollider)) {
      const aabb = other.world.aabb;
      const tile = Global.TM.positionToTile(new cc.Vec2(aabb.x, aabb.y));
      delete this._overlap[tile.toString()];
    }
  }

}
