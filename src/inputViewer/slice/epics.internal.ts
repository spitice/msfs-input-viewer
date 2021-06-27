
import { setTranslate } from "../utils";
import { UIElements } from "../uiElements";
import {
    AircraftData,
    BrakeAxis,
    InputData,
    NumberDisplayType,
    RudAxis,
    SimVarAxisInput,
    StickInput,
    StickValues,
    ThrottleAxis,
} from "./models";

export function getInputData(): InputData {
    return {
        aileron:        SimVar.GetSimVarValue( "AILERON POSITION",      "position" ),
        elevator:       SimVar.GetSimVarValue( "ELEVATOR POSITION",     "position" ),
        rudder:         SimVar.GetSimVarValue( "RUDDER POSITION",       "position" ),
        aileronTrim:    SimVar.GetSimVarValue( "AILERON TRIM PCT",      "percent over 100" ),
        elevatorTrim:   SimVar.GetSimVarValue( "ELEVATOR TRIM PCT",     "percent over 100" ),
        rudderTrim:     SimVar.GetSimVarValue( "RUDDER TRIM PCT",       "percent over 100" ),

        brakeLeft:      SimVar.GetSimVarValue( "BRAKE LEFT POSITION",   "position" ),
        brakeRight:     SimVar.GetSimVarValue( "BRAKE RIGHT POSITION",  "position" ),

        throttle1:      SimVar.GetSimVarValue( "GENERAL ENG THROTTLE LEVER POSITION:1",     "position" ),
        throttle2:      SimVar.GetSimVarValue( "GENERAL ENG THROTTLE LEVER POSITION:2",     "position" ),
        throttle3:      SimVar.GetSimVarValue( "GENERAL ENG THROTTLE LEVER POSITION:3",     "position" ),
        throttle4:      SimVar.GetSimVarValue( "GENERAL ENG THROTTLE LEVER POSITION:4",     "position" ),
        propeller1:     SimVar.GetSimVarValue( "GENERAL ENG PROPELLER LEVER POSITION:1",    "position" ),
        mixture1:       SimVar.GetSimVarValue( "GENERAL ENG MIXTURE LEVER POSITION:1",      "position" ),
    };
}

export function getAircraftData(): AircraftData {
    return {
        model:      SimVar.GetSimVarValue( "ATC MODEL", "string" ),
        name:       SimVar.GetSimVarValue( "TITLE", "string" ),
        numEngines: SimVar.GetSimVarValue( "NUMBER OF ENGINES", "number" ),
    };
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
    el.fg.setAttribute( "width", value.toString() );
    setTranslate( el.cap, value, 0 );
};

export function updateVerticalBar( key: ThrottleAxis, value: number ) {
    const el = UIElements.el.main[key];
    value = value * 100;
    el.fg.setAttribute( "height", value.toString() );
    setTranslate( el.cap, 0, value );
};

export function updateNumberDisplayVerbose( key: SimVarAxisInput, value: number ) {
    UIElements.el.numberVerbose[key].innerText = value.toString();
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
    UIElements.el.numberSimple[key].textContent = simplifyNumber( key, value );
}

export function updateNumberDisplaySimpleSign( key: SimVarAxisInput, sign: number ) {
    UIElements.el.numberSimple[key].classList.toggle( "zero", sign === 0 || sign === -0 );
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
    const { el } = UIElements;
    el.mainThrottlePanel.setAttribute( "data-mode", mode );
    el.numberSimpleContainer.setAttribute( "data-mode", mode );
    console.log( "[updateThrottlePanelMode()] mode: " + mode );
}

function updateListCurrentValue( el: NewListButtonElement, value: number ) {
    if ( value !== el.getCurrentValue() ) {
        if ( !el.valueElem ) {
            el.defaultValue = value;
        } else {
            el.setCurrentValue( value );
        }
    }
}

export function updateNumberDisplayType( type: NumberDisplayType ) {
    const { el } = UIElements;

    el.numberSimpleContainer.classList.toggle( "hide", type !== "simple" );
    el.numberVerboseContainer.classList.toggle( "hide", type !== "verbose" );

    const { confNumericDisp } = el;
    const nextValue = confNumericDisp.choices.indexOf( type );
    if ( nextValue < 0 ) {
        throw new Error( "[updateNumberDisplayType] Invalid number display type: " + type );
    }

    updateListCurrentValue( confNumericDisp, nextValue );
}

export function updateQuickHideDuration( duration: number ) {
    updateListCurrentValue( UIElements.el.confQuickHideDuration, duration );
}

export function updateEnablePropMixBar( value: boolean ) {
    const { confPropMix } = UIElements.el;
    if ( confPropMix.getValue() != value ) {
        confPropMix.setValue( value );
    }
}

export function updateAircraftName( name: string ) {
    UIElements.el.confAircraftModel.innerText = Utils.Translate( name )!;
}

export function quickHidePanel( duration: number ) {
    const { frame } = UIElements.el;
    frame.visible = false;
    setTimeout( () => {
        frame.visible = true;
    }, duration * 1000 );
}


export namespace config {
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
    
    export function getData( name: string ) {
        const key = configKey( name );
        const value = GetStoredData( key )!;
        console.log( `[GetStoredData] ${key} = ${value}` );
        return value;
    }
    
    export function setData( name: string, value: string ) {
        const key = configKey( name );
        SetStoredData( key, value );
        console.log( `[SetStoredData] ${key} = ${value}` );
    }

    function deleteData( name: string ) {
        const key = configKey( name );
        DeleteStoredData( key );
        console.log( `[DeleteStoredData] ${key}` );
    }

    export function getQuickHideDuration() {
        const DEFAULT_VALUE = 2;
        const data = getData( QUICK_HIDE_DURATION );
        if ( !data || data == "" ) {
            return DEFAULT_VALUE;  // default value
        }
        const value = parseInt( data );
        if ( isNaN( value ) ) {
            return DEFAULT_VALUE;
        }
        return Math.max( 0, Math.min( 3, value ) );
    }

    export function getEnablePropMixBar( modelName: string ) {
        const name = ENABLE_PROPMIX_BAR + ":" + modelName;
        let value = getData( name );
        if ( value === "" ) {
            console.log( "[getEnablePropMixBar] Using the default value..." );
            return propMixAircraftMap[modelName];
        }
        return value === "1";
    }

    export function setEnablePropMixBar( modelName: string, isEnable: boolean ) {
        const name = ENABLE_PROPMIX_BAR + ":" + modelName;
        if ( isEnable && modelName in propMixAircraftMap ) {
            // Remove the current setting
            deleteData( name );
            return;
        }
        // Store the value
        setData( name, isEnable ? "1" : "0" );
    }
}
