
import { store } from "./store";
import {
    appendDebugMsg,
    debugMsg,
} from "./inputViewer/utils";
import { makePropMixToggleButton } from "./inputViewer/makePropMixToggleButton";
import { inputViewerActions as A } from "./inputViewer/slice";
import {
    BarElements,
    NumberDisplayElements,
    UIElements,
} from "./inputViewer/uiElements";


import "./InputViewer.scss";

class InputViewerElement extends TemplateElement implements IUIElement {

    _isConnected: boolean = false;

    _el!: {
        uiFrame: ingameUiElement,
        panelGrid: HTMLElement,
        openConf: HTMLElement,
    };

    constructor() {
        super();
    }

    connectedCallback() {
        this._isConnected = true;

        const find = ( id: string ) => {
            const query = "#" + id;
            const el = this.querySelector( query ) as HTMLElement;
            if ( !el ) {
                throw new Error( query + " not found" );
            }
            return el;
        };

        const findBar = ( id: string ): BarElements => {
            const parent = find( id );
            return {
                fg: parent.querySelector( ".fg" )!,
                cap: parent.querySelector( ".cap" )!,
            };
        };

        const findNumberDisplay = ( id: string, component: "name" | "label" | "numberDisp" ): NumberDisplayElements => {
            const parent = find( id );
            const findNum = ( className: string ) => {
                const query = "." + className;
                const el = parent.querySelector( `.${component}.${className}` ) as HTMLElement;
                if ( !el ) {
                    throw new Error( query + " not found" );
                }
                return el;
            };

            return {
                aileron:        findNum( "aileron" ),
                aileronTrim:    findNum( "aileronTrim" ),
                elevator:       findNum( "elevator" ),
                elevatorTrim:   findNum( "elevatorTrim" ),
                rudder:         findNum( "rudder" ),
                rudderTrim:     findNum( "rudderTrim" ),
                brakeLeft:      findNum( "brakeLeft" ),
                brakeRight:     findNum( "brakeRight" ),
                throttle1:      findNum( "throttle1" ),
                throttle2:      findNum( "throttle2" ),
                throttle3:      findNum( "throttle3" ),
                throttle4:      findNum( "throttle4" ),
                propeller1:     findNum( "propeller1" ),
                mixture1:       findNum( "mixture1" ),
            };
        };

        const elUIFrame         = find( "InputViewer_UIFrame" ) as ingameUiElement;
        const elPanelGrid       = find( "PanelGrid" );
        const elOpenConf        = find( "OpenConfig" );
        const elConfClose       = find( "Config_Close" );
        const elConfScroll      = find( "Config_ScrollCont" );
        const elConfAutoHide    = find( "Config_AutoHideHeader" ) as ToggleButtonElement;
        const elConfPanels      = find( "Config_Panels" ) as NewListButtonElement;
        const elConfNumericDisp = find( "Config_NumericDisp" ) as NewListButtonElement;
        const elConfQHideDur    = find( "Config_QuickHideDuration" ) as NewListButtonElement;
        const elConfPropMix     = find( "Config_TogglePropMix" ) as ToggleButtonElement;

        this._el = {
            uiFrame: elUIFrame,
            panelGrid: elPanelGrid,
            openConf: elOpenConf,
        };

        elOpenConf.addEventListener( "OnValidate", e => {
            // Open the config popup
            this.setAttribute("data-config-opened", "true");
            (elConfScroll as any).delayedUpdateSizes();
        } );
        elConfClose.addEventListener( "OnValidate", e => {
            // Close the config popup
            this.setAttribute("data-config-opened", "false");
        } );

        elConfAutoHide.addEventListener( "OnValidate", e => {
            store.dispatch( A.setAutoHideHeader( elConfAutoHide.getValue() ) );
        } );

        makePropMixToggleButton( elConfPropMix );
        elConfPropMix.addEventListener( "OnValidate", e => {
            store.dispatch( A.setEnablePropMixBar( elConfPropMix.getValue() ) );
        } );

        elConfPanels.addEventListener( "OnValidate", e => {
            const input = elConfPanels;
            const choice = input.choices[input.getCurrentValue()];
            store.dispatch( A.setPanelsToShow( choice as any ) );
        } );
        elConfNumericDisp.addEventListener( "OnValidate", e => {
            const input = elConfNumericDisp;
            const choice = input.choices[input.getCurrentValue()];
            store.dispatch( A.setNumberDisplayType( choice as any ) );
        } );
        elConfQHideDur.addEventListener( "OnValidate", e => {
            const input = elConfQHideDur;
            const value = input.getCurrentValue();
            store.dispatch( A.setQuickHideDuration( value ) );
        } );

        UIElements.el = {
            root: this,
            uiFrame: elUIFrame,

            main: {
                stick:      find( "StickInputPos" ),
                stickTrim:  find( "StickTrimPos" ),
                rudder:     find( "RudderInputPos" ),
                rudderTrim: find( "RudderTrimPos" ),
                brakeLeft:  findBar( "WheelBrakeBar_Left" ),
                brakeRight: findBar( "WheelBrakeBar_Right" ),
                throttle1:  findBar( "ThrottleBar_1" ),
                throttle2:  findBar( "ThrottleBar_2" ),
                throttle3:  findBar( "ThrottleBar_3" ),
                throttle4:  findBar( "ThrottleBar_4" ),
                propeller1: findBar( "PropellerBar_1" ),
                mixture1:   findBar( "MixtureBar_1" ),
            },
            numberSimpleLabel: findNumberDisplay( "NumberDisp_Simple_Container", "name" ),
            numberSimple: findNumberDisplay( "NumberDisp_Simple_Container", "numberDisp" ),
            numberVerboseLabel: findNumberDisplay( "NumberDisp_Verbose_Container", "label" ),
            numberVerbose: findNumberDisplay( "NumberDisp_Verbose_Container", "numberDisp" ),

            confAutoHideHeader: elConfAutoHide,
            confPanels: elConfPanels,
            confNumericDisp: elConfNumericDisp,
            confQuickHideDuration: elConfQHideDur,
            confPropMix: elConfPropMix,
            confAircraftModel: find( "Config_AircraftModel" ),
        };

        // Set up update loop
        const updateLoop = () => {
            if ( !this._isConnected ) {
                return;
            }
            this._onUpdate();

            requestAnimationFrame( updateLoop );
        };
        requestAnimationFrame( updateLoop );


        elPanelGrid.addEventListener( "dblclick", this._onDoubleClick );

        // TODO: Use ToolBarListener for this handlers
        window.addEventListener( "resize", this._onResize );
        // When you close an externalized panel, "resize" event will be emitted
        // before ".extern" is removed from the ingameUi element so we need this
        // listener to approproately update our widget dimension.
        elUIFrame.addEventListener( "ToggleExternPanel", this._onResize );

        document.addEventListener( "dataStorageReady", this._onStorageReady );
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        document.addEventListener( "dataStorageReady", this._onStorageReady );
        this._el.panelGrid.removeEventListener( "dblclick", this._onDoubleClick );
        window.removeEventListener( "resize", this._onResize );
        this._el.uiFrame.removeEventListener( "ToggleExternPanel", this._onResize );

        UIElements.el = {} as any;

        this._isConnected = false;
    }

    _onResize = ( e?: Event ) => {
        // Calculate the dimensions of the widget
        //
        // Since the return value of `getBoundingClientRect` is not synchronized
        // as in-game panel gets resized or externalized, we would rely on
        // in-game panel window's size here.
        store.dispatch( A.updateWidgetScale() );
    };

    _onStorageReady = ( e?: Event ) => {
        store.dispatch( A.setStorageReady( true ) );
    };

    _onUpdate() {
        try {
            if ( !SimVar.IsReady() ) {
                // AS of Sim Update 5, this function causes an error when SimVar is not ready
                return;
            }
        } catch (e) {
            // Can't find variable: simvar
            return;
        }
        store.dispatch( A.fetchSimVar() );
    }

    _onDoubleClick = ( e: Event ) => {
        // console.log( e );
        if ( e.target === this._el.openConf ) {
            console.log( "Double clicked on Open Config button. Ignored." );
            return;
        }
        store.dispatch( A.quickHidePanel() );
    };
}

window.customElements.define( "ingamepanel-input-viewer", InputViewerElement );
checkAutoload();
