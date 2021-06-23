
import {
    Action,
    isAnyOf,
} from "@reduxjs/toolkit";
import {
    combineEpics,
    Epic,
} from "redux-observable";
import { of } from "rxjs";
import {
    catchError,
    distinctUntilChanged,
    filter,
    ignoreElements,
    map,
    mergeMap,
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
    config,
    getAircraftData,
    getInputData,
    getThrottlePanelMode,
    updateEnablePropMixBar,
    updateHorizontalBar,
    updateRudder,
    updateStick,
    updateThrottlePanelMode,
    updateVerticalBar,
} from "./epics.internal";
import { actions as A } from "./slice";

type E = Epic<Action, Action, InputViewerState>;

const AIRCRAFT_DATA_UPDATE_INTERVAL = 1000;

const loadConfigGeneral: E = action$ => action$.pipe(
    filter( A.setStorageReady.match ),
    filter( ({ payload: isReady }) => isReady ),
    mergeMap( () => of(
        A.setLoadingConfig( true ),
        A.setNumberDisplayType( ( config.getData( config.NUMBER_DISPLAY_MODE ) as any ) || "none" ),
        A.setLoadingConfig( false ),
    ) ),
);
const loadConfigAircraft: E = ( action$, state$ ) => action$.pipe(
    filter( isAnyOf(
        A.setStorageReady,
        A.setAircraft,
    ) ),

    withLatestFrom( state$ ),
    map( ([ _action, state ]) => ([
        state.app.isStorageReady,
        state.aircraft.model
    ] as [boolean, string]) ),
    distinctUntilChanged( shallowEq ),

    filter( tuple => tuple[0] ),  // isStorageReady == true

    mergeMap( ([ _, model ]) => of(
        A.setLoadingConfig( true ),
        A.setEnablePropMixBar( config.getEnablePropMixBar( model ) ),
        A.setLoadingConfig( false ),
    ) ),
);


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
        A.setAircraft,
        A.setEnablePropMixBar,
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

const checkConfigEnablePropMixBar: E = action$ => action$.pipe(
    filter( A.setEnablePropMixBar.match ),
    tap( ({ payload }) => {
        updateEnablePropMixBar( payload );
    } ),
    ignoreElements(),
);

// Updates throttle UI
// const onChangeEngine: E = ( action$, state$ ) => action$.pipe(
//     filter()
// );

const logActions: E = action$ => action$.pipe(
    filter( isAnyOf(
        A.setEnablePropMixBar,
        A.setLoadingConfig,
        A.setNumberDisplayType,
        A.setStorageReady,
    ) ),
    tap( action => console.log( action ) ),
    ignoreElements()
);

const epics: E[] = [
    // Debug
    logActions,

    // Load
    loadConfigGeneral,
    loadConfigAircraft,

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
    checkConfigEnablePropMixBar,
];

export const epic: E = ( action$, store$, dependencies ) =>
    combineEpics( ...epics )( action$, store$, dependencies ).pipe(
        catchError( ( e, source ) => {
            console.error( e );
            return source;
        } )
    );
