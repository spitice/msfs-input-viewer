
// TODO: Use Redux to avoid this pattern completely.

import {
    RudAxis,
    SimVarAxisInput,
    SliderAxis,
    StickInput,
} from "./slice/models";

export interface BarElements {
    fg: HTMLElement;
    cap: HTMLElement;
}

type Elements<T extends string> = Record<T, HTMLElement>;
type Elements_Bar = Record<SliderAxis, BarElements>;
export type NumberDisplayElements = Elements<SimVarAxisInput>;

export class UIElements {
    static el: {
        main: Elements<StickInput> & Elements<RudAxis> & Elements_Bar;
        numberSimple: NumberDisplayElements;
        numberVerbose: NumberDisplayElements;

        mainThrottlePanel: HTMLElement;
        numberSimpleContainer: HTMLElement;
        numberVerboseContainer: HTMLElement;
        confNumericDisp: NewListButtonElement;
        confPropMix: ToggleButtonElement;
        confAircraftModel: HTMLElement;
    };
}
