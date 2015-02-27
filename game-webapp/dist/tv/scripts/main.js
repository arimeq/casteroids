var ConnectivityManager;

/**
 * The ConnectivityManager manages the communication channel between the client(s) and the TV application and acts as a
 * layer of abstraction between the client(s) and the game. In order to listen for the correct events, it has to have
 * some knowledge of the game but does not include any game logic. This approach allows for the form of transport to
 * be changed without the game logic having to be changed.
 */
$(ConnectivityManager = function(){

    "use strict";

    var channel;

    window.msf.local(function(err, service){
        channel = service.channel('com.samsung.multiscreen.castroids');

        channel.connect({name: 'TV'}, function (err) {
            if(err) return console.error(err);
        });

        channel.on('connect', function(client){
            console.log('connect');

            // Send the slot update to the new client so it knows what slots are available.
            sendSlotUpdate('all');
        });

        channel.on('disconnect', function(client){
            console.log('disconnect');
            GameManager.removePlayer(client.id);
            sendSlotUpdate('all');
        });

        channel.on('clientConnect', function(client){
            console.log('clientConnect');

            // Send the slot update to the new client sp it knows what slots are available.
            sendSlotUpdate('all');
        });

        channel.on('clientDisconnect', function(client){
            console.log('clientDisconnect');
            GameManager.removePlayer(client.id);
            sendSlotUpdate('all');
        });

        channel.on('join_request', function(msg, from) {
            console.log('join_request. from=' + (from.id || 'Unknown'));

            // Parse the JSON data received from the client.
            var joinRequestData = JSON.parse(msg);

            // Attempt to add the player to the game.
            var responseCode = GameManager.addPlayer(from.id, joinRequestData.name, joinRequestData.color);

            // Create the join response data
            var joinResponse = { name : joinRequestData.name,
                color : joinRequestData.color,
                response_code : responseCode };

            // Send a join_response back to the client
            console.log('sending join_response ' + JSON.stringify(joinResponse) + ". to=" + from.id);
            channel.publish('join_response', JSON.stringify(joinResponse), from.id);

            // If the client successfully joined, send out the slot data update.
            if (responseCode == GameManager.JoinResponseCode.SUCCESS) {
                sendSlotUpdate('all');

                // TODO: REMOVE statement below after the addPlayer method's TODO for starting the game is complete.
                sendGameStart(0);
            }
        });

        channel.on('quit', function(msg, from) {
            console.log('quit. from=' + (from.id || 'Unknown'));
            GameManager.removePlayer(from.id);
            sendSlotUpdate('all');
        });

        channel.on('rotate', function(msg, from){
            console.log('rotate. from=' + (from.id || 'Unknown'));

            // Parse the JSON data received from the client.
            var rotateData = JSON.parse(msg);

            // Rotate the player
            GameManager.onRotate(from.id, rotateData.rotate, rotateData.strength);
        });

        channel.on('thrust', function(msg, from){
            console.log('thrust. from=' + (from.id || 'Unknown'));
            GameManager.onThrust(from.id, msg == 'on');
        });

        channel.on('fire', function(msg, from){
            console.log('fire. from=' + (from.id || 'Unknown'));
            GameManager.onFire(from.id, msg == 'on');
        });
    });

    // Send a slot_update to all or a specific client.
    function sendSlotUpdate(to) {
        // Create and populate the slot data array
        var slotData = [];
        for (var i in GameManager.slots) {
            var slot = GameManager.slots[i];
            slotData[i] = { available : slot.available, color : slot.color};
        }

        // Send a slot_update to the client(s)
        console.log('sending slot_update ' + JSON.stringify(slotData) + ". to=" + to);
        channel.publish('slot_update', JSON.stringify(slotData), to);
    }

    // Send a game_start to all clients
    function sendGameStart(countdown) {
        console.log('sending game_start ' + countdown + " secs. to=all");
        channel.publish('game_start', countdown);
    }

    // Send a player_out to the client
    function sendPlayerOut(clientId, countdown) {
        console.log('sending player_out ' + countdown + " secs. to=" + clientId);
        channel.publish('player_out', countdown, clientId);
    }

    // Send a game_over to all clients
    function sendGameOver(scoreData) {
        console.log('sending game_over ' + JSON.stringify(scoreData) + '. to=all');
        channel.publish('game_over', JSON.stringify(scoreData));
    }

    // Define what is exposed on the ConnectivityManager variable.
    return {
        onGameStart: function(countdown) { return sendGameStart(countdown); },
        onPlayerOut: function(clientId, countdown) { return sendPlayerOut(clientId, countdown); },
        onGameOver: function(scoreData) { return sendGameOver(scoreData); }
    }

}());
