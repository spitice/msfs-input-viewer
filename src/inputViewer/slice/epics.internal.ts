
import {
    diffAndForceToggleClassList,
    diffAndSetInnerText,
    setTranslate,
} from "../utils";
import { UIElements } from "../uiElements";
import {
    AircraftData,
    BrakeAxis,
    Category,
    InputData,
    NumberDisplayType,
    PanelsToShow,
    RudAxis,
    SimVarAxisInput,
    StickInput,
    StickValues,
    ThrottleAxis,
} from "./models";

type SimVarWatcherName = keyof InputData | keyof AircraftData;

const g_simVarWatchers: {
    [key in SimVarWatcherName]: number
} = {
    aileron: -1,
    elevator: -1,
    rudder: -1,
    aileronTrim: -1,
    elevatorTrim: -1,
    rudderTrim: -1,
    brakeLeft: -1,
    brakeRight: -1,
    throttle1: -1,
    throttle2: -1,
    throttle3: -1,
    throttle4: -1,
    propeller1: -1,
    mixture1: -1,

    category: -1,
    model: -1,
    name: -1,
    numEngines: -1,
};

function getSimVarRegId( watcherName: SimVarWatcherName, name: SimVarName, unit: SimVarUnit ) {
    let regId = g_simVarWatchers[watcherName];
    if ( regId < 0 ) {
        regId = SimVar.GetRegisteredId( name, unit, "" );
        g_simVarWatchers[watcherName] = regId;
    }
    return regId;
}

function getSimVar( watcherName: SimVarWatcherName, name: SimVarName | string, unit: SimVarUnit ) {
    return SimVar.GetSimVarValueFastReg( getSimVarRegId( watcherName, name as SimVarName, unit ) );
}
function getSimVarString( watcherName: SimVarWatcherName, name: SimVarName, unit: SimVarUnit ) {
    return SimVar.GetSimVarValueFastRegString( getSimVarRegId( watcherName, name, unit ) );
}

function sanitizeCategory( categoryRaw: string ): Category {
    if ( categoryRaw.toLowerCase() === "helicopter" ) {
        return "helicopter";
    }
    return "airplane";
}

export function getInputData( category: Category ) {
    if ( category === "helicopter" ) {
        return getInputDataHelicopter();
    }
    return getInputDataAirplane();
}

function getInputDataAirplane(): InputData {
    return {
        aileron:        getSimVar( "aileron",       "AILERON POSITION",      "position" ),
        elevator:       getSimVar( "elevator",      "ELEVATOR POSITION",     "position" ),
        rudder:         getSimVar( "rudder",        "RUDDER POSITION",       "position" ),
        aileronTrim:    getSimVar( "aileronTrim",   "AILERON TRIM PCT",      "percent over 100" ),
        elevatorTrim:   getSimVar( "elevatorTrim",  "ELEVATOR TRIM PCT",     "percent over 100" ),
        rudderTrim:     getSimVar( "rudderTrim",    "RUDDER TRIM PCT",       "percent over 100" ),

        brakeLeft:      getSimVar( "brakeLeft",     "BRAKE LEFT POSITION",   "position" ),
        brakeRight:     getSimVar( "brakeRight",    "BRAKE RIGHT POSITION",  "position" ),

        throttle1:      getSimVar( "throttle1",     "GENERAL ENG THROTTLE LEVER POSITION:1",     "position" ),
        throttle2:      getSimVar( "throttle2",     "GENERAL ENG THROTTLE LEVER POSITION:2",     "position" ),
        throttle3:      getSimVar( "throttle3",     "GENERAL ENG THROTTLE LEVER POSITION:3",     "position" ),
        throttle4:      getSimVar( "throttle4",     "GENERAL ENG THROTTLE LEVER POSITION:4",     "position" ),
        propeller1:     getSimVar( "propeller1",    "GENERAL ENG PROPELLER LEVER POSITION:1",    "position" ),
        mixture1:       getSimVar( "mixture1",      "GENERAL ENG MIXTURE LEVER POSITION:1",      "position" ),
    };
}

function getInputDataHelicopter(): InputData {
    return {
        aileron:        getSimVar( "aileron",       "YOKE X POSITION LINEAR",       "percent over 100" ),
        elevator:       getSimVar( "elevator",      "YOKE Y POSITION",              "percent over 100" ),
        rudder:         getSimVar( "rudder",        "TAIL ROTOR PEDAL POSITION",    "percent over 100" ),
        aileronTrim:    getSimVar( "aileronTrim",   "ROTOR LATERAL TRIM PCT",       "percent over 100" ),
        elevatorTrim:   getSimVar( "elevatorTrim",  "ROTOR LONGITUDINAL TRIM PCT",  "percent over 100" ),
        rudderTrim:     getSimVar( "rudderTrim",    "RUDDER TRIM PCT",              "percent over 100" ),  // Not used

        brakeLeft:      getSimVar( "brakeLeft",     "ROTOR BRAKE HANDLE POS",   "percent over 100" ),
        brakeRight:     getSimVar( "brakeRight",    "ROTOR BRAKE HANDLE POS",   "percent over 100" ),

        throttle1:      getSimVar( "throttle1",     "COLLECTIVE POSITION",      "percent over 100" ),
        throttle2:      0,
        throttle3:      0,
        throttle4:      0,
        propeller1:     getSimVar( "propeller1",    "GENERAL ENG THROTTLE LEVER POSITION:1",    "position" ),
        mixture1:       getSimVar( "mixture1",      "GENERAL ENG MIXTURE LEVER POSITION:1",     "position" ),
    };
}

export function getAircraftData(): AircraftData {
    return {
        category:   sanitizeCategory( getSimVarString( "category", "CATEGORY", "string" ) ),
        model:      getSimVarString( "model",   "ATC MODEL",    "string" ),
        name:       getSimVarString( "name",    "TITLE",        "string" ),
        numEngines: getSimVar( "numEngines", "NUMBER OF ENGINES", "number" ),
    };
}

const NumDispLabels: Record<
    string,
    Record<SimVarAxisInput, string | null>
> = {
    simple: {
        aileron: "AIL",
        elevator: "ELEV",
        rudder: "RUD",
        aileronTrim: null,
        elevatorTrim: null,
        rudderTrim: null,
        brakeLeft: "BRK",
        brakeRight: null,
        throttle1: "THR",
        throttle2: "#2",
        throttle3: "#3",
        throttle4: "#4",
        propeller1: "PROP",
        mixture1: "MIX",
    },
    simpleHelicopter: {
        aileron: "LAT",
        elevator: "LONG",
        rudder: "RUD",
        aileronTrim: null,
        elevatorTrim: null,
        rudderTrim: null,
        brakeLeft: "BRK",
        brakeRight: null,
        throttle1: "COLL",
        throttle2: null,
        throttle3: null,
        throttle4: null,
        propeller1: "THR",
        mixture1: "MIX",
    },
    verbose: {
        aileron: "Aileron",
        elevator: "Elevator",
        rudder: "Rudder",
        aileronTrim: "Aileron Trim",
        elevatorTrim: "Elevator Trim",
        rudderTrim: "Rudder Trim",
        brakeLeft: "Brake Left",
        brakeRight: "Brake Right",
        throttle1: "Throttle 1",
        throttle2: "Throttle 2",
        throttle3: "Throttle 3",
        throttle4: "Throttle 4",
        propeller1: "Propeller 1",
        mixture1: "Mixture 1",
    },
    verboseHelicopter: {
        aileron: "Lateral",
        elevator: "Longitudinal",
        rudder: "Rudder",
        aileronTrim: "Lateral Trim",
        elevatorTrim: "Long. Trim",
        rudderTrim: "Rudder Trim",
        brakeLeft: "Rotor Brake",
        brakeRight: "-",
        throttle1: "Collective",
        throttle2: "-",
        throttle3: "-",
        throttle4: "-",
        propeller1: "Throttle",
        mixture1: "Mixture",
    },
};

export function updateCategory( category: Category ) {
    diffAndSetAttribute( UIElements.el.root, "data-category", category );

    // Update labels
    const simpleLabels = category === "airplane"
        ? NumDispLabels.simple
        : NumDispLabels.simpleHelicopter;
    const verboseLabels = category === "airplane"
        ? NumDispLabels.verbose
        : NumDispLabels.verboseHelicopter;

    for ( let key_ in simpleLabels ) {
        const key = key_ as SimVarAxisInput;
        if ( simpleLabels[key] !== null ) {
            diffAndSetText( UIElements.el.numberSimpleLabel[key], simpleLabels[key]! );
        }
        diffAndSetText( UIElements.el.numberVerboseLabel[key], verboseLabels[key]! );
    }
}

export function updateStick( key: StickInput, [x, y]: StickValues ) {
    setTranslate( UIElements.el.main[key], x * 100, y * 100 );
};

export function updateRudder( key: RudAxis, value: number ) {
    setTranslate( UIElements.el.main[key], value * 100, 0 );
};

export function updateHorizontalBar( key: BrakeAxis, value: number ) {
    const el = UIElements.el.main[key];
    value = value * 100;
    diffAndSetAttribute( el.fg, "width", value.toString() );
    setTranslate( el.cap, value, 0 );
};

export function updateVerticalBar( key: ThrottleAxis, value: number ) {
    const el = UIElements.el.main[key];
    value = value * 100;
    diffAndSetAttribute( el.fg, "height", value.toString() );
    setTranslate( el.cap, 0, value );
};

export function updateNumberDisplayVerbose( key: SimVarAxisInput, value: number ) {
    diffAndSetInnerText( UIElements.el.numberVerbose[key], value.toString() );
}

const trimAxis: SimVarAxisInput[] = [
    "aileronTrim",
    "elevatorTrim",
    "rudderTrim",
];

export function simplifyNumber( key: SimVarAxisInput, value: number ) {
    value = value * 100;
    let fracDigits = 0;
    if ( trimAxis.indexOf( key ) >= 0 ) {
        if ( Math.abs( value ) < 0.95 && value !== 0 ) {
            fracDigits = 1;
        }
    }
    return value.toFixed( fracDigits );
}

export function updateNumberDisplaySimple( key: SimVarAxisInput, value: number ) {
    diffAndSetText( UIElements.el.numberSimple[key],  simplifyNumber( key, value ) );
}

export function updateNumberDisplaySimpleSign( key: SimVarAxisInput, sign: number ) {
    diffAndForceToggleClassList( UIElements.el.numberSimple[key], "zero", sign === 0 || sign === -0 );
}

export function getThrottlePanelMode( enablePropMixBar: boolean, numEngines: number ) {
    if ( enablePropMixBar ) {
        return "PropMix";   
    } else if ( numEngines <= 1 ) {
        return "SingleEngine";
    } else if ( numEngines == 2 ) {
        return "TwinEngine";
    } else if ( numEngines == 3 ) {
        return "ThreeEngine";
    } else {
        return "FourEngine";
    }
}

export function updateThrottlePanelMode( mode: ReturnType<typeof getThrottlePanelMode> ) {
    diffAndSetAttribute( UIElements.el.root, "data-throttle-panel-mode", mode );
    console.log( "[updateThrottlePanelMode] mode: " + mode );
}

function setToggleValue( el: ToggleButtonElement, value: boolean ) {
    if ( el.getValue() !== value ) {
        el.setValue( value );
    }
}

function setListCurrentValue( el: NewListButtonElement, value: number ) {
    if ( value !== el.getCurrentValue() ) {
        if ( !el.valueElem ) {
            el.defaultValue = value;
        } else {
            el.setCurrentValue( value );
        }
    }
}
function setListCurrentChoice( el: NewListButtonElement, choice: string ) {
    const value = el.choices.indexOf( choice );
    if ( value < 0 ) {
        throw new Error( "[setListCurrentChoice] Invalid choice: " + choice );
    }
    return setListCurrentValue( el, value );
}

export function updateAutoHideHeader( value: boolean ) {
    diffAndSetAttribute( UIElements.el.root, "data-auto-hide-header", value.toString() );
    setToggleValue( UIElements.el.confAutoHideHeader, value );
}

export function updatePanelsToShow( type: PanelsToShow ) {
    diffAndSetAttribute( UIElements.el.root, "data-panels", type );
    setListCurrentChoice( UIElements.el.confPanels, type );
}

export function updateNumberDisplayType( type: NumberDisplayType ) {
    diffAndSetAttribute( UIElements.el.root, "data-number-display-type", type );
    setListCurrentChoice( UIElements.el.confNumericDisp, type );
}

export function updateQuickHideDuration( duration: number ) {
    setListCurrentValue( UIElements.el.confQuickHideDuration, duration );
}

export function updateEnablePropMixBar( value: boolean ) {
    setToggleValue( UIElements.el.confPropMix, value );
}

export function updateAircraftName( name: string ) {
    diffAndSetInnerText( UIElements.el.confAircraftModel, Utils.Translate( name )! );
}

export function quickHidePanel( duration: number ) {
    const isExtern = document.body.classList.contains( "extern" );
    if ( isExtern ) {
        return;
    }

    const { uiFrame } = UIElements.el;
    uiFrame.visible = false;
    setTimeout( () => {
        uiFrame.visible = true;
    }, duration * 1000 );
}

export function updateWidgetScale(
    autoHideHeader: boolean,
    panelsToShow: PanelsToShow,
    numberDispType: NumberDisplayType
) {
    const _style = window.document.documentElement.style;
        
    const vpWidth = Number( _style.getPropertyValue( "--viewportWidth" ) ); // window.top.innerWidth;
    const vpHeight = Number( _style.getPropertyValue( "--viewportHeight" ) ); // window.top.innerHeight;
    const screenHeight = Number( _style.getPropertyValue( "--screenHeight" ) );

    const scaled = ( v: number ) => screenHeight * v / 2160;
    const margin = scaled( 6 );

    const headerHeight = scaled( 84 );
    const isExtern = document.body.classList.contains( "extern" );
    const hasHeader = !isExtern && !autoHideHeader;

    const wrapperWidth = vpWidth - margin * 2;
    const wrapperHeight = vpHeight - margin * 2 - ( hasHeader ? ( headerHeight + margin ) : 0 );
    
    let widgetPrescaledWidth = 280;
    let widgetPrescaledHeight = 260;

    if ( panelsToShow === "throttle" ) {
        widgetPrescaledWidth = 60;
        if ( numberDispType === "simple" ) {
            widgetPrescaledWidth += 60;
        }
    }

    const widgetAspectRatio = widgetPrescaledWidth / widgetPrescaledHeight;
    const widgetWidth = Math.min(
        wrapperWidth,
        wrapperHeight * widgetAspectRatio
    );
    const widgetScale = widgetWidth / widgetPrescaledWidth;

    UIElements.el.uiFrame.style.setProperty( "--widgetScale", widgetScale + "px" );
    // console.log( "widged scale = " + widgetScale );
}


export namespace config {
    export const AUTO_HIDE_HEADER       = "AUTO_HIDE_HEADER";
    export const PANELS                 = "PANELS";
    export const NUMBER_DISPLAY_MODE    = "NUMBER_DISPLAY_MODE";
    export const QUICK_HIDE_DURATION    = "QUICK_HIDE_DURATION";
    export const ENABLE_PROPMIX_BAR     = "ENABLE_PROPMIX_BAR";

    const propMixAircrafts = [
        "TT:ATCCOM.AC_MODEL B350.0.text",   // Beechcraft King Air 350i
        "TT:ATCCOM.AC_MODEL_BE36.0.text",   // Bonanza G36
        "TT:ATCCOM.AC_MODEL C152.0.text",   // Cessna 152
        "TT:ATCCOM.AC_MODEL C172.0.text",   // Cessna Skyhawk G1000
        "TT:ATCCOM.AC_MODEL C208.0.text",   // Cessna 208B Grand Caravan EX
        "TT:ATCCOM.AC_MODEL_CC19.0.text",   // XCub
        "TT:ATCCOM.AC_MODEL CP10.0.text",   // Murdy Cap 10C
        "TT:ATCCOM.AC_MODEL_DR40.0.text",   // DR 400
        "TT:ATCCOM.AC_MODEL E300.0.text",   // Extra 330
        "TT:ATCCOM.AC_MODEL PTS2.0.text",   // Pitts
    ];

    const propMixAircraftMap: { [modelName: string]: boolean } = {};
    propMixAircrafts.forEach( modelName => propMixAircraftMap[modelName] = true );
    
    const PANEL_NAME = "SPITICE_INPUTVIEWER";  // Used for generating storage keys
    function configKey( name: string ) {
        return PANEL_NAME + "." + name;
    }

    export function dumpStoredData() {
        const storedData = SearchStoredData( PANEL_NAME );
        console.log( `${storedData!.length} item(s) are found in Storage.` );
    }

    let _isLoading = false;

    /**
     * During loading, `setData` and `deletaData` will ignore all their inputs.
     * @param isLoading 
     */
    export function setLoadingConfig( isLoading: boolean ) {
        _isLoading = isLoading;
    }
    
    export function getData<T>( name: string, defaultValue: T ): T {
        const key = configKey( name );
        const value = GetStoredData( key )!;
        console.log( `[GetStoredData] ${key} = ${value}` );
        return ( value as any as T ) || defaultValue;
    }
    
    export function setData( name: string, value: string ) {
        if ( _isLoading ) {
            return;
        }

        const key = configKey( name );
        SetStoredData( key, value );
        console.log( `[SetStoredData] ${key} = ${value}` );
    }

    function deleteData( name: string ) {
        if ( _isLoading ) {
            return;
        }
        
        const key = configKey( name );
        DeleteStoredData( key );
        console.log( `[DeleteStoredData] ${key}` );
    }

    export function getQuickHideDuration() {
        const DEFAULT_VALUE = 2;
        const data = getData( QUICK_HIDE_DURATION, DEFAULT_VALUE.toString() );
        const value = parseInt( data );
        if ( isNaN( value ) ) {
            return DEFAULT_VALUE;
        }
        return Math.max( 0, Math.min( 3, value ) );
    }

    export function getEnablePropMixBar( modelName: string, category: Category ) {
        const name = ENABLE_PROPMIX_BAR + ":" + modelName;
        let value = getData( name, "" );
        if ( value === "" ) {
            console.log( "[getEnablePropMixBar] Using the default value..." );
            if ( category === "helicopter" ) {
                return true;  // Enable PropMix bar for helicopters by default
            }
            return !!propMixAircraftMap[modelName];  // Cast undefined to false
        }
        return value === "1";
    }

    export function setEnablePropMixBar( modelName: string, isEnable: boolean ) {
        const name = ENABLE_PROPMIX_BAR + ":" + modelName;
        const isEnableByDefault = modelName in propMixAircraftMap;
        if ( isEnable === isEnableByDefault ) {
            // Remove the current setting
            deleteData( name );
            return;
        }
        // Store the value
        setData( name, isEnable ? "1" : "0" );
    }
}
