
export type AilElevAxis = "aileron" | "elevator" | "aileronTrim" | "elevatorTrim";
export type RudAxis = "rudder" | "rudderTrim";
export type BrakeAxis = "brakeLeft" | "brakeRight";
export type ThrottleAxis = "throttle1" | "throttle2" | "throttle3" | "throttle4" | "propeller1" | "mixture1";
export type StickInput = "stick" | "stickTrim";

export type SimVarInput = AilElevAxis | RudAxis | BrakeAxis | ThrottleAxis;
export type SliderAxis = BrakeAxis | ThrottleAxis;

export type StickValues = [aileron: number, elevator: number];

export type InputData = {
    [key in SimVarInput]: number;
};

export interface AircraftData {
    model: string;
    numEngines: number;
}

export type NumberDisplayType = "none" | "simple" | "verbose";

export interface Config {
    enableAutoHideFrame: boolean;
    numberDisplayType: NumberDisplayType;
    enablePropMixBar: boolean;
}

export interface App {
    isStorageReady: boolean;
    isLoadingConfig: boolean;
}

export interface InputViewerState {
    app: App;
    input: InputData;
    aircraft: AircraftData;
    config: Config;
}
