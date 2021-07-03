
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
        root: HTMLElement;
        uiFrame: ingameUiElement;

        main: Elements<StickInput> & Elements<RudAxis> & Elements_Bar;
        numberSimple: NumberDisplayElements;
        numberVerbose: NumberDisplayElements;

        confPanels: NewListButtonElement;
        confNumericDisp: NewListButtonElement;
        confQuickHideDuration: NewListButtonElement;
        confPropMix: ToggleButtonElement;
        confAircraftModel: HTMLElement;
    };
}
