
import {
    Action,
    isAnyOf,
} from "@reduxjs/toolkit";
import {
    combineEpics,
    Epic,
} from "redux-observable";
import {
    catchError,
    distinctUntilChanged,
    filter,
    ignoreElements,
    map,
    pluck,
    tap,
    throttleTime,
    withLatestFrom
} from "rxjs/operators";

import { shallowEq } from "../utils";
import {
    AilElevAxis,
    InputViewerState,
    RudAxis,
    SliderAxis,
    StickInput,
    StickValues,
    ThrottleAxis,
} from "./models";
import {
    getAircraftData,
    getInputData,
    getThrottlePanelMode,
    updateHorizontalBar,
    updateRudder,
    updateStick,
    updateThrottlePanelMode,
    updateVerticalBar,
} from "./epics.internal";
import { actions as A } from "./slice";

type E = Epic<Action, Action, InputViewerState>;

const AIRCRAFT_DATA_UPDATE_INTERVAL = 1000;

const fetchSimVarAircraft: E = action$ => action$.pipe(
    filter( A.fetchSimVar.match ),
    throttleTime( AIRCRAFT_DATA_UPDATE_INTERVAL ),
    map( () => A.setAircraft( getAircraftData() ) ),
);
const fetchSimVarInput: E = action$ => action$.pipe(
    filter( A.fetchSimVar.match ),
    map( () => A.setInput( getInputData() ) ),
);

function _makeUpdater<TAxis extends AilElevAxis | RudAxis | SliderAxis>(
    onUpdate: ( key: TAxis, value: number ) => void
) {
    return ( key: TAxis ): E => action$ => action$.pipe(
        filter( A.setInput.match ),
    
        pluck( "payload", key ),
        distinctUntilChanged(),
    
        // Update the main element
        tap( value => onUpdate( key, value ) ),
    
        // TODO:Update the number display
    
        ignoreElements()
    );
}

const makeRudUpdater = _makeUpdater( updateRudder );
const makeHBarUpdater = _makeUpdater( updateHorizontalBar );
const makeVBarUpdater = _makeUpdater( updateVerticalBar );

const makeStickUpdater = (
    key: StickInput,
    inputKeys: [AilElevAxis, AilElevAxis]
): E => action$ => action$.pipe(
    filter( A.setInput.match ),

    map( ( { payload } ): StickValues => ( [
        payload[inputKeys[0]],
        payload[inputKeys[1]],
    ] ) ),
    distinctUntilChanged( shallowEq ),

    // Update the main element
    tap( values => updateStick( key, values ) ),

    ignoreElements()
);

const checkThrottlePanelMode: E = ( action$, state$ ) => action$.pipe(
    filter( isAnyOf(
        A.setAircraft.match,
        A.setEnablePropMixBar.match,
    ) ),

    withLatestFrom( state$ ),
    map( ([ _action, state ]) => getThrottlePanelMode(
        state.config.enablePropMixBar,
        state.aircraft.numEngines
    ) ),
    distinctUntilChanged(),

    // Update the throttle panel
    tap( value => updateThrottlePanelMode( value  ) ),

    ignoreElements()
);

// Updates throttle UI
// const onChangeEngine: E = ( action$, state$ ) => action$.pipe(
//     filter()
// );

const epics: E[] = [
    fetchSimVarAircraft,
    fetchSimVarInput,

    // Input updaters
    makeStickUpdater( "stick", ["aileron", "elevator"] ),
    makeStickUpdater( "stickTrim", ["aileronTrim", "elevatorTrim"] ),
    makeRudUpdater( "rudder" ),
    makeRudUpdater( "rudderTrim" ),
    makeHBarUpdater( "brakeLeft" ),
    makeHBarUpdater( "brakeRight" ),
    makeVBarUpdater( "throttle1" ),
    makeVBarUpdater( "throttle2" ),
    makeVBarUpdater( "throttle3" ),
    makeVBarUpdater( "throttle4" ),
    makeVBarUpdater( "propeller1" ),
    makeVBarUpdater( "mixture1" ),

    // Configuration handlers
    checkThrottlePanelMode,
];

export const epic: E = ( action$, store$, dependencies ) =>
    combineEpics( ...epics )( action$, store$, dependencies ).pipe(
        catchError( ( e, source ) => {
            console.error( e );
            return source;
        } )
    );
