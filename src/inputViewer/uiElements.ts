
//@TODO: Use Redux to avoid this pattern completely.

import {
    AilElevAxis,
    RudAxis,
    SliderAxis,
    StickInput,
} from "./slice/models";

export interface BarElements {
    fg: HTMLElement;
    cap: HTMLElement;
}

type ElementsAilElev = {
    [key in AilElevAxis]: HTMLElement
};
type Elements<T extends string> = Record<T, HTMLElement>;
type Elements_Bar = Record<SliderAxis, BarElements>;

export class UIElements {
    static el: {
        main: Elements<StickInput> & Elements<RudAxis> & Elements_Bar;
        // numberSimple: UIElementsNumberDisp;
        // numberVerbose: UIElementsNumberDisp;

        mainThrottlePanel: HTMLElement;

        confPropMix: ToggleButtonElement;
    };
}
