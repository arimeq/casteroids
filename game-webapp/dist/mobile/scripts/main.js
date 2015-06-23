$(function () {

    window.msf.logger.level = 'silly';

    var username = navigator.userAgent.match(/(opera|chrome|safari|firefox|msie)/i)[0] + ' User';
    var ui = {};


    var setService = function(service){

        // Since the mobile web app and tv app are hosted from the same place
        // We will use a little javascript to determine the tv app url
        var tvAppUrl = window.location.href.replace('/mobile','/tv'),
        //var tvAppUrl = 'LCQmKbSjVf.Casteroids',
            color = null;

        console.debug('Starting app at ', tvAppUrl);
        app = service.application(tvAppUrl, 'com.samsung.multiscreen.casteroids');

        app.start(function(err){
            if (err) {
                console.error("Could not start the app:", err);
            } else {
                console.debug('App started, connecting...');
                app.connect({name: username}, function (err) {
                    if(err) {
                        console.error(err);
                    } else {
                        console.debug('App started and connected.');
                    }
                });
            }
        });

        app.on('connect', function(){
            $('body').removeClass().addClass('connected');
            ui.castWindowTitle.text(service.device.name);
        });

        app.on('disconnect', function(){
            $('body').removeClass().addClass('disconnected');
            ui.castWindowTitle.text('Connect to a device');
            app.removeAllListeners();
        });
        
        app.on('slot_update', function(slots){
            var i = 0;
            if (color) {
                return;
            }
            console.log(slots, typeof slots);
            try {
                slots = JSON.parse(slots);
            } catch (e) {
                slots = [];
            }
            for (i; i < slots.length; i++) {
                if (slots[i].available) {
                    color = slots[i].color;
                    app.publish('join_request', JSON.stringify({name:username, color: color}));
                    break;
                }
            }
        });
    };

    var init = function(){

        ui = {
            content             : $('#content'),
            castButton          : $('#castButton'),
            castSettings        : $('#castSettings'),
            castWindowTitle     : $('#castSettings .title'),
            castWindowDeviceList: $('#castSettings .devices'),
            castButtonDisconnect: $('#castSettings button.disconnect'),
            castButtonRescan    : $('#castSettings button.search'),
            controlLeft         : $('#left'),
            controlRight        : $('#right'),
            controlForward      : $('#up'),
            controlFire         : $('#fire')
        };

        function onKeyDown(evt){
            // console.log(event.keyCode);
            switch(evt.keyCode) {
                case 13: // enter
                case 32: // space
                    app.publish('fire', 'on');
                    break;
                case 38: // up
                    app.publish('thrust', 'on');
                    break;
                case 37: // left
                    app.publish('rotate', JSON.stringify({rotate: 'left', strength: 10}));
                    break;
                case 39: // right
                    app.publish('rotate', JSON.stringify({rotate: 'right', strength: 10}));
                default:
                    break
            }
        }
        
        function onKeyUp(evt){
            // console.log(event.keyCode);
            switch(evt.keyCode) {
                case 13: // enter
                case 32: // space
                    app.publish('fire', 'off');
                    break;
                case 38: // up
                    app.publish('thrust', 'off');
                    break;
                case 37: // left
                    app.publish('rotate', JSON.stringify({rotate: 'none'}));
                    break;
                case 39: // right
                    app.publish('rotate', JSON.stringify({rotate: 'none'}));
                default:
                    break
            }
        }
        
        var search = window.msf.search();

        search.on('found', function(services){

            ui.castWindowDeviceList.empty();

            if(services.length > 0){
                $(services).each(function(index, service){
                    $('<li>').text(service.device.name).data('service',service).appendTo(ui.castWindowDeviceList);
                });
                $('body').removeClass().addClass('disconnected');
                ui.castWindowTitle.text('Connect To A Device');
            }else{
                $('<li>').text('No devices found').appendTo(ui.castWindowDeviceList);
            }
        });

        search.start();

        ui.controlLeft.on('mousedown touchstart', function(e){
            e.preventDefault();
            onKeyDown({keyCode:37});
        });

        ui.controlRight.on('mousedown touchstart', function(e){
            e.preventDefault();
            onKeyDown({keyCode:39});
        });

        ui.controlFire.on('mousedown touchstart', function(e){
            e.preventDefault();
            onKeyDown({keyCode:32});
        });

        ui.controlForward.on('mousedown touchstart', function(e){
            e.preventDefault();
            onKeyDown({keyCode:38});
        });

        ui.controlLeft.on('mouseup touchend', function(e){
            e.preventDefault();
            onKeyUp({keyCode:37});
        });

        ui.controlRight.on('mouseup touchend', function(e){
            e.preventDefault();
            onKeyUp({keyCode:39});
        });

        ui.controlFire.on('mouseup touchend', function(e){
            e.preventDefault();
            onKeyUp({keyCode:32});
        });

        ui.controlForward.on('mouseup touchend', function(e){
            e.preventDefault();
            onKeyUp({keyCode:38});
        });

        ui.castButton.on('click', function(){
            ui.castSettings.fadeToggle(200, 'swing');
        });

        ui.castSettings.on('click', function(evt){
            evt.stopPropagation();
            ui.castSettings.fadeOut(200, 'swing');
        });

        ui.castWindowDeviceList.on('click','li', function(evt){
            evt.stopPropagation();
            var service = $(this).data('service');
            if(service){
                setService(service);
                ui.castSettings.hide();
            }
        });

        ui.castButtonDisconnect.on('click', function(){
            if(app) app.disconnect();
            ui.castSettings.fadeToggle(200, 'swing');
        });

        ui.castButtonRescan.on('click', function(evt){
            evt.stopPropagation();
            search.start();
        });

        $(document).on('keydown', onKeyDown);

        $(document).on('keyup', onKeyUp);
    };

    init();

});