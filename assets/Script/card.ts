import { Global } from "./global";
import Player from "./player";

const { ccclass, property } = cc._decorator;


interface CardDeck {
  cardName: string;
  elixir: number;
  bullet: number;
  action: () => void;
}

const aimAndShoot: CardDeck = {
  cardName: "Aim and Shoot".toUpperCase(), elixir: 3, bullet: 1, action: () => {
    Global.PlayerScript.shoot();
  }
};

const Cards: CardDeck[] = [

  aimAndShoot, aimAndShoot, aimAndShoot, aimAndShoot,

  {
    cardName: "Up +1".toUpperCase(), elixir: 1, bullet: 0, action: () => {
      Global.PlayerScript.move("up");
    }
  },
  {
    cardName: "Left +1".toUpperCase(), elixir: 1, bullet: 0, action: () => {
      Global.PlayerScript.move("left");
    }
  },
  {
    cardName: "Right +1".toUpperCase(), elixir: 1, bullet: 0, action: () => {
      Global.PlayerScript.move("right");
    }
  },
  {
    cardName: "Down +1".toUpperCase(), elixir: 1, bullet: 0, action: () => {
      Global.PlayerScript.move("down");
    }
  },

  {
    cardName: "Up +3".toUpperCase(), elixir: 2, bullet: 0, action: () => {
      Global.PlayerScript.move("up");
      Global.PlayerScript.move("up");
      Global.PlayerScript.move("up");
    }
  },
  {
    cardName: "Left +3".toUpperCase(), elixir: 2, bullet: 0, action: () => {
      Global.PlayerScript.move("left");
      Global.PlayerScript.move("left");
      Global.PlayerScript.move("left");
    }
  },
  {
    cardName: "Right +3".toUpperCase(), elixir: 2, bullet: 0, action: () => {
      Global.PlayerScript.move("right");
      Global.PlayerScript.move("right");
      Global.PlayerScript.move("right");
    }
  },
  {
    cardName: "Down +3".toUpperCase(), elixir: 2, bullet: 0, action: () => {
      Global.PlayerScript.move("down");
      Global.PlayerScript.move("down");
      Global.PlayerScript.move("down");
    }
  },

  {
    cardName: "Bullet +2".toUpperCase(), elixir: 2, bullet: 0, action: () => {
      Global.PlayerScript.bullet += 2;
    }
  },

  {
    cardName: "Health +1".toUpperCase(), elixir: 2, bullet: 0, action: () => {
      Global.PlayerScript.health += 1;
    }
  },
]

@ccclass
export default class Card extends cc.Component {

  @property(cc.Label)
  cardName: cc.Label = null;

  @property(cc.Label)
  elixir: cc.Label = null;

  private _cards: CardDeck[];
  private _seq: number = 0;
  private _initialPosition: cc.Vec2;
  private _initialNameColor: cc.Color;
  private _initialElixirColor: cc.Color;

  onLoad() {
    this._initialPosition = this.node.position;
    this._initialElixirColor = this.elixir.node.color;
    this._initialNameColor = this.cardName.node.color;
    this._cards = shuffle(Cards.slice(0));
    this.drawCard();
  }

  private drawCard() {
    this._seq++;
    const card = this.currentCard();
    this.cardName.string = card.cardName;
    this.elixir.string = card.elixir.toString();
  }

  private currentCard() {
    return this._cards[this._seq % this._cards.length];
  }

  onClick(e: cc.Event.EventMouse) {
    if (this._canBeUsed()) {
      Global.PlayerScript.elixir = Global.PlayerScript.elixir - this.currentCard().elixir;
      this.currentCard().action();
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
        cc.spawn(
          cc.scaleTo(0.25, 1, 1),
          cc.fadeIn(0.25),
        )
      ));
    }
  }

  update(dt) {
    if (this._canBeUsed()) {
      this.cardName.node.color = this._initialNameColor;
      this.elixir.node.color = this._initialElixirColor;
    } else {
      this.cardName.node.color = new cc.Color(150, 150, 150);
      this.elixir.node.color = new cc.Color(150, 150, 150);
    }
  }

  private _canBeUsed() {
    return Global.PlayerScript.elixir >= this.currentCard().elixir;
  }

}

function shuffle<T>(a: Array<T>): Array<T> {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}