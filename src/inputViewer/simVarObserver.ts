
/// <reference path="../types/msfs.d.ts" />

import {
    shallowEq,
    zip
} from "./utils";


export interface ISimVarObserver {
    update(): void;
}


export class SimVarObserver<T> implements ISimVarObserver {
    value?: T;
    
    constructor(
        public readonly name: SimVarName,
        public readonly unit: SimVarUnit,
        public onChange: ( newValue: T, oldValue?: T ) => void
    ) {
    }

    update() {
        const oldValue = this.value;
        const newValue = SimVar.GetSimVarValue<T>( this.name, this.unit );
        if ( newValue == oldValue ) {
            // Not changed
            return;
        }
        this.value = newValue;
        this.onChange( newValue, oldValue );
    }
}

export class MultiSimVarObserver<T> implements ISimVarObserver {
    values?: T[];

    constructor(
        public readonly names: SimVarName[],
        public readonly units: SimVarUnit | SimVarUnit[],
        public onChange: ( newValues: T[], oldValues?: T[] ) => void
    ) {
    }

    update() {
        const {
            units,
            values: oldValues,
        } = this;

        let newValues: T[];
        if ( !Array.isArray( units ) ) {
            newValues = this.names.map(
                name => SimVar.GetSimVarValue<T>( name, units )
            );
        } else {
            newValues = zip( this.names, units ).map(
                ( [name, unit] ) => SimVar.GetSimVarValue<T>( name, unit )
            );
        }

        if ( oldValues && shallowEq( newValues, oldValues ) ) {
            // Nothing has been changed
            return;
        }

        this.values = newValues;
        this.onChange( newValues, oldValues );
    }
}
