
export type AilElevAxis = "aileron" | "elevator" | "aileronTrim" | "elevatorTrim";
export type RudAxis = "rudder" | "rudderTrim";
export type BrakeAxis = "brakeLeft" | "brakeRight";
export type ThrottleAxis = "throttle1" | "throttle2" | "throttle3" | "throttle4" | "propeller1" | "mixture1";
export type StickInput = "stick" | "stickTrim";

export type SimVarAxisInput = AilElevAxis | RudAxis | BrakeAxis | ThrottleAxis;
export type SliderAxis = BrakeAxis | ThrottleAxis;

export type StickValues = [aileron: number, elevator: number];

export type InputData = {
    [key in SimVarAxisInput]: number;
};

export type Category = "airplane" | "helicopter";

export interface AircraftData {
    /**
     * "Airplane" or "Helicopter"
     */
    category: Category;
    /**
     * "TITLE" may differ based on the livery currently using so we use "ATC
     * MODEL" to distinguish the aircraft types.
     */
    model: string;
    name: string;
    numEngines: number;
}

export type PanelsToShow = "all" | "throttle";
export type NumberDisplayType = "none" | "simple" | "verbose";

export interface Config {
    // General
    autoHideHeader: boolean;
    panels: PanelsToShow;
    numberDisplayType: NumberDisplayType;
    quickHideDuration: number;

    // Aircraft-specific
    enablePropMixBar: boolean;
}

export interface App {
    isStorageReady: boolean;
}

export interface InputViewerState {
    app: App;
    input: InputData;
    aircraft: AircraftData;
    config: Config;
}
