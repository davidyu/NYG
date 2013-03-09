
var U = {};
var R = {};

var Officer = {

};

var Criminal = {

};

//some helper functions from racer
var Game = {

    paused : false,

    run : function( Util, Render, options ) {
        
        U = Util;
        R = Render;

        var map    = options.map,
            update = options.update,
            render = options.render,
            step   = options.step,
            now    = null,
            last   = U.timestamp(),
            dt     = 0,
            gdt    = 0;

        var frame = function() {
                        now = U.timestamp();
                        dt = Math.min( 1, ( now - last ) / 1000 );
                        gdt += dt;
                        while ( gdt > step ) {
                            gdt -= step;
                            update( step );
                        }

                        last = now;

                        //render();

                        requestAnimationFrame( frame, map );
                    }

        frame();
    },

    update: function( dt ) {
        if ( !paused ) {

        }
    },

    togglePause: function() {
        paused = !paused;
    },

    setKeyListener: function( keys ) {
        var onkey = function( keyCode, mode ) {
            var n, k;

            for( n = 0 ; n < keys.length ; n++ ) {
                k = keys[n];
                k.mode = k.mode || 'up';
                if ( ( k.key == keyCode ) || ( k.keys && ( k.keys.indexOf( keyCode ) >= 0 ) ) ) {
                    if ( k.mode == mode ) {
                        k.action.call();
                    }
                }
            }
        };

        Dom.on( document, 'keydown', function( ev ) { onkey( ev.keyCode, 'down' ); } );
        Dom.on( document, 'keyup',   function( ev ) { onkey( ev.keyCode, 'up' );   } );
    }
}