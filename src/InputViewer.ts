
/// <reference path="./types/msfs.d.ts" />

import {
    appendDebugMsg,
    debugMsg,
    safeCall,
} from "./inputViewer/utils";
import {
    EngineHandler,
    HBarHandler,
    InputHandler,
    RudderHandler,
    StickHandler,
    VBarHandler,
} from "./inputViewer/inputHandler";
import { makePropMixToggleButton } from "./inputViewer/makePropMixToggleButton";

import "./InputViewer.scss";


class InputViewerElement extends TemplateElement implements IUIElement {

    _isConnected: boolean = false;

    _el!: {
        frame: HTMLElement,
        cont: HTMLElement,
    };
    _inputHandlers: InputHandler<number>[] = [];

    constructor() {
        super();
    }

    connectedCallback() {
        this._safeConnectedCallback();
    }
     
    _safeConnectedCallback = safeCall( () => {
        this._isConnected = true;

        const elFrame = document.getElementById( "InputViewer_Frame" )!;

        const find = ( id: string ) => {
            const query = "#" + id;
            const el = elFrame.querySelector( query ) as HTMLElement;
            if ( !el ) {
                throw new Error( query + " not found" );
            }
            return el;
        };

        const elCont            = find( "InputViewer_Container" );
        const elThrottlePanel   = find( "ThrottlePanel" );
        const elOpenConf        = find( "OpenConfig" );
        const elConfCont        = find( "ConfigPopup_Container" );
        const elConfClose       = find( "Config_Close" );
        const elConfScroll      = find( "Config_ScrollCont" );
        const elConfNumericDisp = find( "Config_NumericDisp" );
        const elConfPropMix     = find( "Config_TogglePropMix" );

        this._el = {
            frame: elFrame,
            cont: elCont,
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

        const engineHandler = new EngineHandler( elThrottlePanel );

        makePropMixToggleButton( elConfPropMix );
        elConfPropMix.addEventListener( "OnValidate", e => {
            const toggle = e.target as any as { getValue: () => boolean };
            engineHandler.isPropMixEnabled = toggle.getValue();
        } );

        elConfNumericDisp.addEventListener( "OnValidate", e => {
            const input = e.target as any as NewListButtonElement;
            console.log( "CHOICE: ", input.currentValue, input.choices[input.currentValue] );
        } );

        // Populate input handlers
        this._inputHandlers = [
            new StickHandler( find( "StickInputPos" ), ["AILERON POSITION", "ELEVATOR POSITION"], "position" ),
            new StickHandler( find( "StickTrimPos" ), ["AILERON TRIM PCT", "ELEVATOR TRIM PCT"], "percent over 100" ),
            new RudderHandler( find( "RudderInputPos" ), "RUDDER POSITION", "position" ),
            new RudderHandler( find( "RudderTrimPos" ), "RUDDER TRIM PCT", "percent over 100" ),
            new HBarHandler( find( "WheelBrakeBar_Left" ), "BRAKE LEFT POSITION" ),
            new HBarHandler( find( "WheelBrakeBar_Right" ), "BRAKE RIGHT POSITION" ),
            new VBarHandler( find( "ThrottleBar_1" ), "GENERAL ENG THROTTLE LEVER POSITION:1" ),
            new VBarHandler( find( "ThrottleBar_2" ), "GENERAL ENG THROTTLE LEVER POSITION:2" ),
            new VBarHandler( find( "ThrottleBar_3" ), "GENERAL ENG THROTTLE LEVER POSITION:3" ),
            new VBarHandler( find( "ThrottleBar_4" ), "GENERAL ENG THROTTLE LEVER POSITION:4" ),
            new VBarHandler( find( "PropellerBar_1" ), "GENERAL ENG PROPELLER LEVER POSITION:1" ),
            new VBarHandler( find( "MixtureBar_1" ), "GENERAL ENG MIXTURE LEVER POSITION:1" ),
            engineHandler,
        ];

        // Set up update loop
        const updateLoop = () => {
            if ( !this._isConnected ) {
                return;
            }
            this._onUpdate();

            requestAnimationFrame( updateLoop );
        };
        requestAnimationFrame( updateLoop );

        window.addEventListener( "resize", this._onResize );
        // When you close an externalized panel, "resize" event will be emitted
        // before ".extern" is removed from the ingameUi element so we need this
        // listener to approproately update our widget dimension.
        elFrame.addEventListener( "ToggleExternPanel", this._onResize );
    } );

    disconnectedCallback() {
        super.disconnectedCallback();

        this._el.frame.removeEventListener( "ToggleExternPanel", this._onResize );
        window.removeEventListener( "resize", this._onResize );

        this._isConnected = false;
    }

    _queueResize = () => {
        // requestAnimationFrame( () => this._onResize() );
        setTimeout( () => this._onResize(), 0.1 );
    }

    _onResize = safeCall( ( e?: Event ) => {
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
    } );

    _onUpdate = safeCall( () => {
        if ( !SimVar.IsReady() ) {
            return;
        }

        // Update all SimVar observers
        this._inputHandlers.forEach( handler => handler.update() );
    } );
}

window.customElements.define( "ingamepanel-input-viewer", InputViewerElement );
checkAutoload();
