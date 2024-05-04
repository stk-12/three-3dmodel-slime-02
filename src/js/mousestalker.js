import { lerp } from "utils.js";

export class MouseStalker {
  constructor(viewport, el) {
    this.viewport = viewport;
    this.stalker = el;
    this.stalkerPosition = { x: this.viewport.width / 2, y: this.viewport.height / 2 };
    this.cursor = { x: 0, y: 0 };

    this._addEvent();
  }


  update() {

  }

  _onMousemove() {
    
  }

  _addEvent() {
    window.addEventListener("mousemove", this._onMousemove.bind(this));
  }
}