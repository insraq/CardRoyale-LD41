import { GLOBAL } from "./global";
import Player from "./player";
const { ccclass, property } = cc._decorator;

export interface ICardDeck {
  cardName: string;
  elixir: number;
  bullet: number;
  type: "up" | "left" | "right" | "down" | "shoot" | "bullet" | "health";
  action: (player: Player) => void;
}

const aimAndShoot: ICardDeck = {
  cardName: "Aim and Shoot".toUpperCase(), elixir: 3, bullet: 1, type: "shoot", action: (player) => {
    player.shoot();
  },
};

export const CARDS: ICardDeck[] = [

  aimAndShoot, aimAndShoot, aimAndShoot, aimAndShoot,

  {
    cardName: "Up +1".toUpperCase(), elixir: 1, bullet: 0, type: "up", action: (player) => {
      player.move("up");
    },
  },
  {
    cardName: "Left +1".toUpperCase(), elixir: 1, bullet: 0, type: "left", action: (player) => {
      player.move("left");
    },
  },
  {
    cardName: "Right +1".toUpperCase(), elixir: 1, bullet: 0, type: "right", action: (player) => {
      player.move("right");
    },
  },
  {
    cardName: "Down +1".toUpperCase(), elixir: 1, bullet: 0, type: "down", action: (player) => {
      player.move("down");
    },
  },

  {
    cardName: "Up +3".toUpperCase(), elixir: 2, bullet: 0, type: "up", action: (player) => {
      player.move("up");
      player.move("up");
      player.move("up");
    },
  },
  {
    cardName: "Left +3".toUpperCase(), elixir: 2, bullet: 0, type: "left", action: (player) => {
      player.move("left");
      player.move("left");
      player.move("left");
    },
  },
  {
    cardName: "Right +3".toUpperCase(), elixir: 2, bullet: 0, type: "right", action: (player) => {
      player.move("right");
      player.move("right");
      player.move("right");
    },
  },
  {
    cardName: "Down +3".toUpperCase(), elixir: 2, bullet: 0, type: "down", action: (player) => {
      player.move("down");
      player.move("down");
      player.move("down");
    },
  },

  {
    cardName: "Bullet +2".toUpperCase(), elixir: 2, bullet: 0, type: "bullet", action: (player) => {
      player.bullet += 2;
    },
  },

  {
    cardName: "Health +1".toUpperCase(), elixir: 2, bullet: 0, type: "health", action: (player) => {
      player.health += 1;
    },
  },
];

const _cards = shuffle(CARDS.slice(0));
let _seq = 0;

@ccclass
export default class Card extends cc.Component {

  @property(cc.Label)
  public cardName: cc.Label = null;

  @property(cc.Label)
  public elixir: cc.Label = null;

  private _initialPosition: cc.Vec2;
  private _initialNameColor: cc.Color;
  private _initialElixirColor: cc.Color;
  private _currentCard: ICardDeck;

  public onLoad() {
    this._initialPosition = this.node.position;
    this._initialElixirColor = this.elixir.node.color;
    this._initialNameColor = this.cardName.node.color;
    this.drawCard();
  }

  public onClick(e: cc.Event.EventMouse) {
    if (this._canBeUsed()) {
      GLOBAL.PlayerScript.elixir = GLOBAL.PlayerScript.elixir - this.currentCard().elixir;
      const idx = CARDS.indexOf(this.currentCard());
      if (GLOBAL.Socket) { GLOBAL.Socket.emit("player move", { cardId: idx }); }
      GLOBAL.PlayerScript.command(idx);
      GLOBAL.CardTypes[this.currentCard().type]--;
      this.node.runAction(cc.sequence(
        cc.spawn(
          cc.moveBy(0.25, 0, 300),
          cc.scaleTo(0.25, 1.25, 1.25),
          cc.fadeOut(0.25),
        ),
        cc.callFunc(() => {
          this.drawCard();
        }),
        cc.place(this._initialPosition),
        cc.delayTime(1),
        cc.spawn(
          cc.scaleTo(0.25, 1, 1),
          cc.fadeIn(0.25),
        ),
      ));
    }
  }

  public update(dt) {
    if (this._canBeUsed()) {
      this.cardName.node.color = this._initialNameColor;
      this.elixir.node.color = this._initialElixirColor;
    } else {
      this.cardName.node.color = new cc.Color(150, 150, 150);
      this.elixir.node.color = new cc.Color(150, 150, 150);
    }
  }

  private _canBeUsed() {
    return GLOBAL.PlayerScript
      && GLOBAL.PlayerScript.elixir >= this.currentCard().elixir
      && GLOBAL.PlayerScript.bullet > this.currentCard().bullet;
  }

  private drawCard() {
    while (true) {
      _seq++;
      const draw = _cards[_seq % _cards.length];
      if (!GLOBAL.CardTypes[draw.type]) {
        this._currentCard = draw;
        this.cardName.string = this._currentCard.cardName;
        this.elixir.string = this._currentCard.elixir.toString();
        GLOBAL.CardTypes[draw.type] = 1;
        console.log("KEEY", draw.cardName);
        console.log(GLOBAL.CardTypes);
        return;
      }
      console.log("DROP", draw.cardName);
      console.log(GLOBAL.CardTypes);
    }
  }

  private currentCard() {
    return this._currentCard;
  }

}

function shuffle<T>(a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
