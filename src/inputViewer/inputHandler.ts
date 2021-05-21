
import {
    ISimVarObserver,
    MultiSimVarObserver,
    SimVarObserver,
} from "./simVarObserver";
import { setTranslate } from "./utils";


export class InputHandler<T> {
    private _observer: ISimVarObserver;

    constructor( names: SimVarName | SimVarName[], unit: SimVarUnit ) {
        if ( !Array.isArray( names ) ) {
            this._observer = new SimVarObserver<T>(
                names, unit,
                ( newValue, oldValue ) => this.onChange( newValue, oldValue )
            );
        } else {
            this._observer = new MultiSimVarObserver<T>(
                names, unit,
                ( newValues, oldValues ) => this.onChangeMulti( newValues, oldValues )
            );
        }
    }

    update() {
        this._observer.update();
    }

    protected onChange( newValue: T, oldValue?: T ) {
        throw new Error( "Not implemented" );
    }
    protected onChangeMulti( newValues: T[], oldValues?: T[] ) {
        throw new Error( "Not implemented" );
    }
}


export class StickHandler extends InputHandler<number> {
    constructor(
        private readonly _el: Element,
        names: [SimVarName, SimVarName],
        unit: SimVarUnit
    ) {
        super( names, unit );
    }

    protected onChangeMulti( [x, y]: [number, number] ) {
        setTranslate( this._el, x * 100, y * 100 );
    }
}

export class RudderHandler extends InputHandler<number> {
    constructor(
        private readonly _el: Element,
        name: SimVarName,
        unit: SimVarUnit,
    ) {
        super( name, unit );
    }

    protected onChange( x: number ) {
        setTranslate( this._el, x * 100, 0 );
    }
}

class BarHandler extends InputHandler<number> {
    elForeground: Element;
    elCap: Element;

    constructor( elBar: Element, name: SimVarName ) {
        super( name, "position" );

        this.elForeground = elBar.querySelector( ".fg" )!;
        this.elCap = elBar.querySelector( ".cap" )!;

        if ( !this.elForeground ) {
            throw new Error( "The bar foreground element is not found for " + name );
        }
        if ( !this.elCap ) {
            throw new Error( "The bar cap element is not found for " + name );
        }
    }
}

export class HBarHandler extends BarHandler {
    protected onChange( x: number ) {
        x = x * 100;
        this.elForeground.setAttribute( "width", "" + x );
        setTranslate( this.elCap, x, 0 );
    }
}

export class VBarHandler extends BarHandler {
    protected onChange( y: number ) {
        y = y * 100;
        this.elForeground.setAttribute( "height", "" + y );
        setTranslate( this.elCap, 0, y );
    }
}

export class EngineHandler extends InputHandler<number> {
    private _isPropMixEnabled: boolean = false;
    private _numEngines: number = 1;

    constructor( private readonly _elThrottlePanel: Element ) {
        super( "NUMBER OF ENGINES", "number" );
        this._validate();
    }

    protected onChange( numEngines: number ) {
        this._numEngines = numEngines;
        this._validate();
    }

    set isPropMixEnabled( v: boolean ) {
        this._isPropMixEnabled = v;
        this._validate();
    }

    private _validate() {
        let mode = "PropMix";
        if ( !this._isPropMixEnabled ) {
            if ( this._numEngines <= 1 ) {
                mode = "SingleEngine";
            } else if ( this._numEngines == 2 ) {
                mode = "TwinEngine";
            } else if ( this._numEngines == 3 ) {
                mode = "ThreeEngine";
            } else {
                mode = "FourEngine";
            }
        }

        this._elThrottlePanel.setAttribute( "data-mode", mode );
        console.log( "mode: " + mode );
    }
}
