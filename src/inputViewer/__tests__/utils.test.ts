
import {
    shallowEq,
    zip,
} from "../utils";

describe( "utils", () => {
    describe( "shallowEq", () => {
        it( "should compare two arrays", () => {
            expect( shallowEq( [], [] ) ).toBeTruthy();
            expect( shallowEq( [0], [0] ) ).toBeTruthy();
            expect( shallowEq( [1, 2], [1, 2] ) ).toBeTruthy();
            expect( shallowEq( ["foo", "bar"], ["foo", "bar"] ) ).toBeTruthy();

            expect( shallowEq( [0], [] ) ).toBeFalsy();
            expect( shallowEq( [0], [0, 1] ) ).toBeFalsy();
            expect( shallowEq( [0, 1], [0] ) ).toBeFalsy();
            expect( shallowEq( [0], [1] ) ).toBeFalsy();
            expect( shallowEq( [0, 1], [0, 2] ) ).toBeFalsy();
            expect( shallowEq( ["foo"], ["bar"] ) ).toBeFalsy();
        } );
    } );

    describe( "zip", () => {
        it( "should zip two arrays", () => {
            expect( zip( [], [] ) ).toEqual( [] );
            expect( zip( [1], [2] ) ).toEqual( [[1, 2]] );
            expect( zip( [1, 2, 3], ["foo", "bar", "baz"] ) ).toEqual( [[1, "foo"], [2, "bar"], [3, "baz"]] );
        } );

        it( "should throw when number of items are different", () => {
            expect( () => zip( [], [] ) ).not.toThrow();

            expect( () => zip( [], [0] ) ).toThrow();
            expect( () => zip( [1, 2], [0] ) ).toThrow();
        } );
    } );
} );
