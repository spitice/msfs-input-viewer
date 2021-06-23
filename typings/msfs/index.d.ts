
export {}

declare global {
    class TemplateElement extends HTMLElement {
        disconnectedCallback(): void;
    }

    class NewListButtonElement {
        currentValue: number;
        choices: string[];
    }

    interface IUIElement {
        connectedCallback(): void;
        disconnectedCallback?(): void;
    }

    function checkAutoload(): void;

    class Coherent {
        static on( eventName: string, callback: ( ...args: any[] ) => any ): void;
        static off( eventName: string, callback: ( ...args: any[] ) => any ): void;
    }

    interface SimVarNameTypeMap {
        "AILERON POSITION": number;
        "ELEVATOR POSITION": number;
        "RUDDER POSITION": number;
        "AILERON TRIM PCT": number;
        "ELEVATOR TRIM PCT": number;
        "RUDDER TRIM PCT": number;
        "BRAKE LEFT POSITION": number;
        "BRAKE RIGHT POSITION": number;
        "GENERAL ENG THROTTLE LEVER POSITION:1": number;
        "GENERAL ENG THROTTLE LEVER POSITION:2": number;
        "GENERAL ENG THROTTLE LEVER POSITION:3": number;
        "GENERAL ENG THROTTLE LEVER POSITION:4": number;
        "GENERAL ENG PROPELLER LEVER POSITION:1": number;
        "GENERAL ENG MIXTURE LEVER POSITION:1": number;

        "NUMBER OF ENGINES": number;

        "ATC MODEL": string;

        "AUTOPILOT AIRSPEED HOLD": boolean;
    }

    interface SimVarUnitTypeMap {
        number: number;
        position: number;
        "percent over 100": number;
        string: string;
    }

    type SimVarName = keyof SimVarNameTypeMap;
    type SimVarUnit = keyof SimVarUnitTypeMap;

    class SimVar {
        static IsReady(): boolean;

        static GetSimVarValue<
            TName extends SimVarName,
            TReturn extends SimVarNameTypeMap[TName] = SimVarNameTypeMap[TName]
        >(
            name: TName, unit: SimVarUnit, dataSource?: string
        ): TReturn;
        static GetSimVarValue<T>(
            name: SimVarName, unit: SimVarUnit, dataSource?: string
        ): T;
    }

    // dataStorage.js
    function GetStoredData( _key: string ): string | null;
    function SetStoredData( _key: string, _data: string ): string | null;
}
