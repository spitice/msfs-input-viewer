
import {
    createSlice,
    PayloadAction as PA
} from "@reduxjs/toolkit";

import {
    AircraftData,
    InputData,
    InputViewerState,
    NumberDisplayType,
} from "./models";

const noop = () => {};

const initialState: InputViewerState = {
    app: {
        isStorageReady: false,
        isLoadingConfig: false,
    },

    input: {
        aileron: 0,
        elevator: 0,
        rudder: 0,
        aileronTrim: 0,
        elevatorTrim: 0,
        rudderTrim: 0,
        brakeLeft: 0,
        brakeRight: 0,
        throttle1: 0,
        throttle2: 0,
        throttle3: 0,
        throttle4: 0,
        propeller1: 0,
        mixture1: 0,
    },

    aircraft: {
        model: "<unknown>",
        numEngines: 1,
    },

    config: {
        enableAutoHideFrame: true,
        numberDisplayType: "none",
        enablePropMixBar: false,
    },
};

const inputViewerSlice = createSlice({
    name: "inputViewer",
    initialState,
    reducers: {
        setStorageReady: ( state, { payload }: PA<boolean> ) => {
            state.app.isStorageReady = payload;
        },
        setLoadingConfig: ( state, { payload }: PA<boolean> ) => {
            state.app.isLoadingConfig = payload;
        },

        setInput: ( state, { payload }: PA<InputData> ) => {
            state.input = payload;
        },
        setAircraft: ( state, { payload }: PA<AircraftData> ) => {
            state.aircraft = payload;
        },

        setNumberDisplayType: ( state, { payload }: PA<NumberDisplayType> ) => {
            state.config.numberDisplayType = payload;
        },
        setEnablePropMixBar: ( state, { payload }: PA<boolean> ) => {
            state.config.enablePropMixBar = payload;
        },

        // Epic triggers
        fetchSimVar: noop,
    },
})

export const {
    actions,
    reducer,
} = inputViewerSlice;
