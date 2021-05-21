
import {
    MultiSimVarObserver,
    SimVarObserver,
} from "../simVarObserver";

const _G = globalThis as any;
_G.SimVar = {
    GetSimVarValue( name: string, unit: string ) {
        return 0;
    }
};

describe( "simVarObserver", () => {

    let spyGet: jest.SpyInstance;

    beforeEach( () => {
        spyGet = jest.spyOn( _G.SimVar, "GetSimVarValue" );
    } );
    afterEach( () => {
        spyGet.mockRestore();
    } );

    describe( "SimVarObserver", () => {
        it( "should call GetSimVarValue", () => {
            const onChange = jest.fn();
            const obs = new SimVarObserver( "AILERON POSITION", "position", onChange );

            expect( spyGet ).not.toHaveBeenCalled();
            expect( onChange ).not.toHaveBeenCalled();

            spyGet.mockImplementation( () => 42 );
            obs.update();

            expect( spyGet ).toHaveBeenCalledWith( "AILERON POSITION", "position" );
            expect( onChange ).toHaveBeenCalledWith( 42, undefined );
        } );

        it( "should not call onChange if value is not changed", () => {
            const onChange = jest.fn();
            const obs = new SimVarObserver( "ELEVATOR POSITION", "position", onChange );

            spyGet.mockImplementation( () => 42 );
            obs.update();

            expect( spyGet ).toHaveBeenCalledTimes( 1 );
            expect( onChange ).toHaveBeenCalledTimes( 1 );

            obs.update();

            expect( spyGet ).toHaveBeenCalledTimes( 2 );
            expect( onChange ).toHaveBeenCalledTimes( 1 );

            obs.update();

            expect( spyGet ).toHaveBeenCalledTimes( 3 );
            expect( onChange ).toHaveBeenCalledTimes( 1 );

            spyGet.mockImplementation( () => 5 );
            obs.update();

            expect( spyGet ).toHaveBeenCalledTimes( 4 );
            expect( onChange ).toHaveBeenCalledTimes( 2 );
        } );
    } );

    describe( "MultiSimVarObserver", () => {
        it( "should call GetSimVarValue", () => {
            const onChange = jest.fn();
            const obs = new MultiSimVarObserver(
                ["AILERON TRIM PCT", "ELEVATOR TRIM PCT"],
                "position", onChange
            );

            expect( spyGet ).not.toHaveBeenCalled();
            expect( onChange ).not.toHaveBeenCalled();

            spyGet.mockImplementation( () => 42 );
            obs.update();

            expect( spyGet ).toHaveBeenNthCalledWith( 1, "AILERON TRIM PCT", "position" );
            expect( spyGet ).toHaveBeenNthCalledWith( 2, "ELEVATOR TRIM PCT", "position" );
            expect( onChange ).toHaveBeenCalledWith( [42, 42], undefined );
        } );

        it( "should not call onChange if value is not changed", () => {
            const onChange = jest.fn();
            const obs = new MultiSimVarObserver(
                ["AILERON TRIM PCT", "ELEVATOR TRIM PCT"],
                "position", onChange
            );
            spyGet.mockImplementation( () => 42 );
            obs.update();

            expect( spyGet ).toHaveBeenCalledTimes( 2 );
            expect( onChange ).toHaveBeenCalledTimes( 1 );

            obs.update();

            expect( spyGet ).toHaveBeenCalledTimes( 4 );
            expect( onChange ).toHaveBeenCalledTimes( 1 );

            spyGet.mockImplementation( ( name: string, unit: string ) => {
                return name == "AILERON TRIM PCT" ? 5 : 42;
            } );
            obs.update();

            expect( spyGet ).toHaveBeenCalledTimes( 6 );
            expect( onChange ).toHaveBeenCalledTimes( 2 );
        } );
    } );

} );
