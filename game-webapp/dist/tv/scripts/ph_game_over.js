BasicGame.GameOver = function (game) {
    this.counter = 0;
};

BasicGame.GameOver.prototype = {
    init: function (scores, names) {
        this.scores = scores;
        this.names = names;
    },
    
    create: function () {
        var sprite = this.add.sprite(0, 0, 'gameover');
        sprite.anchor.setTo(0, 0);

        var anim = this.game.add.tween(sprite.scale).to({x:1.1, y:1.1}, 10000, Phaser.Easing.Linear.None,  true, 50, -1, true);
        anim.start();

        this.counter = 0;
        var gameOver_label = "GAME OVER";
        var prompt_label = "Game will restart in 5 seconds";
        var score_label = "Scores coming soon";//: " + this.state.states['GameOver'].scores[0];
        var style = { font: "12px Arial", fill: "#cccccc", align: "left" };
        var style2 = { font: "18px Arial", fill: "#cccccc", align: "left" };
        var t = this.add.text(this.game.width / 2, this.game.height / 2 - 40, gameOver_label, style2);
        t.anchor.setTo(0.5, 0.0);
        t.font = 'Revalia';
        var t2 = this.add.text(this.game.width / 2, this.game.height / 2 + 80, prompt_label, style);
        t2.anchor.setTo(0.5, 0.0);
        t2.font = 'Revalia';
        var t3 = this.add.text(this.game.width / 2, this.game.height / 2 + 120, score_label, style);
        t3.anchor.setTo(0.5, 0.0);
        t3.font = 'Revalia';
    },

    update: function () {
        this.counter++;

        //FIXME:  Use a timer
        // wait for some time or check for something else before restarting
        //if (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
        if(this.counter > 300){
            this.back2Menu();
        }


    },

    back2Menu: function (pointer) {
        //  Then let's go back to the main menu.
        this.state.start('MainMenu');    
    }
};
