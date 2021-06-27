
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
    SimVarAxisInput,
    StickInput,
    StickValues,
} from "./models";
import {
    config,
    getAircraftData,
    getInputData,
    getThrottlePanelMode,
    updateAircraftName,
    updateEnablePropMixBar,
    updateHorizontalBar,
    updateNumberDisplaySimple,
    updateNumberDisplaySimpleSign,
    updateNumberDisplayType,
    updateNumberDisplayVerbose,
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
    tap( () => {
        config.dumpStoredData();
    } ),
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

const saveNumberDisplayType: E = action$ => action$.pipe(
    filter( A.setNumberDisplayType.match ),
    tap( ({ payload }) => {
        config.setData( config.NUMBER_DISPLAY_MODE, payload );
    } ),
    ignoreElements()
);
const saveEnablePropMixBar: E = ( action$, state$ ) => action$.pipe(
    filter( A.setEnablePropMixBar.match ),
    withLatestFrom( state$ ),
    tap( ([ { payload }, state ]) => {
        config.setEnablePropMixBar( state.aircraft.model, payload );
    } ),
    ignoreElements()
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


const forceUpdateAllInput: E = ( action$, state$ ) => action$.pipe(
    filter( A.forceUpdateAllInputs.match ),
    withLatestFrom( state$ ),
    tap( ([ _, state ]) => {
        const { input: d } = state;
        
        updateStick( "stick", [d.aileron, d.elevator] );
        updateStick( "stickTrim", [d.aileronTrim, d.elevatorTrim] );
        updateRudder( "rudder", d.rudder );
        updateRudder( "rudderTrim", d.rudderTrim );
        updateHorizontalBar( "brakeLeft", d.brakeLeft );
        updateHorizontalBar( "brakeRight", d.brakeRight );
        updateVerticalBar( "throttle1", d.throttle1 );
        updateVerticalBar( "throttle2", d.throttle2 );
        updateVerticalBar( "throttle3", d.throttle3 );
        updateVerticalBar( "throttle4", d.throttle4 );
        updateVerticalBar( "propeller1", d.propeller1 );
        updateVerticalBar( "mixture1", d.mixture1 );

        const updateNumberDisplay = ( key: SimVarAxisInput ) => {
            const value = d[key];
            updateNumberDisplayVerbose( key, value );
            updateNumberDisplaySimple( key, value );
            updateNumberDisplaySimpleSign( key, Math.sign( value ) );
        };
        updateNumberDisplay( "aileron" );
        updateNumberDisplay( "aileronTrim" );
        updateNumberDisplay( "elevator" );
        updateNumberDisplay( "elevatorTrim" );
        updateNumberDisplay( "rudder" );
        updateNumberDisplay( "rudderTrim" );
        updateNumberDisplay( "brakeLeft" );
        updateNumberDisplay( "brakeRight" );
        updateNumberDisplay( "throttle1" );
        updateNumberDisplay( "throttle2" );
        updateNumberDisplay( "throttle3" );
        updateNumberDisplay( "throttle4" );
        updateNumberDisplay( "propeller1" );
        updateNumberDisplay( "mixture1" );
    } ),
    ignoreElements(),
);

function _makeUpdater<TAxis extends SimVarAxisInput>(
    onUpdate: ( key: TAxis, value: number ) => void
) {
    return ( key: TAxis ): E => ( action$, state$ ) => action$.pipe(
        filter( A.setInput.match ),
    
        pluck( "payload", key ),
        distinctUntilChanged(),
    
        // Update the main element
        tap( value => onUpdate( key, value ) )

    ).pipe(
        // Update the number display
        withLatestFrom( state$ ),
        map( ([ value, state ]) => ({
            value,
            numberDisplayType: state.config.numberDisplayType,
        }) ),
        tap( ({ value, numberDisplayType }) => {
            if ( numberDisplayType === "verbose" ) {
                updateNumberDisplayVerbose( key, value );
            } else if ( numberDisplayType === "simple" ) {
                updateNumberDisplaySimple( key, value );
            }
        } )

    ).pipe(
        // Update the number display sign
        filter( ({ numberDisplayType }) => numberDisplayType === "simple" ),
        map( ({ value }) => Math.sign( value ) ),
        distinctUntilChanged(),
        tap( sign => {
            updateNumberDisplaySimpleSign( key, sign );
        } ),

    ).pipe( ignoreElements() );
}

const makeAilElevUpdater = _makeUpdater( () => {} );
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
    tap( value => updateThrottlePanelMode( value ) ),

    ignoreElements()
);

const checkNumberDisplayType: E = action$ => action$.pipe(
    filter( A.setNumberDisplayType.match ),
    tap( ({ payload }) => {
        updateNumberDisplayType( payload );
    } ),
    map( () => A.forceUpdateAllInputs() ),
);

const checkConfigEnablePropMixBar: E = action$ => action$.pipe(
    filter( A.setEnablePropMixBar.match ),
    tap( ({ payload }) => {
        updateEnablePropMixBar( payload );
    } ),
    ignoreElements(),
);

const checkAircraftName: E = action$ => action$.pipe(
    filter( A.setAircraft.match ),
    map( ({ payload }) => payload.name ),
    distinctUntilChanged(),
    tap( name => {
        updateAircraftName( name );
    } ),
    ignoreElements(),
)

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

    // Load & Save
    loadConfigGeneral,
    loadConfigAircraft,
    saveNumberDisplayType,
    saveEnablePropMixBar,

    // SimVar
    fetchSimVarAircraft,
    fetchSimVarInput,

    // Input updaters
    forceUpdateAllInput,
    makeStickUpdater( "stick", ["aileron", "elevator"] ),
    makeStickUpdater( "stickTrim", ["aileronTrim", "elevatorTrim"] ),
    makeAilElevUpdater( "aileron" ),
    makeAilElevUpdater( "aileronTrim" ),
    makeAilElevUpdater( "elevator" ),
    makeAilElevUpdater( "elevatorTrim" ),
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
    checkNumberDisplayType,
    checkConfigEnablePropMixBar,
    checkAircraftName,
];

export const epic: E = ( action$, store$, dependencies ) =>
    combineEpics( ...epics )( action$, store$, dependencies ).pipe(
        catchError( ( e, source ) => {
            console.error( e );
            return source;
        } )
    );
