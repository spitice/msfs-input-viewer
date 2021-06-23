
import { setTranslate } from "../utils";
import { UIElements } from "../uiElements";
import {
    AircraftData,
    BrakeAxis,
    InputData,
    RudAxis,
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

// export function updateInnetText( el: HTMLElement, value: string ) {
//     el.innerText = value;
// }

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
    UIElements.el.mainThrottlePanel.setAttribute( "data-mode", mode );
    console.log( "updateThrottlePanelMode(): mode = " + mode );
}
