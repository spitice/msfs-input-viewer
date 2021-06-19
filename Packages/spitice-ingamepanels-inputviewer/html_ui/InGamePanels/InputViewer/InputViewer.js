/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.shallowEq = exports.zip = exports.setTranslate = exports.appendDebugMsg = exports.debugMsg = exports.safeCall = void 0;
function safeCall(fn) {
    return (...args) => {
        try {
            return fn(...args);
        }
        catch (e) {
            const elError = document.querySelector("#DevOverlay .error");
            elError.innerText = "" + e;
        }
    };
}
exports.safeCall = safeCall;
function debugMsg(...args) {
    const elDebugMsg = document.querySelector("#DevOverlay .info");
    elDebugMsg.innerText = "" + args.join(" ");
}
exports.debugMsg = debugMsg;
function appendDebugMsg(...args) {
    const elDebugMsg = document.querySelector("#DevOverlay .info");
    elDebugMsg.innerText += "" + args.join(" ") + "\n";
}
exports.appendDebugMsg = appendDebugMsg;
function setTranslate(el, x, y) {
    el.setAttribute("transform", `translate(${x}, ${y})`);
}
exports.setTranslate = setTranslate;
function zip(a, b) {
    if (a.length != b.length) {
        throw new Error("zip: Mismatched number of items");
    }
    return a.map((aa, idx) => [aa, b[idx]]);
}
exports.zip = zip;
function shallowEq(a, b) {
    if (a.length != b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i] != b[i]) {
            return false;
        }
    }
    return true;
}
exports.shallowEq = shallowEq;


/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EngineHandler = exports.VBarHandler = exports.HBarHandler = exports.RudderHandler = exports.StickHandler = exports.InputHandler = void 0;
const simVarObserver_1 = __webpack_require__(3);
const utils_1 = __webpack_require__(1);
class InputHandler {
    constructor(names, unit) {
        if (!Array.isArray(names)) {
            this._observer = new simVarObserver_1.SimVarObserver(names, unit, (newValue, oldValue) => this.onChange(newValue, oldValue));
        }
        else {
            this._observer = new simVarObserver_1.MultiSimVarObserver(names, unit, (newValues, oldValues) => this.onChangeMulti(newValues, oldValues));
        }
    }
    update() {
        this._observer.update();
    }
    onChange(newValue, oldValue) {
        throw new Error("Not implemented");
    }
    onChangeMulti(newValues, oldValues) {
        throw new Error("Not implemented");
    }
}
exports.InputHandler = InputHandler;
class StickHandler extends InputHandler {
    constructor(_el, names, unit) {
        super(names, unit);
        this._el = _el;
    }
    onChangeMulti([x, y]) {
        utils_1.setTranslate(this._el, x * 100, y * 100);
    }
}
exports.StickHandler = StickHandler;
class RudderHandler extends InputHandler {
    constructor(_el, name, unit) {
        super(name, unit);
        this._el = _el;
    }
    onChange(x) {
        utils_1.setTranslate(this._el, x * 100, 0);
    }
}
exports.RudderHandler = RudderHandler;
class BarHandler extends InputHandler {
    constructor(elBar, name) {
        super(name, "position");
        this.elForeground = elBar.querySelector(".fg");
        this.elCap = elBar.querySelector(".cap");
        if (!this.elForeground) {
            throw new Error("The bar foreground element is not found for " + name);
        }
        if (!this.elCap) {
            throw new Error("The bar cap element is not found for " + name);
        }
    }
}
class HBarHandler extends BarHandler {
    onChange(x) {
        x = x * 100;
        this.elForeground.setAttribute("width", "" + x);
        utils_1.setTranslate(this.elCap, x, 0);
    }
}
exports.HBarHandler = HBarHandler;
class VBarHandler extends BarHandler {
    onChange(y) {
        y = y * 100;
        this.elForeground.setAttribute("height", "" + y);
        utils_1.setTranslate(this.elCap, 0, y);
    }
}
exports.VBarHandler = VBarHandler;
class EngineHandler extends InputHandler {
    constructor(_elThrottlePanel) {
        super("NUMBER OF ENGINES", "number");
        this._elThrottlePanel = _elThrottlePanel;
        this._isPropMixEnabled = false;
        this._numEngines = 1;
        this._validate();
    }
    onChange(numEngines) {
        this._numEngines = numEngines;
        this._validate();
    }
    set isPropMixEnabled(v) {
        this._isPropMixEnabled = v;
        this._validate();
    }
    _validate() {
        let mode = "PropMix";
        if (!this._isPropMixEnabled) {
            if (this._numEngines <= 1) {
                mode = "SingleEngine";
            }
            else if (this._numEngines == 2) {
                mode = "TwinEngine";
            }
            else if (this._numEngines == 3) {
                mode = "ThreeEngine";
            }
            else {
                mode = "FourEngine";
            }
        }
        this._elThrottlePanel.setAttribute("data-mode", mode);
        console.log("mode: " + mode);
    }
}
exports.EngineHandler = EngineHandler;


/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/// <reference path="../types/msfs.d.ts" />
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MultiSimVarObserver = exports.SimVarObserver = void 0;
const utils_1 = __webpack_require__(1);
class SimVarObserver {
    constructor(name, unit, onChange) {
        this.name = name;
        this.unit = unit;
        this.onChange = onChange;
    }
    update() {
        const oldValue = this.value;
        const newValue = SimVar.GetSimVarValue(this.name, this.unit);
        if (newValue == oldValue) {
            // Not changed
            return;
        }
        this.value = newValue;
        this.onChange(newValue, oldValue);
    }
}
exports.SimVarObserver = SimVarObserver;
class MultiSimVarObserver {
    constructor(names, units, onChange) {
        this.names = names;
        this.units = units;
        this.onChange = onChange;
    }
    update() {
        const { units, values: oldValues, } = this;
        let newValues;
        if (!Array.isArray(units)) {
            newValues = this.names.map(name => SimVar.GetSimVarValue(name, units));
        }
        else {
            newValues = utils_1.zip(this.names, units).map(([name, unit]) => SimVar.GetSimVarValue(name, unit));
        }
        if (oldValues && utils_1.shallowEq(newValues, oldValues)) {
            // Nothing has been changed
            return;
        }
        this.values = newValues;
        this.onChange(newValues, oldValues);
    }
}
exports.MultiSimVarObserver = MultiSimVarObserver;


/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.makePropMixToggleButton = void 0;
function makePropMixToggleButton(el) {
    el.classList.add("togglePropMix");
    el.addEventListener("created", e => {
        const elToggleWrap = el.querySelector(".toggleButtonWrapper .toggleButton");
        const elState = elToggleWrap.querySelector(".state");
        const createIcon = (id, svg) => {
            const elIcon = document.createElement("icon-element");
            elIcon.setAttribute("id", id);
            elIcon.setAttribute("data-url", "/InGamePanels/InputViewer/images/" + svg);
            elToggleWrap.insertBefore(elIcon, elState);
        };
        createIcon("MixtureIcon", "mixture.svg");
        createIcon("PropellerIcon", "propeller.svg");
    });
}
exports.makePropMixToggleButton = makePropMixToggleButton;


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

/// <reference path="./types/msfs.d.ts" />
Object.defineProperty(exports, "__esModule", ({ value: true }));
const utils_1 = __webpack_require__(1);
const inputHandler_1 = __webpack_require__(2);
const makePropMixToggleButton_1 = __webpack_require__(5);
__webpack_require__(4);
class InputViewerElement extends TemplateElement {
    constructor() {
        super();
        this._isConnected = false;
        this._inputHandlers = [];
        this._safeConnectedCallback = utils_1.safeCall(() => {
            this._isConnected = true;
            const elFrame = document.getElementById("InputViewer_Frame");
            const find = (id) => {
                const query = "#" + id;
                const el = elFrame.querySelector(query);
                if (!el) {
                    throw new Error(query + " not found");
                }
                return el;
            };
            const elCont = find("InputViewer_Container");
            const elThrottlePanel = find("ThrottlePanel");
            const elOpenConf = find("OpenConfig");
            const elConfCont = find("ConfigPopup_Container");
            const elConfClose = find("Config_Close");
            const elConfScroll = find("Config_ScrollCont");
            const elConfNumericDisp = find("Config_NumericDisp");
            const elConfPropMix = find("Config_TogglePropMix");
            this._el = {
                frame: elFrame,
                cont: elCont,
            };
            elOpenConf.addEventListener("OnValidate", e => {
                // Open the config popup
                elConfCont.classList.remove("hide");
                elConfScroll.delayedUpdateSizes();
            });
            elConfClose.addEventListener("OnValidate", e => {
                // Close the config popup
                elConfCont.classList.add("hide");
            });
            const engineHandler = new inputHandler_1.EngineHandler(elThrottlePanel);
            makePropMixToggleButton_1.makePropMixToggleButton(elConfPropMix);
            elConfPropMix.addEventListener("OnValidate", e => {
                const toggle = e.target;
                engineHandler.isPropMixEnabled = toggle.getValue();
            });
            elConfNumericDisp.addEventListener("OnValidate", e => {
                const input = e.target;
                console.log("CHOICE: ", input.currentValue, input.choices[input.currentValue]);
            });
            // Populate input handlers
            this._inputHandlers = [
                new inputHandler_1.StickHandler(find("StickInputPos"), ["AILERON POSITION", "ELEVATOR POSITION"], "position"),
                new inputHandler_1.StickHandler(find("StickTrimPos"), ["AILERON TRIM PCT", "ELEVATOR TRIM PCT"], "percent over 100"),
                new inputHandler_1.RudderHandler(find("RudderInputPos"), "RUDDER POSITION", "position"),
                new inputHandler_1.RudderHandler(find("RudderTrimPos"), "RUDDER TRIM PCT", "percent over 100"),
                new inputHandler_1.HBarHandler(find("WheelBrakeBar_Left"), "BRAKE LEFT POSITION"),
                new inputHandler_1.HBarHandler(find("WheelBrakeBar_Right"), "BRAKE RIGHT POSITION"),
                new inputHandler_1.VBarHandler(find("ThrottleBar_1"), "GENERAL ENG THROTTLE LEVER POSITION:1"),
                new inputHandler_1.VBarHandler(find("ThrottleBar_2"), "GENERAL ENG THROTTLE LEVER POSITION:2"),
                new inputHandler_1.VBarHandler(find("ThrottleBar_3"), "GENERAL ENG THROTTLE LEVER POSITION:3"),
                new inputHandler_1.VBarHandler(find("ThrottleBar_4"), "GENERAL ENG THROTTLE LEVER POSITION:4"),
                new inputHandler_1.VBarHandler(find("PropellerBar_1"), "GENERAL ENG PROPELLER LEVER POSITION:1"),
                new inputHandler_1.VBarHandler(find("MixtureBar_1"), "GENERAL ENG MIXTURE LEVER POSITION:1"),
                engineHandler,
            ];
            // Set up update loop
            const updateLoop = () => {
                if (!this._isConnected) {
                    return;
                }
                this._onUpdate();
                requestAnimationFrame(updateLoop);
            };
            requestAnimationFrame(updateLoop);
            window.addEventListener("resize", this._onResize);
            // When you close an externalized panel, "resize" event will be emitted
            // before ".extern" is removed from the ingameUi element so we need this
            // listener to approproately update our widget dimension.
            elFrame.addEventListener("ToggleExternPanel", this._onResize);
        });
        this._queueResize = () => {
            // requestAnimationFrame( () => this._onResize() );
            setTimeout(() => this._onResize(), 0.1);
        };
        this._onResize = utils_1.safeCall((e) => {
            // Calculate the dimensions of the widget
            //
            // Since the return value of `getBoundingClientRect` is not synchronized
            // as in-game panel gets resized or externalized, we would rely on
            // in-game panel window's size here.
            const _style = window.document.documentElement.style;
            const panelWidth = Number(_style.getPropertyValue("--viewportWidth")); // window.top.innerWidth;
            const panelHeight = Number(_style.getPropertyValue("--viewportHeight")); // window.top.innerHeight;
            const screenHeight = Number(_style.getPropertyValue("--screenHeight"));
            const scaled = (v) => screenHeight * v / 2160;
            const contentMargin = scaled(6);
            const headerHeight = scaled(84 /* height */ + 3 /* margin-bottom */);
            const isExtern = document.body.classList.contains("extern");
            const contWidth = panelWidth - contentMargin * 2;
            const contHeight = panelHeight - contentMargin * 2 - (isExtern ? 0 : headerHeight);
            const widgetAspectRatio = 280 / 260;
            const widgetWidth = Math.min(contWidth, contHeight * widgetAspectRatio);
            const contStyle = this._el.cont.style;
            contStyle.setProperty("--containerWidth", contWidth + "px");
            contStyle.setProperty("--containerHeight", contHeight + "px");
            contStyle.setProperty("--widgetWidth", widgetWidth + "px");
            // debugMsg(
            //     `Is Extern?: ${isExtern}\n` +
            //     `Panel Width: ${panelWidth}\n` +
            //     `Panel Height: ${panelHeight}\n` +
            //     `Widget Width: ${widgetWidth}`
            // );
        });
        this._onUpdate = utils_1.safeCall(() => {
            if (!SimVar.IsReady()) {
                return;
            }
            // Update all SimVar observers
            this._inputHandlers.forEach(handler => handler.update());
        });
    }
    connectedCallback() {
        this._safeConnectedCallback();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._el.frame.removeEventListener("ToggleExternPanel", this._onResize);
        window.removeEventListener("resize", this._onResize);
        this._isConnected = false;
    }
}
window.customElements.define("ingamepanel-input-viewer", InputViewerElement);
checkAutoload();

})();

/******/ })()
;
//# sourceMappingURL=InputViewer.js.map