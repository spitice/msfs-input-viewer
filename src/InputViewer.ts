
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
        frame: ingameUiElement,
        cont: HTMLElement,
        openConf: HTMLElement,
    };

    constructor() {
        super();
    }

    connectedCallback() {
        this._isConnected = true;

        const elFrame = document.getElementById( "InputViewer_Frame" )! as ingameUiElement;

        const find = ( id: string ) => {
            const query = "#" + id;
            const el = elFrame.querySelector( query ) as HTMLElement;
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

        const findNumberDisplay = ( id: string ): NumberDisplayElements => {
            const parent = find( id );
            const findNum = ( className: string ) => {
                const query = "." + className;
                const el = parent.querySelector( `.numberDisp.${className}` ) as HTMLElement;
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

        const elCont            = find( "InputViewer_Container" );
        const elOpenConf        = find( "OpenConfig" );
        const elConfCont        = find( "ConfigPopup_Container" );
        const elConfClose       = find( "Config_Close" );
        const elConfScroll      = find( "Config_ScrollCont" );
        const elConfNumericDisp = find( "Config_NumericDisp" ) as NewListButtonElement;
        const elConfQHideDur    = find( "Config_QuickHideDuration" ) as NewListButtonElement;
        const elConfPropMix     = find( "Config_TogglePropMix" ) as ToggleButtonElement;

        this._el = {
            frame: elFrame,
            cont: elCont,
            openConf: elOpenConf,
        };

        elOpenConf.addEventListener( "OnValidate", e => {
            // Open the config popup
            elConfCont.classList.remove( "hide" );
            (elConfScroll as any).delayedUpdateSizes();
        } );
        elConfClose.addEventListener( "OnValidate", e => {
            // Close the config popup
            elConfCont.classList.add( "hide" );
        } );

        makePropMixToggleButton( elConfPropMix );
        elConfPropMix.addEventListener( "OnValidate", e => {
            const toggle = e.target as any as { getValue: () => boolean };
            store.dispatch( A.setEnablePropMixBar( toggle.getValue() ) );
        } );

        elConfNumericDisp.addEventListener( "OnValidate", e => {
            const input = elConfNumericDisp;
            const choice = input.choices[input.getCurrentValue()];
            console.log( "CHOICE: ", input.getCurrentValue(), choice );

            store.dispatch( A.setNumberDisplayType( choice as any ) );
        } );
        elConfQHideDur.addEventListener( "OnValidate", e => {
            const input = elConfQHideDur;
            const value = input.getCurrentValue();
            store.dispatch( A.setQuickHideDuration( value ) );
        } );

        UIElements.el = {
            frame: elFrame,

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
            numberSimple: findNumberDisplay( "NumberDisp_Simple_Container" ),
            numberVerbose: findNumberDisplay( "NumberDisp_Verbose_Container" ),

            mainThrottlePanel: find( "ThrottlePanel" ),
            numberSimpleContainer: find( "NumberDisp_Simple_Container" ),
            numberVerboseContainer: find( "NumberDisp_Verbose_Container" ),
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


        elCont.addEventListener( "dblclick", this._onDoubleClick );

        // TODO: Use ToolBarListener for this handlers
        window.addEventListener( "resize", this._onResize );
        // When you close an externalized panel, "resize" event will be emitted
        // before ".extern" is removed from the ingameUi element so we need this
        // listener to approproately update our widget dimension.
        elFrame.addEventListener( "ToggleExternPanel", this._onResize );

        document.addEventListener( "dataStorageReady", this._onStorageReady );
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        document.addEventListener( "dataStorageReady", this._onStorageReady );
        this._el.cont.removeEventListener( "dblclick", this._onDoubleClick );
        window.removeEventListener( "resize", this._onResize );
        this._el.frame.removeEventListener( "ToggleExternPanel", this._onResize );

        UIElements.el = {} as any;

        this._isConnected = false;
    }

    _onResize = ( e?: Event ) => {
        // Calculate the dimensions of the widget
        //
        // Since the return value of `getBoundingClientRect` is not synchronized
        // as in-game panel gets resized or externalized, we would rely on
        // in-game panel window's size here.
        const _style = window.document.documentElement.style;
        
        const panelWidth = Number( _style.getPropertyValue( "--viewportWidth" ) ); // window.top.innerWidth;
        const panelHeight = Number( _style.getPropertyValue( "--viewportHeight" ) ); // window.top.innerHeight;
        const screenHeight = Number( _style.getPropertyValue( "--screenHeight" ) );

        const scaled = ( v: number ) => screenHeight * v / 2160;
        const contentMargin = scaled( 6 );

        const headerHeight = scaled( 84 /* height */ + 3 /* margin-bottom */ );
        const isExtern = document.body.classList.contains( "extern" );

        const contWidth = panelWidth - contentMargin * 2;
        const contHeight = panelHeight - contentMargin * 2 - ( isExtern ? 0 : headerHeight );
        
        const widgetAspectRatio = 280 / 260;
        const widgetWidth = Math.min(
            contWidth,
            contHeight * widgetAspectRatio
        );

        const contStyle = this._el.cont.style;
        contStyle.setProperty( "--containerWidth", contWidth + "px" );
        contStyle.setProperty( "--containerHeight", contHeight + "px" );
        contStyle.setProperty( "--widgetWidth", widgetWidth + "px" );

        // debugMsg(
        //     `Is Extern?: ${isExtern}\n` +
        //     `Panel Width: ${panelWidth}\n` +
        //     `Panel Height: ${panelHeight}\n` +
        //     `Widget Width: ${widgetWidth}`
        // );
    };

    _onStorageReady = ( e?: Event ) => {
        store.dispatch( A.setStorageReady( true ) );
    };

    _onUpdate() {
        if ( !SimVar.IsReady() ) {
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
