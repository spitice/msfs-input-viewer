(() => {
    "use strict";
    var __webpack_modules__ = [ , (__unused_webpack_module, exports) => {
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.shallowEq = exports.zip = exports.setTranslate = exports.appendDebugMsg = exports.debugMsg = exports.safeCall = void 0, 
        exports.safeCall = function(fn) {
            return (...args) => {
                try {
                    return fn(...args);
                } catch (e) {
                    document.querySelector("#DevOverlay .error").innerText = "" + e;
                }
            };
        }, exports.debugMsg = function(...args) {
            document.querySelector("#DevOverlay .info").innerText = "" + args.join(" ");
        }, exports.appendDebugMsg = function(...args) {
            document.querySelector("#DevOverlay .info").innerText += args.join(" ") + "\n";
        }, exports.setTranslate = function(el, x, y) {
            el.setAttribute("transform", `translate(${x}, ${y})`);
        }, exports.zip = function(a, b) {
            if (a.length != b.length) throw new Error("zip: Mismatched number of items");
            return a.map(((aa, idx) => [ aa, b[idx] ]));
        }, exports.shallowEq = function(a, b) {
            if (a.length != b.length) return !1;
            for (let i = 0; i < a.length; i++) if (a[i] != b[i]) return !1;
            return !0;
        };
    }, (__unused_webpack_module, exports, __webpack_require__) => {
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.EngineHandler = exports.VBarHandler = exports.HBarHandler = exports.RudderHandler = exports.StickHandler = exports.InputHandler = void 0;
        const simVarObserver_1 = __webpack_require__(3), utils_1 = __webpack_require__(1);
        class InputHandler {
            constructor(names, unit) {
                Array.isArray(names) ? this._observer = new simVarObserver_1.MultiSimVarObserver(names, unit, ((newValues, oldValues) => this.onChangeMulti(newValues, oldValues))) : this._observer = new simVarObserver_1.SimVarObserver(names, unit, ((newValue, oldValue) => this.onChange(newValue, oldValue)));
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
        exports.StickHandler = class extends InputHandler {
            constructor(_el, names, unit) {
                super(names, unit), this._el = _el;
            }
            onChangeMulti([x, y]) {
                utils_1.setTranslate(this._el, 100 * x, 100 * y);
            }
        };
        exports.RudderHandler = class extends InputHandler {
            constructor(_el, name, unit) {
                super(name, unit), this._el = _el;
            }
            onChange(x) {
                utils_1.setTranslate(this._el, 100 * x, 0);
            }
        };
        class BarHandler extends InputHandler {
            constructor(elBar, name) {
                if (super(name, "position"), this.elForeground = elBar.querySelector(".fg"), this.elCap = elBar.querySelector(".cap"), 
                !this.elForeground) throw new Error("The bar foreground element is not found for " + name);
                if (!this.elCap) throw new Error("The bar cap element is not found for " + name);
            }
        }
        exports.HBarHandler = class extends BarHandler {
            onChange(x) {
                x *= 100, this.elForeground.setAttribute("width", "" + x), utils_1.setTranslate(this.elCap, x, 0);
            }
        };
        exports.VBarHandler = class extends BarHandler {
            onChange(y) {
                y *= 100, this.elForeground.setAttribute("height", "" + y), utils_1.setTranslate(this.elCap, 0, y);
            }
        };
        exports.EngineHandler = class extends InputHandler {
            constructor(_elThrottlePanel) {
                super("NUMBER OF ENGINES", "number"), this._elThrottlePanel = _elThrottlePanel, 
                this._isPropMixEnabled = !1, this._numEngines = 1, this._validate();
            }
            onChange(numEngines) {
                this._numEngines = numEngines, this._validate();
            }
            set isPropMixEnabled(v) {
                this._isPropMixEnabled = v, this._validate();
            }
            _validate() {
                let mode = "PropMix";
                this._isPropMixEnabled || (mode = this._numEngines <= 1 ? "SingleEngine" : 2 == this._numEngines ? "TwinEngine" : 3 == this._numEngines ? "ThreeEngine" : "FourEngine"), 
                this._elThrottlePanel.setAttribute("data-mode", mode), console.log("mode: " + mode);
            }
        };
    }, (__unused_webpack_module, exports, __webpack_require__) => {
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.MultiSimVarObserver = exports.SimVarObserver = void 0;
        const utils_1 = __webpack_require__(1);
        exports.SimVarObserver = class {
            constructor(name, unit, onChange) {
                this.name = name, this.unit = unit, this.onChange = onChange;
            }
            update() {
                const oldValue = this.value, newValue = SimVar.GetSimVarValue(this.name, this.unit);
                newValue != oldValue && (this.value = newValue, this.onChange(newValue, oldValue));
            }
        };
        exports.MultiSimVarObserver = class {
            constructor(names, units, onChange) {
                this.names = names, this.units = units, this.onChange = onChange;
            }
            update() {
                const {units, values: oldValues} = this;
                let newValues;
                newValues = Array.isArray(units) ? utils_1.zip(this.names, units).map((([name, unit]) => SimVar.GetSimVarValue(name, unit))) : this.names.map((name => SimVar.GetSimVarValue(name, units))), 
                oldValues && utils_1.shallowEq(newValues, oldValues) || (this.values = newValues, 
                this.onChange(newValues, oldValues));
            }
        };
    }, (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
        __webpack_require__.r(__webpack_exports__);
    } ], __webpack_module_cache__ = {};
    function __webpack_require__(moduleId) {
        var cachedModule = __webpack_module_cache__[moduleId];
        if (void 0 !== cachedModule) return cachedModule.exports;
        var module = __webpack_module_cache__[moduleId] = {
            exports: {}
        };
        return __webpack_modules__[moduleId](module, module.exports, __webpack_require__), 
        module.exports;
    }
    __webpack_require__.r = exports => {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(exports, Symbol.toStringTag, {
            value: "Module"
        }), Object.defineProperty(exports, "__esModule", {
            value: !0
        });
    };
    var __webpack_exports__ = {};
    (() => {
        var exports = __webpack_exports__;
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const utils_1 = __webpack_require__(1), inputHandler_1 = __webpack_require__(2);
        __webpack_require__(4);
        class InputViewerElement extends TemplateElement {
            constructor() {
                super(), this._isConnected = !1, this._inputHandlers = [], this._safeConnectedCallback = utils_1.safeCall((() => {
                    this._isConnected = !0;
                    const elFrame = document.getElementById("InputViewer_Frame"), elCont = document.getElementById("InputViewer_Container"), elToggle = document.getElementById("TogglePropMix"), elThrottlePanel = document.getElementById("ThrottlePanel");
                    this._el = {
                        frame: elFrame,
                        cont: elCont
                    };
                    const engineHandler = new inputHandler_1.EngineHandler(elThrottlePanel);
                    elToggle.addEventListener("created", (e => {
                        const elToggleWrap = elToggle.querySelector(".toggleButtonWrapper .toggleButton"), elState = elToggleWrap.querySelector(".state"), createIcon = (id, svg) => {
                            const elIcon = document.createElement("icon-element");
                            elIcon.setAttribute("id", id), elIcon.setAttribute("data-url", "/InGamePanels/InputViewer/images/" + svg), 
                            elToggleWrap.insertBefore(elIcon, elState);
                        };
                        createIcon("MixtureIcon", "mixture.svg"), createIcon("PropellerIcon", "propeller.svg");
                    })), elToggle.addEventListener("OnValidate", (e => {
                        const toggle = e.target;
                        engineHandler.isPropMixEnabled = toggle.getValue();
                    }));
                    const find = id => {
                        const query = "#" + id, el = elCont.querySelector(query);
                        if (!el) throw new Error(query + " not found");
                        return el;
                    };
                    this._inputHandlers = [ new inputHandler_1.StickHandler(find("StickInputPos"), [ "AILERON POSITION", "ELEVATOR POSITION" ], "position"), new inputHandler_1.StickHandler(find("StickTrimPos"), [ "AILERON TRIM PCT", "ELEVATOR TRIM PCT" ], "percent over 100"), new inputHandler_1.RudderHandler(find("RudderInputPos"), "RUDDER POSITION", "position"), new inputHandler_1.RudderHandler(find("RudderTrimPos"), "RUDDER TRIM PCT", "percent over 100"), new inputHandler_1.HBarHandler(find("WheelBrakeBar_Left"), "BRAKE LEFT POSITION"), new inputHandler_1.HBarHandler(find("WheelBrakeBar_Right"), "BRAKE RIGHT POSITION"), new inputHandler_1.VBarHandler(find("ThrottleBar_1"), "GENERAL ENG THROTTLE LEVER POSITION:1"), new inputHandler_1.VBarHandler(find("ThrottleBar_2"), "GENERAL ENG THROTTLE LEVER POSITION:2"), new inputHandler_1.VBarHandler(find("ThrottleBar_3"), "GENERAL ENG THROTTLE LEVER POSITION:3"), new inputHandler_1.VBarHandler(find("ThrottleBar_4"), "GENERAL ENG THROTTLE LEVER POSITION:4"), new inputHandler_1.VBarHandler(find("PropellerBar_1"), "GENERAL ENG PROPELLER LEVER POSITION:1"), new inputHandler_1.VBarHandler(find("MixtureBar_1"), "GENERAL ENG MIXTURE LEVER POSITION:1"), engineHandler ];
                    const updateLoop = () => {
                        this._isConnected && (this._onUpdate(), requestAnimationFrame(updateLoop));
                    };
                    requestAnimationFrame(updateLoop), window.addEventListener("resize", this._onResize), 
                    elFrame.addEventListener("ToggleExternPanel", this._onResize);
                })), this._queueResize = () => {
                    setTimeout((() => this._onResize()), .1);
                }, this._onResize = utils_1.safeCall((e => {
                    const _style = window.document.documentElement.style, panelWidth = Number(_style.getPropertyValue("--viewportWidth")), panelHeight = Number(_style.getPropertyValue("--viewportHeight")), screenHeight = Number(_style.getPropertyValue("--screenHeight")), scaled = v => screenHeight * v / 2160, contentMargin = scaled(6), headerHeight = scaled(87), contWidth = panelWidth - 2 * contentMargin, contHeight = panelHeight - 2 * contentMargin - (document.body.classList.contains("extern") ? 0 : headerHeight), widgetWidth = Math.min(contWidth, contHeight * (280 / 260)), contStyle = this._el.cont.style;
                    contStyle.setProperty("--containerWidth", contWidth + "px"), contStyle.setProperty("--containerHeight", contHeight + "px"), 
                    contStyle.setProperty("--widgetWidth", widgetWidth + "px");
                })), this._onUpdate = utils_1.safeCall((() => {
                    SimVar.IsReady() && this._inputHandlers.forEach((handler => handler.update()));
                }));
            }
            connectedCallback() {
                this._safeConnectedCallback();
            }
            disconnectedCallback() {
                super.disconnectedCallback(), this._el.frame.removeEventListener("ToggleExternPanel", this._onResize), 
                window.removeEventListener("resize", this._onResize), this._isConnected = !1;
            }
        }
        window.customElements.define("ingamepanel-input-viewer", InputViewerElement), checkAutoload();
    })();
})();