import { Box, Connector } from "./Basic.js";
import { Gate, LogicGateFunction, availableGates } from "./Gates.js";

const fixedBuffer = (a: boolean[], i: number) => {
  return () => a[i];
};

class PopupMenu {
  /**
   * @type {PopupMenu|null} instance
   * */
  static instance: PopupMenu | null = null;
  ele: HTMLElement;
  /**
   * @param {number} x
   * @param {number} y
   * @param {String[]} options
   * @param {(key: string) => undefined} callback
   **/
  constructor(x: number, y: number, options: string[], callback: Function) {
    if (PopupMenu.instance) PopupMenu.instance.remove();
    PopupMenu.instance = this;

    this.ele = document.createElement("div");
    this.ele.classList.add("popup");
    for (const opt of options) {
      const p = document.createElement("p");
      p.innerText = opt;
      p.onclick = () => {
        this.remove();
        callback(opt);
      };
      this.ele.appendChild(p);
      this.ele.style.top = y + "px";
      this.ele.style.left = x + "px";
    }
  }
  remove() {
    PopupMenu.instance = null;
    this.ele.remove();
  }
  render(parentEle: HTMLElement) {
    parentEle.appendChild(this.ele);
  }
}

export default class Simulation {
  /**
   * @param {boolean[]} inputValuesArr
   * @param {number} outputCount
   * @param {HTMLElement} mainEle
   * @param {HTMLCanvasElement} canvasEle
   */
  mainEle: HTMLElement;
  inputValues: boolean[];
  inputCount: number;
  outputCount: number;
  outputBufferGate: Gate;
  constructor(
    inputValuesArr: boolean[],
    outputCount: number,
    mainEle: HTMLElement,
    canvasEle: HTMLCanvasElement
  ) {
    new Connector(mainEle, canvasEle);
    globalThis.gridHeight = mainEle.clientHeight;
    globalThis.gridWidth = mainEle.clientWidth;

    this.mainEle = mainEle;

    this.inputValues = [...inputValuesArr];
    this.inputCount = inputValuesArr.length;
    this.outputCount = outputCount;

    let inputBufferFuncs = [];
    for (let i = 0; i < this.inputCount; i++) {
      inputBufferFuncs.push(fixedBuffer(this.inputValues, i));
    }

    const mainEleRect = mainEle.getBoundingClientRect();
    const inputBufferGate = new Gate("INPUT BUFFER", 0, inputBufferFuncs);
    const inputBox = new Box(
      0,
      mainEleRect.height / 2 - 100,
      50,
      200,
      inputBufferGate
    );
    this.outputBufferGate = new Gate("OUTPUT BUFFER", outputCount, []);
    const outputBox = new Box(
      mainEleRect.width,
      mainEleRect.height / 2 - 100,
      50,
      200,
      this.outputBufferGate
    );

    inputBox.render(mainEle);
    outputBox.render(mainEle);

    mainEle.addEventListener("contextmenu", (e) => {
      // ignore bubbled events
      if (e.target != mainEle) return;
      e.preventDefault();

      const x = e.offsetX,
        y = e.offsetY;
      new PopupMenu(x, y, Object.keys(availableGates), (key: string) => {
        this.addGate(key, x, y, availableGates[key].in, [
          availableGates[key].logic,
        ]);
      }).render(this.mainEle);
    });
  }
  /**
   * @param {String} name
   * @param {number} x
   * @param {number} y
   * @param {CallableFunction[]} outLogicFuncs
   * @param {number} inCount
   * */
  addGate(
    name: string,
    x: number,
    y: number,
    inCount: number,
    outLogicFuncs: LogicGateFunction[]
  ) {
    const gate = new Gate(name, inCount, outLogicFuncs);
    const b = new Box(x, y, 150, 100, gate);
    b.render(this.mainEle);
  }
  /**
   * @param {number} index
   * @param {boolean} value
   * */
  updateInput(index: number, value: boolean) {
    if (index < 0 || this.inputCount <= index)
      throw "cannot update index " + index;
    if (typeof value != "boolean") throw "cannot update to value " + value;
    this.inputValues[index] = value;
  }
  /**
   * @returns {boolean[]}
   * */
  fetchOutputs(): boolean[] {
    return this.outputBufferGate.fetchAllInputs();
  }
}