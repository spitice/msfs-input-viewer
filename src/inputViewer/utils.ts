
export function safeCall<T extends any[], R>( fn: ( ...args: T ) => R ) {
    return ( ...args: T ) => {
        try {
            return fn( ...args );
        } catch ( e ) {
            const elError = document.querySelector( "#DevOverlay .error" ) as HTMLElement;
            elError.innerText = "" + e;
        }
    }
}

export function debugMsg( ...args: any[] ) {
    const elDebugMsg = document.querySelector( "#DevOverlay .info" ) as HTMLElement;
    elDebugMsg.innerText = "" + args.join( " " );
}

export function appendDebugMsg( ...args: any[] ) {
    const elDebugMsg = document.querySelector( "#DevOverlay .info" ) as HTMLElement;
    elDebugMsg.innerText += "" + args.join( " " ) + "\n";
}

export function setTranslate( el: Element, x: number, y: number ) {
    el.setAttribute( "transform", `translate(${x}, ${y})` );
}

export function zip<T, U>( a: T[], b: U[] ): [T, U][] {
    if ( a.length != b. length ) {
        throw new Error( "zip: Mismatched number of items" );
    }
    return a.map( ( aa, idx ) => [aa, b[idx]] );
}

export function shallowEq<T>( a: T[], b: T[] ) {
    if ( a.length != b.length ) {
        return false;
    }
    for ( let i = 0; i < a.length; i++ ) {
        if ( a[i] != b[i] ) {
            return false;
        }
    }
    return true;
}
