import Enemy from "./enemy";
import Player from "./player";
import AddCollider from "./add_collider";
import { Global } from "./global";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Bullet extends cc.Component {

  public target: cc.Vec2;
  public from: cc.Node;

  private readonly SPEED = 800;
  private direction: cc.Vec2;

  onLoad() {
    if (this.target) {
      this.direction = this.target.sub(this.node.position).normalize();
    }
  }

  update(dt) {
    const s = cc.director.getVisibleSize();
    const pos = this.node.position;
    if (pos.x > s.width / 2 || pos.x < -s.width / 2 || pos.y > s.height / 2 || pos.y < -s.height / 2) {
      return this.node.destroy();
    }
    if (this.target) {
      this.node.position = pos.add(this.direction.mul(dt * this.SPEED));
    }
  }

  onCollisionEnter(other: cc.BoxCollider, self: cc.BoxCollider) {

    if (other.tag !== 0) {
      return;
    }
    if (this.from == other.node) {
      return;
    }
    if (!cc.isValid(this.node)) {
      return;
    }

    this.node.destroy();
    const c = other.getComponent(AddCollider);
    if (c && !Global.TM.isEdge(other.offset)) {
      c.removeTileAtPosition(other.offset);
      other.destroy();
    }
    const e = other.getComponent(Enemy);
    if (e) {
      e.health -= 1;
    }
    const p = other.getComponent(Player);
    if (p) {
      p.health -= 1;
    }
  }

}
