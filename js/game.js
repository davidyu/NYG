
var U = {};
var R = {};
var C = {};

var Officer = {

};

var Criminal = {

};

//some helper functions from racer
var Game = {

    paused : false,
    trains : [],
    activeTrains : [],
    allTrains : [],
    ticks : 0.0, //in seconds start at 00:00:00
    step : 1/60, //60 fps
    timeMultiplier : 10, //10x real time

    init : function( trains ) {

        for ( t in trains ) {
            
            var train = trains[t];
            trains[t].nextStop = 1;
            trains[t].lastStop = 0;
            trains[t].lat = trains[t].s[trains[t].lastStop].lat;
            trains[t].lng = trains[t].s[trains[t].lastStop].lng;

            if ( trains[t].s[trains[t].nextStop].t >= Game.ticks &&
                 trains[t].s[trains[t].lastStop].t <= Game.ticks) {
                trains[t].uuid = t;
                Game.activeTrains.push(trains[t]);
            }

            Game.allTrains.push( trains[t] );
        }
    },

    run : function( Util, Render, Constants, options ) {
        
        U = Util;
        R = Render;
        C = Constants;

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

        if ( !Game.paused ) {

            //update time
            Game.ticks += dt * Game.timeMultiplier;
            Game.ticks = Game.ticks % C.SECONDS_IN_DAY; //rollover

            //update subway locations
            for ( t in Game.activeTrains ) {
                Game.updateTrain( t );
            }

            //update criminal location

            //update criminal logic

            //update player location
        }
    },

    togglePause: function() {
        Game.paused = !Game.paused;
    },

    updateTrain: function( t ) {

        if ( Game.ticks >= Game.activeTrains[t].s[Game.activeTrains[t].nextStop].t  && Game.activeTrains[t].s.length > Game.activeTrains[t].nextStop ) {
            Game.activeTrains[t].nextStop++;
            Game.activeTrains[t].lastStop++;
        }

        //remove unused trains
        if ( Game.activeTrains[t].s[ Game.activeTrains[t].nextStop ].t < Game.ticks ) {
            Game.recycleTrain( Game.activeTrains[t].uuid );
            Game.activeTrains.splice( t, 1 ); //remove me from list of active trains
            return;
        }

        //interpolate train positions

        var p = U.percentRemaining(Game.ticks - Game.activeTrains[t].s[Game.activeTrains[t].lastStop].t,
                                   Game.activeTrains[t].s[Game.activeTrains[t].nextStop].t - Game.activeTrains[t].s[Game.activeTrains[t].lastStop].t);

        //hopefully this is not buggy...
        Game.activeTrains[t].lat = Math.round( U.interpolate( Game.activeTrains[t].s[Game.activeTrains[t].lastStop].lat,
                                                              Game.activeTrains[t].s[Game.activeTrains[t].nextStop].lat,
                                                              p ) );
        Game.activeTrains[t].lng = Math.round( U.interpolate( Game.activeTrains[t].s[Game.activeTrains[t].lastStop].lng,
                                                              Game.activeTrains[t].s[Game.activeTrains[t].nextStop].lng,
                                                              p ) );
        
        //debug
        if ( t == 0 ) {
            //console.log( p + " to stop " + Game.activeTrains[t].nextStop );
            console.log( Game.activeTrains[t].lat + "," + Game.activeTrains[t].lng);
        }
    },

    //use the train later
    recycleTrain : function( t ) {
        for ( st in Game.allTrains[t].s ) {
            Game.allTrains[t].s[st].t += Constants.RECYCLE_INTERVAL;
        }
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