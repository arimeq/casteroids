package com.samsung.multiscreen.msf20.casteroids.model;

/**
 * Enumeration of all the application defined message events.
 * 
 * @author Dan McCafferty
 * 
 */
public enum Event {
    /**
     * Events that the Client Sends
     */

    // Event sent to join the game.
    JOIN("join", true),

    // Event sent to quit the game.
    QUIT("quit", true),

    // Event sent to start/stop rotation of the spacecraft
    ROTATE("rotate", true),

    // Event sent to enable/disable the spacecraft's thrust.
    THRUST("thrust", true),

    // Event sent to have the spacecraft fire a bullet.
    FIRE("fire", true),

    /**
     * Events that the Client receives
     */

    // Event receive with count down to the start of the game.
    GAME_START("game_start", false),

    // Event receive to indicate the end of the game.
    GAME_OVER("game_over", false);

    // The application defined name for the message event
    private final String name;

    // A flag indicating whether or not the event is one the client sends versus
    // one the client receives.
    private final boolean send;

    /**
     * Constructor.
     * 
     * @param name
     *            The application defined name for the message event
     * @param send
     *            A flag indicating whether or not the event is one the client sends versus one the client receives.
     */
    Event(String name, boolean send) {
        this.name = name;
        this.send = send;
    }

    /**
     * Returns the application defined name for the message event.
     * 
     * @return
     */
    public String getName() {
        return name;
    }

    /**
     * Returns a flag indicating whether or not the event is one the client sends this event.
     * 
     * @return
     */
    public boolean doesClientSend() {
        return send;
    }

    /**
     * Returns a flag indicating whether or not the event is one the client receives the event.
     * 
     * @return
     */
    public boolean doesClientReceive() {
        return !send;
    }
}
