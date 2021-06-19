
export function makePropMixToggleButton( el: HTMLElement ) {
    el.classList.add( "togglePropMix" );
    el.addEventListener( "created", e => {
        const elToggleWrap = el.querySelector( ".toggleButtonWrapper .toggleButton" )!;
            const elState = elToggleWrap.querySelector( ".state" )!;

            const createIcon = ( id: string, svg: string ) => {
                const elIcon = document.createElement( "icon-element" );
                elIcon.setAttribute( "id", id );
                elIcon.setAttribute( "data-url", "/InGamePanels/InputViewer/images/" + svg );
                elToggleWrap.insertBefore( elIcon, elState );
            };

            createIcon( "MixtureIcon", "mixture.svg" );
            createIcon( "PropellerIcon", "propeller.svg" );
    } );
}
