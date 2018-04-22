import Bullet from './bullet';
import { Global } from './global';
const { ccclass, property } = cc._decorator;

@ccclass
export default class Enemy extends cc.Component {

  @property(cc.ProgressBar)
  private progressBar: cc.ProgressBar = null;

  @property(cc.Prefab)
  private bulletPrefab: cc.Prefab = null;

  @property(cc.Node)
  private player: cc.Node = null;

  private _health: number;
  public get health(): number {
    return this._health;
  }
  public set health(v: number) {
    if (v == this._health - 1) {
      this.node.runAction(cc.blink(1, 5));
      this.playSound("hit");
    }
    if (v > this._health) {
      this.node.runAction(cc.sequence(
        cc.scaleTo(0.25, 1.5, 1.5),
        cc.scaleTo(0.25, 1, 1),
      ))
    }
    if (v <= 0) {
      Global.CanvasScript.gameOver("You Won!");
      return;
    }
    this._health = v;
    if (this.progressBar) {
      this.progressBar.progress = v / this.MAX_HEALTH;
    }
  }

  private _overlap = {};
  private size: number;
  private readonly MAX_HEALTH = 5;

  onLoad() {
    this.size = this.node.getContentSize().width;
    this.health = this.MAX_HEALTH;
    this.schedule(() => {

      if (Global.Pause) return;

      const rand = Math.random();
      if (rand < 0.2) {
        this.move("up");
      } else if (rand < 0.4) {
        this.move("left");
      } else if (rand < 0.6) {
        this.move("right");
      } else if (rand < 0.8) {
        this.move("down");
      } else if (rand < 0.9) {
        if (this.health < this.MAX_HEALTH) {
          this.health += 1;
        } else {
          this.shoot();
        }
      } else {
        this.shoot();
      }

    }, 1, cc.macro.REPEAT_FOREVER);
  }

  move(direction: ("up" | "down" | "right" | "left"), callback?: Function) {
    const pos = this.node.position;
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
      this.node.runAction(cc.sequence(cc.moveTo(0.25, target), cc.callFunc(() => {
        if (callback) callback();
      })));
    }
  }

  shoot() {
    const bullet = cc.instantiate(this.bulletPrefab);
    bullet.getComponent(Bullet).target = this.player.position;
    bullet.getComponent(Bullet).from = this.node;
    bullet.position = this.node.position;
    bullet.parent = this.node.parent;
    this.playSound("shoot");
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

  onCollisionEnter(other, self) {
    const aabb = other.world.aabb;
    const pos = this.node.parent.convertToNodeSpaceAR(
      new cc.Vec2(aabb.x + aabb.width / 2, aabb.y + aabb.width / 2)
    );
    this._overlap[pos.toString()] = true;
  }

}
