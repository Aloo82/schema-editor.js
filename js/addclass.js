/**
 * Created by fhague on 30/06/15.
 */
requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: 'js/lib',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        app: '../app'
    },

    shim: {
        'jquery-ui:': {
            deps: ['jquery']
        }
    }
});





// Start the main app logic.
requirejs(['jquery'], function($) {
    $('dt.editable').eq(0).append("<hr>");
//jQuery('dt.editable').eq(0).after('<hr>');

    console.log('This is a tst');
});




requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: 'js/lib',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        app: '../app'
    }
});

// Start the main app logic.
requirejs(['jquery', 'canvas', 'app/sub'],
    function   ($,        canvas,   sub) {
        //jQuery, canvas and the app/sub module are all
        //loaded and can be used here now.
    })
